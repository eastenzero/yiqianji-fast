import { randomBytes } from 'node:crypto';
import { getShareStore } from './share-store.mjs';

const MAX_BODY_BYTES = 24 * 1024;
const EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const contentLength = Number(getHeader(event.headers, 'content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'Payload too large' }, 413);
  }

  let body;
  try {
    body = JSON.parse(event.body || '');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const payload = sanitizePayload(body);
  if (!payload) {
    return json({ error: 'Invalid share payload' }, 400);
  }

  const token = createToken();
  const now = Date.now();
  const record = {
    ...payload,
    createdAt: now,
    expiresAt: now + EXPIRES_IN_MS,
  };

  const store = getShareStore();
  await store.setJSON(token, record, {
    metadata: {
      expiresAt: String(record.expiresAt),
    },
  });

  return json({ token, expiresAt: record.expiresAt });
}

function getHeader(headers, key) {
  if (!headers) return '';
  return headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()] || '';
}

function sanitizePayload(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.v !== 1) return null;
  const s = value.summary;
  if (!s || typeof s !== 'object') return null;

  const from = asNumber(s.from);
  const to = asNumber(s.to);
  if (!from || !to) return null;

  return {
    v: 1,
    patientName: trimString(value.patientName, 40),
    summary: {
      id: trimString(s.id, 64) || 'share',
      patientId: 'shared',
      from,
      to,
      chiefComplaint: trimString(s.chiefComplaint, 600),
      symptoms: trimString(s.symptoms, 1200),
      vitalsTrend: trimString(s.vitalsTrend, 1200),
      medications: trimString(s.medications, 1200),
      lifestyle: trimString(s.lifestyle, 1200),
      reportHighlights: trimString(s.reportHighlights, 1200),
      focusPoints: Array.isArray(s.focusPoints)
        ? s.focusPoints.map((item) => trimString(item, 200)).filter(Boolean).slice(0, 8)
        : [],
      markdown: '',
      createdAt: asNumber(s.createdAt) || Date.now(),
      updatedAt: asNumber(s.updatedAt) || Date.now(),
    },
  };
}

function trimString(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function createToken() {
  return Array.from(randomBytes(9), (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 12);
}

function json(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}
