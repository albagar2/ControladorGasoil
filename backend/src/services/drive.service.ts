import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export class DriveService {
    private static getAuthClient() {
        if (process.env.GOOGLE_REFRESH_TOKEN) {
            const oAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );
            oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
            return oAuth2Client;
        } else {
            return new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
            });
        }
    }

    private static drive = google.drive({ version: 'v3', auth: DriveService.getAuthClient() });

    /**
     * Get or create a subfolder by name within a parent folder
     */
    static async getOrCreateSubfolder(parentFolderId: string, folderName: string): Promise<string | null> {
        try {
            const response = await this.drive.files.list({
                q: `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)',
                spaces: 'drive',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            } as any);

            const files = response.data.files;
            if (files && files.length > 0) {
                return files[0].id!;
            }

            // Create it if not found
            const createResponse = await this.drive.files.create({
                requestBody: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentFolderId]
                },
                fields: 'id',
                supportsAllDrives: true
            } as any);

            return createResponse.data.id!;
        } catch (error) {
            console.error(`[DriveService] Error getting/creating subfolder ${folderName}:`, error);
            return null;
        }
    }

    /**
     * Records a driver email in a standard emails.txt file in a 'Drivers' folder
     */
    static async recordDriverEmail(email: string): Promise<void> {
        try {
            const rootFolderId = process.env.GOOGLE_FOLDER_ID?.replace(/\"/g, '').trim();
            if (!rootFolderId) return;

            const driversFolderId = await this.getOrCreateSubfolder(rootFolderId, 'Drivers');
            if (!driversFolderId) return;

            // Look for emails.txt
            const fileList = await this.drive.files.list({
                q: `'${driversFolderId}' in parents and name = 'emails.txt' and trashed = false`,
                fields: 'files(id)',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            } as any);

            const files = fileList.data.files;
            let fileId = files && files.length > 0 ? files[0].id : null;

            if (fileId) {
                // Download, append if not exists, and upload
                const contentResponse = await this.drive.files.get({
                    fileId: fileId,
                    alt: 'media'
                }, { responseType: 'text' });
                
                const currentContent = contentResponse.data as string;
                if (!currentContent.includes(email)) {
                    const newContent = currentContent + (currentContent.endsWith('\n') ? '' : '\n') + email + '\n';
                    await this.drive.files.update({
                        fileId: fileId,
                        media: {
                            mimeType: 'text/plain',
                            body: newContent
                        }
                    });
                }
            } else {
                // Create new
                await this.drive.files.create({
                    requestBody: {
                        name: 'emails.txt',
                        parents: [driversFolderId]
                    },
                    media: {
                        mimeType: 'text/plain',
                        body: email + '\n'
                    }
                });
            }
        } catch (error) {
            console.error('[DriveService] Error recording driver email:', error);
        }
    }

    static async uploadFile(localPath: string, fileName: string): Promise<string | null> {
        try {
            if (!process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_EMAIL) {
                console.error('❌ Drive configuration missing. Skipping upload to Drive.');
                return null;
            }

            const rootFolderId = process.env.GOOGLE_FOLDER_ID?.replace(/\"/g, '').trim();
            if (!rootFolderId) return null;

            // Organize by Year/Month
            const now = new Date();
            const year = now.getFullYear().toString();
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const month = months[now.getMonth()];

            const yearFolderId = await this.getOrCreateSubfolder(rootFolderId, year);
            if (!yearFolderId) throw new Error(`Could not get/create year folder: ${year}`);

            const monthFolderId = await this.getOrCreateSubfolder(yearFolderId, month);
            if (!monthFolderId) throw new Error(`Could not get/create month folder: ${month}`);

            const fileMetadata = {
                name: fileName,
                parents: [monthFolderId]
            };

            const ext = path.extname(fileName).toLowerCase();
            const mimeType = ext === '.pdf' ? 'application/pdf' : (ext === '.png' ? 'image/png' : 'image/jpeg');

            console.log(`[DriveService] Uploading ${fileName} to Drive folder ${monthFolderId} (${month}) with mimeType ${mimeType}...`);

            const media = {
                mimeType,
                body: fs.createReadStream(localPath)
            };

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink, webContentLink',
                supportsAllDrives: true
            } as any);

            const fileId = response.data.id;
            if (!fileId) return null;

            // Make it public
            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            try {
                if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath);
                }
            } catch (err) {
                console.warn(`[DriveService] Could not delete local temp file: ${localPath}`);
            }

            console.log(`[DriveService] File uploaded successfully to Drive, ID: ${fileId} in ${year}/${month}`);
            return `https://drive.google.com/uc?export=view&id=${fileId}`;

        } catch (error) {
            console.error('❌ Google Drive upload failed:', error);
            return null;
        }
    }

    /**
     * Specialized method to upload a ticket with standardized naming
     */
    static async uploadTicket(localPath: string, vehicle: any, prefix: string = ''): Promise<string | null> {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;

        const cleanMatricula = vehicle?.matricula?.replace(/\s+/g, '').toUpperCase() || 'UNKNOWN';
        const fileExt = path.extname(localPath) || '.jpg';

        const fileName = `${prefix}${prefix ? '_' : ''}${timestamp}_${cleanMatricula}${fileExt}`;

        return this.uploadFile(localPath, fileName);
    }

    static async cleanupOldFiles(): Promise<number> {
        try {
            if (!process.env.GOOGLE_CLIENT_EMAIL) {
                throw new Error('Drive configuration missing.');
            }

            const folderId = process.env.GOOGLE_FOLDER_ID?.replace(/\"/g, '').trim();
            if (!folderId) throw new Error('GOOGLE_FOLDER_ID missing');

            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const timeLimit = oneYearAgo.toISOString();

            // Query files in specific folder created before the time limit
            const query = `'${folderId}' in parents and createdTime < '${timeLimit}' and trashed=false`;

            const response = await this.drive.files.list({
                q: query,
                fields: 'files(id, name)',
                spaces: 'drive',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            } as any);

            const files = response.data.files;
            if (!files || files.length === 0) {
                return 0;
            }

            let deletedCount = 0;
            for (const file of files) {
                if (file.id) {
                    await this.drive.files.delete({ fileId: file.id });
                    deletedCount++;
                }
            }

            return deletedCount;

        } catch (error) {
            console.error('❌ Google Drive cleanup failed:', error);
            throw error;
        }
    }

    /**
     * Proactively creates the folder for the current Year and Month
     */
    static async prepareMonthlyFolders(): Promise<void> {
        try {
            const rootFolderId = process.env.GOOGLE_FOLDER_ID?.replace(/\"/g, '').trim();
            if (!rootFolderId) return;

            const now = new Date();
            const year = now.getFullYear().toString();
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const month = months[now.getMonth()];

            console.log(`[DriveService] Preparing folders for ${year}/${month}...`);
            const yearFolderId = await this.getOrCreateSubfolder(rootFolderId, year);
            if (yearFolderId) {
                await this.getOrCreateSubfolder(yearFolderId, month);
            }
        } catch (error) {
            console.error('[DriveService] Error pre-creating monthly folders:', error);
        }
    }
}
