import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Stethoscope, ChevronLeft, AlertCircle, Info, Copy, Check, Share2, Loader2 } from 'lucide-react';
import { db } from '@/services/storage';
import { fetchDoctorShare, publishDoctorShare, hasShareApiBackend, type PublishedDoctorShare } from '@/services/doctor-share';
import type { ConsultationSummary, Patient } from '@/types';
import { formatFriendlyDate } from '@/lib/utils';

const OFFLINE_QR_MAX_BYTES = 2200;
const OFFLINE_QR_BUDGETS = [
  { c: 120, sy: 180, vt: 180, me: 140, li: 100, rh: 140, fp: 3, fpc: 50 },
  { c: 80, sy: 120, vt: 120, me: 100, li: 80, rh: 100, fp: 3, fpc: 40 },
  { c: 50, sy: 80, vt: 80, me: 60, li: 50, rh: 60, fp: 2, fpc: 30 },
  { c: 40, sy: 60, vt: 60, me: 50, li: 40, rh: 50, fp: 1, fpc: 30 },
] as const;

/**
 * 医生端查看页。有两种访问方式：
 * 1. 患者自己打开（显示二维码供医生扫）
 * 2. 医生扫码打开（看到完整摘要）
 *
 * 判断方式：URL 参数 ?view=doctor 表示医生视角
 */
