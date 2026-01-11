import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import mime from 'mime';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const filePath = join(process.cwd(), 'public', 'uploads', ...params.path);

        // Verify file exists
        await stat(filePath);

        // Read file
        const fileBuffer = await readFile(filePath);

        // Determine content type
        const contentType = mime.getType(filePath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('File not found', { status: 404 });
    }
}
