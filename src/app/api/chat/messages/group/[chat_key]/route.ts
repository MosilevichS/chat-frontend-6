import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chat_key: string }> }
) {
  const { chat_key } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '50';

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
  }

  try {
    console.log(`📁 Fetching group messages for chat ${chat_key}, page ${page}, pageSize ${pageSize}`);
    
    // Сначала нужно получить информацию о чате, чтобы узнать virtual_user_uid
    const chatInfoResponse = await fetch(
      `${process.env.API_URL}/api/v1/chat/list/groups_or_channels/${chat_key}/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!chatInfoResponse.ok) {
      console.error('Failed to fetch chat info:', chatInfoResponse.status);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const chatInfo = await chatInfoResponse.json();
    const virtualUserUid = chatInfo.chat?.uid; // UID виртуального пользователя группы/канала

    if (!virtualUserUid) {
      console.error('No virtual user UID found for chat:', chat_key);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    console.log('Using virtual user UID:', virtualUserUid);

    // Используем эндпоинт с virtual_user_uid
    const response = await fetch(
      `${process.env.API_URL}/api/v1/chat/message/text/${virtualUserUid}/?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = await response.json();
    console.log('✅ Messages fetched successfully, count:', data.results?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching group messages:', error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}