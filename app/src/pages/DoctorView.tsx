import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Stethoscope, ChevronLeft, AlertCircle, Info } from 'lucide-react';
import { db } from '@/services/storage';
import type { ConsultationSummary, Patient } from '@/types';
import { formatFriendlyDate } from '@/lib/utils';

/**
 * 医生端查看页。有两种访问方式：
 * 1. 患者自己打开（显示二维码供医生扫）
 * 2. 医生扫码打开（看到完整摘要）
 *
 * 判断方式：URL 参数 ?view=doctor 表示医生视角
 */
export default function DoctorView() {
  const { summaryId } = useParams();
  const params = new URLSearchParams(window.location.search);
  const isDoctorView = params.get('view') === 'doctor';

  const [summary, setSummary] = useState<ConsultationSummary | null | undefined>(undefined);
  const [patient, setPatient] = useState<Patient | undefined>();

  useEffect(() => {
    (async () => {
      if (!summaryId) {
        setSummary(null);
        return;
      }
      const s = await db.summaries.get(summaryId);
      if (!s) {
        setSummary(null);
        return;
      }
      setSummary(s);
      const p = await db.patients.get(s.patientId);
      setPatient(p);
    })();
  }, [summaryId]);

  if (summary === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-outline">加载中…</div>;
  }

  if (summary === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-error" />
        <h2 className="text-xl font-bold text-on-surface">摘要不存在或已被删除</h2>
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
              请医生扫描下方二维码查看摘要
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-4 bg-white border-4 border-primary-fixed rounded-xl">
                <QRCodeSVG
                  value={`${window.location.origin}/doctor-view/${summary.id}?view=doctor`}
                  size={200}
                  level="M"
                />
              </div>
              <div className="flex-1 space-y-2 text-sm text-secondary">
                <p className="text-on-surface font-semibold">提示：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>二维码指向本机地址，仅在同一网络下可扫描直达。</li>
                  <li>如在异地就诊，请把摘要截图/打印后带给医生。</li>
                  <li>下方为摘要预览，医生扫码后看到的内容与此一致。</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        <SummaryCard summary={summary} patientName={patient?.name} />

        <div className="text-center text-xs text-outline py-4">
          本摘要由「医前记」自动整理，仅供参考，不作诊断结论。
        </div>
      </main>
    </div>
  );
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
            建议重点关注
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