export default function DoctorView() {
  const { summaryId, shareToken } = useParams();
  const params = new URLSearchParams(window.location.search);
  const isDoctorView = params.get('view') === 'doctor' || Boolean(shareToken);

  const [summary, setSummary] = useState<ConsultationSummary | null | undefined>(undefined);
  const [patient, setPatient] = useState<Patient | undefined>();
  const [sharedPatientName, setSharedPatientName] = useState<string | undefined>();
  const [publishedShare, setPublishedShare] = useState<PublishedDoctorShare | null>(null);
  const shareApiAvailable = hasShareApiBackend();
  const [useOfflineQr, setUseOfflineQr] = useState(!shareApiAvailable);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const canUseSystemShare = typeof navigator.share === 'function';

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setPublishedShare(null);
    setUseOfflineQr(!shareApiAvailable);
    (async () => {
      if (shareToken) {
        try {
          const shared = await fetchDoctorShare(shareToken);
          if (cancelled) return;
          setSummary(shared.summary);
          setPatient(undefined);
          setSharedPatientName(shared.patientName);
        } catch (e) {
          if (cancelled) return;
          setLoadError(e instanceof Error ? e.message : '分享读取失败');
          setSummary(null);
        }
        return;
      }
      if (!summaryId) {
        const shared = readSharedSummaryFromUrl();
        if (shared) {
          if (cancelled) return;
          setSummary(shared.summary);
          setPatient(undefined);
          setSharedPatientName(shared.patientName);
          return;
        }
        if (cancelled) return;
        setSummary(null);
        return;
      }
      const s = await db.summaries.get(summaryId);
      if (!s) {
        const shared = readSharedSummaryFromUrl();
        if (shared && (shared.summary.id === summaryId || summaryId === 'share')) {
          if (cancelled) return;
          setSummary(shared.summary);
          setPatient(undefined);
          setSharedPatientName(shared.patientName);
          return;
        }
        if (cancelled) return;
        setSummary(null);
        return;
      }
      if (cancelled) return;
      setSummary(s);
      const p = await db.patients.get(s.patientId);
      if (cancelled) return;
      setPatient(p);
      setSharedPatientName(undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [summaryId, shareToken]);

  const offlineShareUrl = useMemo(() => {
    if (!summary) return '';
    return createDoctorShareUrl(summary, patient?.name ?? sharedPatientName);
  }, [summary, patient?.name, sharedPatientName]);
  const offlineQrUrl = useMemo(() => {
    if (!summary) return '';
    return createDoctorShareUrl(summary, patient?.name ?? sharedPatientName, OFFLINE_QR_MAX_BYTES);
  }, [summary, patient?.name, sharedPatientName]);
  const offlineShareBytes = useMemo(
    () => (offlineShareUrl ? new TextEncoder().encode(offlineShareUrl).length : 0),
    [offlineShareUrl],
  );
  const offlineQrBytes = useMemo(
    () => (offlineQrUrl ? new TextEncoder().encode(offlineQrUrl).length : 0),
    [offlineQrUrl],
  );
  const canShowOfflineQr = Boolean(offlineQrUrl) && offlineQrBytes <= OFFLINE_QR_MAX_BYTES;
  const activeQrUrl = publishedShare?.url ?? (useOfflineQr && canShowOfflineQr ? offlineQrUrl : '');
  const shareUrl = activeQrUrl || offlineShareUrl;
  const isUsingOfflineQr = !publishedShare && Boolean(activeQrUrl);

  useEffect(() => {
    if (!shareApiAvailable || !summary || isDoctorView || publishedShare || useOfflineQr || publishing) return;
    let cancelled = false;
    (async () => {
      setShareError(null);
      setPublishing(true);
      try {
        const published = await publishDoctorShare(summary, patient?.name ?? sharedPatientName);
        if (cancelled) return;
        setPublishedShare(published);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : '短链生成失败';
        if (canShowOfflineQr) {
          setUseOfflineQr(true);
          setShareError(`${message}。已自动切换为离线备用二维码。`);
        } else {
          setShareError(`${message}。离线备用链接较长，请展开下方备用链接手动复制。`);
        }
      } finally {
        if (!cancelled) setPublishing(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, isDoctorView, shareApiAvailable]);

  const handlePublishShare = async () => {
    if (!summary || publishing) return;
    setShareError(null);
    setPublishing(true);
    try {
      const published = await publishDoctorShare(summary, patient?.name ?? sharedPatientName);
      setPublishedShare(published);
      setUseOfflineQr(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : '短链生成失败，请稍后重试';
      if (canShowOfflineQr) {
        setUseOfflineQr(true);
        setShareError(`${message}。已自动切换为离线备用二维码。`);
      } else {
        setShareError(`${message}。离线备用链接较长，请展开下方备用链接手动复制。`);
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    setShareError(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1600);
    } catch {
      setShareError('复制失败，请手动长按链接复制');
    }
  };

  const handleSystemShare = async () => {
    if (!shareUrl || !canUseSystemShare) return;
    setShareError(null);
    try {
      await navigator.share({
        title: '医前记 · 就诊前摘要',
        text: '这是一份由医前记整理的就诊前摘要，仅作信息归纳，不替代医生诊断。',
        url: shareUrl,
      });
    } catch {
      setShareError(null);
    }
  };

  const handleUseOfflineQr = () => {
    if (!canShowOfflineQr) {
      setShareError('离线备用链接较长，不建议生成二维码，请展开下方备用链接手动复制。');
      return;
    }
    setUseOfflineQr(true);
    setShareError(null);
  };

  if (summary === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-outline">加载中…</div>;
  }

  if (summary === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-error" />
        <h2 className="text-xl font-bold text-on-surface">{loadError || '摘要不存在或已被删除'}</h2>
        <Link to="/" className="text-primary underline">回到首页</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            to="/summary"
            className="flex items-center gap-1 text-secondary hover:text-primary transition text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </Link>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            <span className="font-bold text-primary font-headline">医前记 · 医生视图</span>
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {!isDoctorView && (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-primary/20">
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              分享二维码给医生
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {activeQrUrl ? (
                <div className="p-3 bg-white border-4 border-primary-fixed rounded-xl">
                  <QRCodeSVG
                    value={activeQrUrl}
                    size={156}
                    level={publishedShare ? 'M' : 'L'}
                  />
                  <p className="mt-2 text-center text-xs font-semibold text-primary">
                    {publishedShare ? '短链二维码' : '离线备用二维码'}
                  </p>
                </div>
              ) : (
                <div className="w-[188px] min-h-[188px] p-5 bg-primary-fixed/40 border-4 border-primary-fixed rounded-xl flex flex-col items-center justify-center text-center gap-2">
                  <Share2 className="w-9 h-9 text-primary" />
                  <p className="text-sm font-bold text-on-surface">{canShowOfflineQr ? '备用二维码' : '备用链接较长'}</p>
                  <p className="text-xs text-secondary leading-relaxed">
                    {canShowOfflineQr ? '使用不依赖服务器的离线分享方式。' : '请展开下方备用链接手动复制。'}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-2 text-sm text-secondary">
                <p className="text-on-surface font-semibold">
                  {publishedShare ? '短链已生成' : isUsingOfflineQr ? '离线备用二维码已生成' : shareApiAvailable ? '可生成短链二维码' : '准备生成二维码'}
                </p>
                {isUsingOfflineQr ? (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>当前使用不依赖服务器的备用二维码。</li>
                    <li>备用二维码包含精简摘要数据，医生扫码后可直接查看本次摘要。</li>
                    <li>备用链接比短链更长，少数扫码器可能识别较慢。</li>
                    <li>请仅分享给接诊医生或授权评审人员。</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>二维码只包含短链接，信息密度低，更容易扫码。</li>
                    <li>医生打开短链接后，由线上临时分享存储读取本次摘要。</li>
                    <li>分享内容仅包含摘要字段，不包含原始报告图片或完整本地数据库。</li>
                    <li>请仅分享给接诊医生或授权评审人员。</li>
                  </ul>
                )}
                {publishedShare && (
                  <div className="mt-3 rounded-lg bg-primary-fixed/45 border border-primary/10 px-3 py-2 text-xs text-primary">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-semibold">{publishedShare.url}</span>
                      <span className="shrink-0 text-secondary">
                        {new TextEncoder().encode(publishedShare.url).length} bytes
                      </span>
                    </div>
                    <p className="mt-1 text-secondary">有效至 {formatFriendlyDate(publishedShare.expiresAt)}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeQrUrl ? (
                    <>
                      <button
                        onClick={handleCopyShareUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-3 py-2 font-semibold active:scale-95 transition"
                      >
                        {shareCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {shareCopied ? '已复制' : publishedShare ? '复制短链接' : '复制备用链接'}
                      </button>
                      {canUseSystemShare && (
                        <button
                          onClick={handleSystemShare}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-fixed text-primary px-3 py-2 font-semibold active:scale-95 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          系统分享
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {shareApiAvailable && (
                        <button
                          onClick={handlePublishShare}
                          disabled={publishing}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-3 py-2 font-semibold active:scale-95 transition disabled:opacity-60"
                        >
                          {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                          {publishing ? '生成中…' : '生成短链二维码'}
                        </button>
                      )}
                      <button
                        onClick={handleUseOfflineQr}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-fixed text-primary px-3 py-2 font-semibold active:scale-95 transition"
                      >
                        {shareApiAvailable ? '使用备用二维码' : '生成离线二维码'}
                      </button>
                    </>
                  )}
                </div>
                {shareError && <p className="text-xs text-error">{shareError}</p>}
                <details className="pt-2 text-xs text-on-surface-variant">
                  <summary className="cursor-pointer text-outline font-semibold">离线备用链接</summary>
                  <div className="mt-2 rounded-lg bg-surface-container-low border border-surface-container-high px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-on-surface font-medium">
                        {offlineShareUrl ? new URL(offlineShareUrl).origin : ''}
                      </span>
                      <span className="shrink-0 text-outline">
                        {offlineShareUrl ? `${new TextEncoder().encode(offlineShareUrl).length} bytes` : ''}
                      </span>
                    </div>
                    <p className="mt-2 break-all leading-relaxed">{offlineShareUrl}</p>
                  </div>
                </details>
              </div>
            </div>
          </section>
        )}

        <SummaryCard summary={summary} patientName={patient?.name ?? sharedPatientName} />

        <div className="text-center text-xs text-outline py-4">
          本摘要由「医前记」自动整理，仅供参考，不作诊断结论。
        </div>
      </main>
    </div>
  );
}

interface SharedSummaryPayload {
  v: 1;
  patientName?: string;
  summary: ConsultationSummary;
}

interface CompactSharedSummaryPayload {
  v: 2;
  n?: string;
  s: {
    i?: string;
    f?: number;
    t?: number;
    c?: string;
    sy?: string;
    vt?: string;
    me?: string;
    li?: string;
    rh?: string;
    fp?: string[];
  };
}

function createDoctorShareUrl(
  summary: ConsultationSummary,
  patientName?: string,
  maxBytes?: number,
): string {
  const budgets = maxBytes ? [undefined, ...OFFLINE_QR_BUDGETS] : [undefined];
  let fallback = '';
  for (const budget of budgets) {
    const url = buildDoctorShareUrl(summary, patientName, budget);
    fallback = url;
    if (!maxBytes || new TextEncoder().encode(url).length <= maxBytes) return url;
  }
  return fallback;
}

function buildDoctorShareUrl(
  summary: ConsultationSummary,
  patientName?: string,
  budget?: (typeof OFFLINE_QR_BUDGETS)[number],
): string {
  const payload: CompactSharedSummaryPayload = {
    v: 2,
    n: patientName,
    s: compactSummary(summary, budget),
  };
  const url = new URL('/doctor-view/share', window.location.origin);
  url.searchParams.set('view', 'doctor');
  url.hash = `d=${encodeText(JSON.stringify(payload))}`;
  return url.toString();
}

function readSharedSummaryFromUrl(): { summary: ConsultationSummary; patientName?: string } | null {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const token = hashParams.get('d') ?? hashParams.get('data');
  if (!token) return null;
  try {
    const parsed = JSON.parse(decodeText(token)) as Partial<SharedSummaryPayload | CompactSharedSummaryPayload>;
    if (parsed.v === 2) return readCompactSharedSummary(parsed);
    if (parsed.v === 1 && isConsultationSummary(parsed.summary)) {
      return {
        summary: parsed.summary,
        patientName: typeof parsed.patientName === 'string' ? parsed.patientName : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function compactSummary(
  summary: ConsultationSummary,
  budget?: (typeof OFFLINE_QR_BUDGETS)[number],
): CompactSharedSummaryPayload['s'] {
  return stripEmpty({
    i: summary.id,
    f: summary.from,
    t: summary.to,
    c: truncateText(summary.chiefComplaint, budget?.c),
    sy: truncateText(summary.symptoms, budget?.sy),
    vt: truncateText(summary.vitalsTrend, budget?.vt),
    me: truncateText(summary.medications, budget?.me),
    li: truncateText(summary.lifestyle, budget?.li),
    rh: truncateText(summary.reportHighlights, budget?.rh),
    fp: budget
      ? summary.focusPoints.slice(0, budget.fp).map((item) => truncateText(item, budget.fpc))
      : summary.focusPoints,
  });
}

function truncateText(value: string, max?: number): string {
  if (!max || value.length <= max) return value;
  return value.slice(0, max);
}

function stripEmpty<T extends Record<string, unknown>>(value: T): T {
  const entries = Object.entries(value).filter(([, v]) => {
    if (v === undefined || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
  return Object.fromEntries(entries) as T;
}

function readCompactSharedSummary(
  payload: Partial<CompactSharedSummaryPayload>,
): { summary: ConsultationSummary; patientName?: string } | null {
  if (!payload.s || typeof payload.s !== 'object') return null;
  const s = payload.s;
  const to = typeof s.t === 'number' ? s.t : Date.now();
  const from = typeof s.f === 'number' ? s.f : to;
  return {
    summary: {
      id: typeof s.i === 'string' ? s.i : 'share',
      patientId: 'shared',
      from,
      to,
      chiefComplaint: typeof s.c === 'string' ? s.c : '',
      symptoms: typeof s.sy === 'string' ? s.sy : '',
      vitalsTrend: typeof s.vt === 'string' ? s.vt : '',
      medications: typeof s.me === 'string' ? s.me : '',
      lifestyle: typeof s.li === 'string' ? s.li : '',
      reportHighlights: typeof s.rh === 'string' ? s.rh : '',
      focusPoints: Array.isArray(s.fp) ? s.fp.filter((item): item is string => typeof item === 'string') : [],
      markdown: '',
      createdAt: to,
      updatedAt: to,
    },
    patientName: typeof payload.n === 'string' ? payload.n : undefined,
  };
}

function isConsultationSummary(value: unknown): value is ConsultationSummary {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<ConsultationSummary>;
  const stringFields: Array<keyof ConsultationSummary> = [
    'id',
    'patientId',
    'chiefComplaint',
    'symptoms',
    'vitalsTrend',
    'medications',
    'lifestyle',
    'reportHighlights',
    'markdown',
  ];
  return (
    stringFields.every((key) => typeof s[key] === 'string') &&
    typeof s.from === 'number' &&
    typeof s.to === 'number' &&
    typeof s.createdAt === 'number' &&
    typeof s.updatedAt === 'number' &&
    Array.isArray(s.focusPoints)
  );
}

function encodeText(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeText(token: string): string {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function SummaryCard({
  summary,
  patientName,
}: {
  summary: ConsultationSummary;
  patientName?: string;
}) {
  return (
    <article className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-surface-container space-y-6">
      <header className="pb-4 border-b border-dashed border-surface-container-high">
        <div className="text-xs font-bold text-primary-container uppercase tracking-widest mb-1">
          Consultation Summary
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          {patientName || '患者'} 就诊前摘要
        </h1>
        <div className="text-xs text-outline mt-2">
          覆盖 {formatFriendlyDate(summary.from)} – {formatFriendlyDate(summary.to)}
          {' · '}ID: {summary.id.slice(-8)}
        </div>
      </header>

      {summary.chiefComplaint && (
        <section>
          <h2 className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">
            核心主诉
          </h2>
          <p className="text-lg font-medium text-on-surface bg-primary-fixed/30 rounded-lg p-4 leading-relaxed">
            {summary.chiefComplaint}
          </p>
        </section>
      )}

      {summary.focusPoints?.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">
            供医生核对的信息
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            {summary.focusPoints.map((p, i) => (
              <li key={i} className="text-sm text-on-surface">
                {p}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.symptoms && <Field title="症状详情">{summary.symptoms}</Field>}
        {summary.vitalsTrend && <Field title="体征趋势">{summary.vitalsTrend}</Field>}
        {summary.medications && <Field title="用药情况">{summary.medications}</Field>}
        {summary.lifestyle && <Field title="生活习惯">{summary.lifestyle}</Field>}
        {summary.reportHighlights && (
          <div className="md:col-span-2">
            <Field title="报告异常点">{summary.reportHighlights}</Field>
          </div>
        )}
      </div>
    </article>
  );
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-bold text-primary-container mb-1.5 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-sm text-on-surface leading-relaxed">{children}</p>
    </section>
  );
}
