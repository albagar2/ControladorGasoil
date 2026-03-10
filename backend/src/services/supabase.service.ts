import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

let supabase: any = null;

const isValidUrl = /^https?:\/\//i.test(supabaseUrl);

if (isValidUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
        console.error('❌ Failed to create Supabase client:', e);
    }
} else {
    console.warn('⚠️ Supabase URL or Key missing or invalid. Storage service will not be available.');
}

export class SupabaseService {
    private static bucketName = 'uploads';

    static async uploadFile(localPath: string, fileName: string): Promise<string | null> {
        if (!supabase) {
            console.error('❌ Supabase service not initialized. Check environment variables.');
            return null;
        }
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
