import type { ConsultationSummary } from '@/types';

export interface DoctorSharePayload {
  v: 1;
  patientName?: string;
  summary: ConsultationSummary;
}

export interface PublishedDoctorShare {
  token: string;
  expiresAt: number;
  url: string;
}

interface ShareApiResponse {
  token: string;
  expiresAt: number;
}

interface StoredShareResponse extends DoctorSharePayload {
  createdAt?: number;
  expiresAt?: number;
}

export function createDoctorSharePayload(
  summary: ConsultationSummary,
  patientName?: string,
): DoctorSharePayload {
  return {
    v: 1,
    patientName,
    summary: {
      ...summary,
      patientId: 'shared',
      markdown: '',
    },
  };
}

export async function publishDoctorShare(
  summary: ConsultationSummary,
  patientName?: string,
): Promise<PublishedDoctorShare> {
  const response = await fetch(getShareApiUrl(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(createDoctorSharePayload(summary, patientName)),
  });

  if (!response.ok) {
    throw new Error(await readError(response, '短链生成失败，请稍后重试'));
  }

  const data = (await response.json()) as ShareApiResponse;
  if (!data.token) throw new Error('短链生成失败，请稍后重试');

  return {
    token: data.token,
    expiresAt: data.expiresAt,
    url: createPublishedShareUrl(data.token),
  };
}

export async function fetchDoctorShare(token: string): Promise<DoctorSharePayload> {
  const response = await fetch(getShareApiUrl(token));
  if (!response.ok) {
    if (response.status === 404) throw new Error('分享不存在或已被删除');
    if (response.status === 410) throw new Error('分享已过期，请让患者重新生成');
    throw new Error(await readError(response, '分享读取失败，请稍后重试'));
  }

  const data = (await response.json()) as StoredShareResponse;
  if (data.v !== 1 || !data.summary) throw new Error('分享内容格式无效');
  return {
    v: 1,
    patientName: typeof data.patientName === 'string' ? data.patientName : undefined,
    summary: data.summary,
  };
}

export function createPublishedShareUrl(token: string): string {
  return new URL(`/s/${encodeURIComponent(token)}`, window.location.origin).toString();
}

export function hasShareApiBackend(): boolean {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  return Boolean(env.VITE_DOCTOR_SHARE_API_BASE);
}

function getShareApiUrl(token?: string): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  const base = (env.VITE_DOCTOR_SHARE_API_BASE || '/api/share-summary').replace(/\/+$/, '');
  return token ? `${base}/${encodeURIComponent(token)}` : base;
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}
