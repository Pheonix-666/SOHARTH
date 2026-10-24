import { NextRequest, NextResponse } from 'next/server';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/lib/cloudinary';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file = data.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 1. Try Cloudinary if credentials are configured
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET) {
            try {
                const result = await new Promise<UploadApiResponse>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'soharth' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result as UploadApiResponse);
                        }
                    ).end(buffer);
                });

                if (result?.secure_url) {
                    return NextResponse.json({ url: result.secure_url });
                }
            } catch (cldErr: any) {
                console.warn('Cloudinary upload failed, falling back to Supabase Storage:', cldErr?.message || cldErr);
            }
        }

        // 2. Fallback to Supabase Storage (product-images bucket)
        const ext = file.name ? file.name.split('.').pop() : 'jpg';
        const cleanExt = (ext && /^[a-zA-Z0-9]+$/.test(ext)) ? ext : 'jpg';
        const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(filename, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
        }

        const { data: publicData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filename);

        if (!publicData?.publicUrl) {
            return NextResponse.json({ error: 'Failed to retrieve uploaded image public URL' }, { status: 500 });
        }

        return NextResponse.json({ url: publicData.publicUrl });
    } catch (err: any) {
        console.error('Image upload error:', err);
        return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
    }
}