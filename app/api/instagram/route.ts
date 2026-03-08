import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  // If no token, return mock data for development
  if (!token) {
    console.warn('INSTAGRAM_ACCESS_TOKEN is not defined. Returning mock data.');
    return NextResponse.json({
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `mock_${i}`,
        media_url: `https://picsum.photos/seed/${i + 10}/600/600`,
        permalink: 'https://www.instagram.com/hedoomyy/',
        caption: 'Mock Instagram Post',
        timestamp: new Date().toISOString(),
      })),
    });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=10&access_token=${token}`,
      {
        next: { revalidate: 1800 }, // 30 minutes
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
