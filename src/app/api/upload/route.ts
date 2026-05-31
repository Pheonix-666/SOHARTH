import { NextRequest, NextResponse } from 'next/server';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'soharth' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result as UploadApiResponse);
            }
        ).end(buffer);
    });
    if (!result?.secure_url) {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url: result.secure_url });
}