/**
 * EdgeOne Pages Edge Function — 医生分享短链 API
 *
 * POST /api/share-summary  → 创建分享，存入 KV，返回 { token, expiresAt }
 * GET  /api/share-summary?token=xxx → 读取分享数据
 *
 * KV 命名空间变量名: doctor_shares（需在 EdgeOne 控制台绑定）
 */

const MAX_BODY_BYTES = 24 * 1024;
const EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

// ─── POST ───────────────────────────────────────────────
export async function onRequestPost({ request }) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'Payload too large' }, 413);
  }

  let body;
  try {
    body = await request.json();
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

  await doctor_shares.put(token, JSON.stringify(record));

  return json({ token, expiresAt: record.expiresAt });
}

// ─── GET ────────────────────────────────────────────────
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return json({ error: 'Missing token parameter' }, 400);
  }

  const raw = await doctor_shares.get(token);
  if (!raw) {
    return json({ error: '分享不存在或已被删除' }, 404);
  }

  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    return json({ error: '数据损坏' }, 500);
  }

  // 检查过期
  if (record.expiresAt && record.expiresAt < Date.now()) {
    await doctor_shares.delete(token);
    return json({ error: '分享已过期，请让患者重新生成' }, 410);
  }

  return json(record);
}

// ─── OPTIONS (CORS preflight) ───────────────────────────
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// ─── Helpers ────────────────────────────────────────────

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
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...corsHeaders(),
    },
  });
}
