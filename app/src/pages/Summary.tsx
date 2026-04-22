import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, Share2, Clock, KeyRound, RefreshCw } from 'lucide-react';
import { db } from '@/services/storage';
import { useAppStore } from '@/stores/app-store';
import { generateConsultationSummary } from '@/services/summary';
import { hasValidAPIKey } from '@/lib/config';
import { formatFriendlyDate } from '@/lib/utils';

export default function Summary() {
  const patientId = useAppStore((s) => s.currentPatientId)!;
  const latest = useLiveQuery(
    async () => {
      const all = await db.summaries.where('patientId').equals(patientId).toArray();
      return all.sort((a, b) => b.createdAt - a.createdAt)[0];
    },
    [patientId],
  );

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!hasValidAPIKey()) {
      setError('请先在"设置"页填入通义千问 API Key');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      await generateConsultationSummary({ patientId, days: 14 });
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface font-headline">就诊前摘要</h2>
          <p className="text-secondary text-sm mt-1">
            基于近 14 天记录，AI 自动整理医生可读的摘要
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-5 h-12 rounded-xl bg-gradient-medical text-white font-semibold shadow-lg active:scale-95 transition disabled:opacity-60 flex items-center gap-2 shrink-0"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中…
            </>
          ) : latest ? (
            <>
              <RefreshCw className="w-4 h-4" />
              重新生成
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              生成摘要
            </>
          )}
        </button>
      </header>

      {!hasValidAPIKey() && (
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl bg-tertiary-fixed/80 text-on-tertiary-fixed px-5 py-4 border border-tertiary/20 hover:bg-tertiary-fixed transition"
        >
          <KeyRound className="w-5 h-5 text-tertiary" />
          <div className="flex-1">
            <div className="font-bold text-sm">先填入通义千问 API Key</div>
            <div className="text-xs opacity-80">生成摘要需要调用 AI</div>
          </div>
        </Link>
      )}

      {error && (
        <div className="flex items-center gap-2 text-error bg-error-container/40 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-all">{error}</span>
        </div>
      )}

      {!latest && !generating && (
        <div className="bg-white rounded-xl p-10 text-center border border-surface-container">
          <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <h3 className="font-bold text-on-surface mb-2">还没有生成过摘要</h3>
          <p className="text-secondary text-sm">
            点击右上角按钮，让 AI 帮你整理近 14 天的就诊前重点。
          </p>
        </div>
      )}

      {latest && (
        <article className="bg-white rounded-xl p-8 shadow-sm border border-primary/10 space-y-6">
          {/* 元信息 */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-dashed border-surface-container-high">
            <div className="flex items-center gap-2 text-xs text-secondary">
              <Clock className="w-3.5 h-3.5" />
              生成于 {formatFriendlyDate(latest.createdAt)}
              {' · '}
              覆盖 {formatFriendlyDate(latest.from)} – {formatFriendlyDate(latest.to)}
            </div>
            <Link
              to={`/doctor-view/${latest.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-container transition px-3 py-1.5 rounded-lg hover:bg-primary-fixed"
            >
              <Share2 className="w-4 h-4" />
              分享给医生
            </Link>
          </div>

          {/* 核心主诉 */}
          {latest.chiefComplaint && (
            <Section title="核心主诉" accent>
              {latest.chiefComplaint}
            </Section>
          )}

          {/* 重点关注 */}
          {latest.focusPoints?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">
                建议医生重点关注
              </h3>
              <ul className="space-y-2">
                {latest.focusPoints.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-on-surface bg-primary-fixed/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latest.symptoms && <Section title="症状详情">{latest.symptoms}</Section>}
            {latest.vitalsTrend && <Section title="体征趋势">{latest.vitalsTrend}</Section>}
            {latest.medications && <Section title="用药情况">{latest.medications}</Section>}
            {latest.lifestyle && <Section title="生活习惯">{latest.lifestyle}</Section>}
            {latest.reportHighlights && (
              <div className="md:col-span-2">
                <Section title="报告异常点">{latest.reportHighlights}</Section>
              </div>
            )}
          </div>

          {/* 完整 Markdown */}
          {latest.markdown && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-outline hover:text-primary">
                查看 AI 原始摘要
              </summary>
              <pre className="mt-3 whitespace-pre-wrap font-body text-sm bg-surface-container-low rounded-lg p-4 text-on-surface-variant max-h-96 overflow-auto">
                {latest.markdown}
              </pre>
            </details>
          )}

          <div className="text-center text-xs text-outline pt-4 border-t border-surface-container">
            本摘要仅作信息整理，不可替代医生诊断
          </div>
        </article>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">
        {title}
      </h3>
      <p
        className={
          accent
            ? 'text-lg font-medium text-on-surface leading-relaxed bg-primary-fixed/30 rounded-lg p-4'
            : 'text-sm text-on-surface leading-relaxed'
        }
      >
        {children}
      </p>
    </section>
  );
}
