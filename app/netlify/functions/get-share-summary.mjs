import { getShareStore } from './share-store.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const token = event.queryStringParameters?.token || '';
  if (!/^[a-z0-9]{8,24}$/i.test(token)) {
    return json({ error: 'Invalid token' }, 400);
  }

  const store = getShareStore();
  const record = await store.get(token, { type: 'json' });
  if (!record) {
    return json({ error: 'Share not found' }, 404);
  }

  if (typeof record.expiresAt === 'number' && record.expiresAt < Date.now()) {
    await store.delete(token);
    return json({ error: 'Share expired' }, 410);
  }

  return json(record);
}

function json(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? 'private, max-age=60' : 'no-store',
    },
    body: JSON.stringify(body),
  };
}
