import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function uploadToSupabase(fileBuffer, filePath) {
    const { data, error } = await supabase.storage
        .from(process.env.STORAGE_BUCKET)
        .upload(filePath, fileBuffer, { contentType: 'image/jpeg' });

    if (error) throw error;
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.STORAGE_BUCKET}/${filePath}`;
}

export default supabase;
