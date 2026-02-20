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
    console.log(`Fetching messages for chat ${chat_key}, page ${page}, pageSize ${pageSize}`);
    
    // Для групп и каналов используем эндпоинт с chat_key
    // В документации API: /api/v1/chat/message/text/{chat_key}/
    const response = await fetch(
      `${process.env.API_URL}/api/v1/chat/message/text/${chat_key}/?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Если 400, пробуем альтернативный эндпоинт
      if (response.status === 400) {
        console.log('Trying alternative endpoint for group messages...');
        const altResponse = await fetch(
          `${process.env.API_URL}/api/v1/chat/message/group/${chat_key}/?page=${page}&page_size=${pageSize}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          return NextResponse.json(altData);
        }
      }
      
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return NextResponse.json(
        { error: 'Ошибка при получении сообщений', results: [] }, // Возвращаем пустой массив
        { status: 200 } // Возвращаем 200 с пустым массивом, чтобы UI не падал
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    // Возвращаем пустой массив вместо ошибки
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}