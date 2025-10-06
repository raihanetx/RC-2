import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json([]);
    }

    const files = await readdir(uploadsDir);
    const fileList = [];

    for (const file of files) {
      const filePath = join(uploadsDir, file);
      const stats = await stat(filePath);
      
      fileList.push({
        filename: file,
        url: `/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        type: getFileType(file)
      });
    }

    // Sort by creation date (newest first)
    fileList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv'];
  const audioTypes = ['mp3', 'wav', 'ogg'];

  if (imageTypes.includes(ext || '')) return `image/${ext}`;
  if (documentTypes.includes(ext || '')) return `application/${ext}`;
  if (videoTypes.includes(ext || '')) return `video/${ext}`;
  if (audioTypes.includes(ext || '')) return `audio/${ext}`;
  
  return 'application/octet-stream';
}