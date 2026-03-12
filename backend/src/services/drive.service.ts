import { google } from 'googleapis';
import fs from 'fs';
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

    static async uploadFile(localPath: string, fileName: string): Promise<string | null> {
        try {
            if (!process.env.GOOGLE_CLIENT_EMAIL) {
                console.error('❌ Drive configuration missing. Skipping upload to Drive.');
                return null;
            }

            const folderId = process.env.GOOGLE_FOLDER_ID;

            const fileMetadata = {
                name: fileName,
                parents: folderId ? [folderId] : undefined
            };

            const media = {
                mimeType: 'image/jpeg', // Best effort default, could be derived from extension
                body: fs.createReadStream(localPath)
            };

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink, webContentLink'
            });

            const fileId = response.data.id;
            if (!fileId) return null;

            // Make it public so frontend can show it in <img> tags
            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            try {
                fs.unlinkSync(localPath);
            } catch (err) {
                console.warn(`[DriveService] Could not delete local temp file: ${localPath}`);
            }

            console.log(`[DriveService] File uploaded successfully to Drive, ID: ${fileId}`);
            return `https://drive.google.com/uc?export=view&id=${fileId}`;

        } catch (error) {
            console.error('❌ Google Drive upload failed:', error);
            return null;
        }
    }

    static async cleanupOldFiles(): Promise<number> {
        try {
            if (!process.env.GOOGLE_CLIENT_EMAIL) {
                throw new Error('Drive configuration missing.');
            }

            const folderId = process.env.GOOGLE_FOLDER_ID;
            if (!folderId) throw new Error('GOOGLE_FOLDER_ID missing');

            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const timeLimit = oneYearAgo.toISOString();

            // Query files in specific folder created before the time limit
            const query = `'${folderId}' in parents and createdTime < '${timeLimit}' and trashed=false`;

            const response = await this.drive.files.list({
                q: query,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

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
}
