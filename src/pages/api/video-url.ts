export const prerender = false;

import type { APIRoute } from 'astro';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: import.meta.env.S3_REGION!,
  credentials: {
    accessKeyId: import.meta.env.S3_KEY!,
    secretAccessKey: import.meta.env.S3_SECRET!,
  },
});

export const GET: APIRoute = async ({ request }) => {
  const fullUrl = new URL(request.url);
  const file = fullUrl.searchParams.get('file');

  console.log('FULL URL:', fullUrl.href);
  console.log('FILE PARAM:', file);

  if (!file) {
    return new Response('Missing "file" param', { status: 400 });
  }

  const command = new GetObjectCommand({
    Bucket: import.meta.env.S3_BUCKET!,
    Key: file,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return new Response(JSON.stringify({ url: signedUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error signing URL:', err);
    return new Response('Error generating signed URL', { status: 500 });
  }
};
