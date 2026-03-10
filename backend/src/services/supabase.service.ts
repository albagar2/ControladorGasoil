import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Key missing. Storage service will not be available.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
    private static bucketName = 'uploads';

    static async uploadFile(localPath: string, fileName: string): Promise<string | null> {
        try {
            const fileBuffer = fs.readFileSync(localPath);

            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(fileName, fileBuffer, {
                    upsert: true,
                    contentType: 'image/jpeg' // Or detect from extension
                });

            if (error) {
                console.error('❌ Error uploading to Supabase:', error.message);
                return null;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);

            // Clean up local file after successful upload
            try {
                fs.unlinkSync(localPath);
            } catch (err) {
                console.warn(`[SupabaseService] Could not delete local temp file: ${localPath}`);
            }

            console.log(`[SupabaseService] File uploaded successfully to: ${publicUrl}`);
            return publicUrl;
        } catch (error) {
            console.error('❌ Supabase upload failed:', error);
            return null;
        }
    }
}
