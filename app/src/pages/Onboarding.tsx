import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  Pill,
  FileText,
  Calendar,
  ClipboardList,
  AlertCircle,
  Wind,
  ArrowRight,
  BriefcaseMedical,
  CheckCircle,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { ensureEmptyPatient } from '@/services/seed';

type StepProps = {
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
};

// STEP 1
function Step1({ onNext, onSkip }: StepProps) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col overflow-hidden absolute inset-0">
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-container font-headline tracking-tight">
            医前记
          </span>
        </div>
        <button
          onClick={onSkip}
          className="text-outline hover:text-primary-container transition-colors font-medium text-sm px-4 py-2 rounded-full hover:bg-surface-container/50"
        >
          跳过
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-10 relative z-10">
        <div className="text-center max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-secondary-container/30 text-primary-container">
            <BriefcaseMedical className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-on-surface leading-[1.2] tracking-tight mb-8">
            让每一次就诊都
            <br />
            <span className="text-primary-container">更高效</span>
          </h1>
          <p className="text-lg sm:text-xl text-on-surface-variant font-body leading-relaxed opacity-90 max-w-md mx-auto">
            诊前信息整理与沟通辅助系统，帮助您在医生面前清晰表达需求，不错过任何细节。
          </p>
        </div>
      </main>
      <footer className="w-full px-8 pb-16 flex flex-col items-center relative z-10 max-w-md mx-auto">
        <div className="flex gap-3 mb-12">
          <div className="w-10 h-2.5 rounded-full bg-primary-container transition-all duration-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
        </div>
        <button
          onClick={onNext}
          className="w-full max-w-md h-16 bg-primary-container text-white rounded-2xl font-headline font-semibold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary-container/20 active:scale-95 transition-all"
        >
          下一步
          <ArrowRight className="w-6 h-6" />
        </button>
        <p className="mt-6 text-sm text-outline font-medium tracking-wide">
          开始您的智能健康之旅
        </p>
      </footer>
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary-fixed/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}

// STEP 2
function Step2({ onNext, onSkip, onBack }: StepProps) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col absolute inset-0">
      <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-lg">
        <nav className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-surface-container/50 rounded-full transition-all active:opacity-80 -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-primary-container" />
            </button>
            <span className="text-xl font-bold text-primary-container font-headline">
              医前记
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-outline font-medium hover:bg-surface-container/50 px-4 py-2 rounded-full transition-all"
          >
            跳过
          </button>
        </nav>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-6 pb-12 w-full">
        <div className="relative w-full aspect-square max-h-[400px] mb-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-primary-fixed/20 rounded-full blur-3xl -z-10 transform scale-75" />
          <div className="relative w-full h-full max-w-xs">
            <div className="absolute top-[10%] right-[10%] w-28 h-28 bg-surface-container-lowest shadow-xl rounded-xl p-4 transform rotate-12 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <Pill className="text-primary w-8 h-8" />
                <div className="w-8 h-2 bg-surface-container-high rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-1 bg-surface-container-high rounded-full" />
                <div className="w-2/3 h-1 bg-surface-container-high rounded-full" />
              </div>
            </div>
            <div className="absolute top-[35%] left-[5%] w-36 h-48 bg-surface-container-lowest shadow-lg rounded-lg p-5 transform -rotate-6 border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-secondary w-6 h-6" />
                <div className="w-12 h-2 bg-surface-container-high rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="w-full h-1.5 bg-surface-container shadow-inner rounded-full" />
                <div className="w-full h-1.5 bg-surface-container shadow-inner rounded-full" />
                <div className="w-3/4 h-1.5 bg-surface-container shadow-inner rounded-full" />
                <div className="flex gap-2 mt-4">
                  <div className="w-6 h-6 rounded-full bg-secondary-container" />
                  <div className="w-6 h-6 rounded-full bg-primary-fixed" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-[10%] right-[5%] w-24 h-24 bg-surface-container-lowest shadow-2xl rounded-2xl overflow-hidden transform -rotate-12 flex flex-col">
              <div className="bg-error w-full h-5 flex items-center justify-center shrink-0">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-white/50 rounded-full" />
                  <div className="w-1 h-1 bg-white/50 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 p-2">
                <Calendar className="text-error w-8 h-8 -translate-y-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-center space-y-4 px-6 max-w-sm mx-auto">
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight leading-tight">
            就诊前最头疼的事
            <br />
            我们帮你整理
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed font-body">
            记录病史、整理病历、用药清单，这些繁琐的准备工作，现在都可以交给我们引导您完成。
          </p>
        </div>
      </main>
      <footer className="mt-auto px-6 pb-12 w-full max-w-md mx-auto space-y-8 relative z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
          <div className="w-8 h-2.5 rounded-full bg-primary-container" />
          <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
          <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
        </div>
        <button
          onClick={onNext}
          className="w-full h-14 bg-gradient-medical text-on-primary text-lg font-headline font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          下一步
          <ArrowRight className="w-6 h-6" />
        </button>
      </footer>
    </div>
  );
}

// STEP 3
function Step3({ onNext, onSkip, onBack }: StepProps) {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen absolute inset-0 overflow-y-auto hidden-scrollbar pb-[100px]">
      <header className="bg-surface/90 backdrop-blur-lg sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface-container/50 rounded-full transition-all active:opacity-80 -ml-2"
          >
            <ChevronLeft className="w-6 h-6 text-primary-container" />
          </button>
          <span className="text-xl font-bold text-primary-container font-headline">
            医前记
          </span>
        </div>
        <button
          onClick={onSkip}
          className="text-outline font-headline font-semibold hover:bg-surface-container/50 rounded-full transition-all px-4 py-1"
        >
          跳过
        </button>
      </header>
      <main className="flex-grow w-full max-w-md mx-auto px-6 pt-6 pb-32">
        <section className="mb-8 text-left">
          <h1 className="text-3xl font-extrabold text-on-surface leading-tight tracking-tight mb-4 font-headline">
            一份摘要，
            <br />
            <span className="text-primary-container">医生秒懂</span>你的情况
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            通过 AI 深度分析，我们将您的复杂描述转化为医生最关注的专业医学维度，极大地缩短沟通成本。
          </p>
        </section>
        <div className="relative mb-12">
          <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden p-6 relative">
            <div className="absolute left-0 top-0 w-1 h-full bg-primary-container rounded-l-md" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-primary-container uppercase tracking-widest font-headline">
                    Consultation Summary
                  </span>
                  <h2 className="text-lg font-bold font-headline mt-0.5 whitespace-nowrap">
                    预诊摘要示例
                  </h2>
                </div>
              </div>
              <span className="bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant shrink-0 min-w-max">
                ID: 8829-01
              </span>
            </div>
            <div className="space-y-6">
              <div className="bg-surface-container-low rounded-lg p-4">
                <h3 className="text-sm font-bold text-secondary mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  核心主诉
                </h3>
                <p className="text-on-surface font-medium text-sm leading-relaxed">
                  持续性胸闷 3 天，伴活动后气促，休息可稍缓解，既往有高血压史。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 border-l-2 border-outline-variant/30 pl-3">
                  <h3 className="text-[10px] font-bold text-outline mb-1 font-headline uppercase">
                    发作频率
                  </h3>
                  <p className="text-base font-bold text-on-surface">每日 3-4 次</p>
                </div>
                <div className="p-2 border-l-2 border-outline-variant/30 pl-3">
                  <h3 className="text-[10px] font-bold text-outline mb-1 font-headline uppercase">
                    痛感性质
                  </h3>
                  <p className="text-base font-bold text-on-surface">压榨感/闷胀</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-dashed border-outline-variant/50">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <Wind className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">诱发因素</h4>
                    <p className="text-sm text-on-surface-variant">
                      情绪激动、剧烈运动、寒冷空气刺激。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <Pill className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">近期用药</h4>
                    <p className="text-sm text-on-surface-variant">
                      苯磺酸氨氯地平片 (5mg qd)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-primary-container/10 rounded-xl" />
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-surface/90 backdrop-blur-md z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-3 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
            <div className="w-8 h-2.5 rounded-full bg-primary-container" />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
          </div>
          <button
            onClick={onNext}
            className="w-full h-[56px] bg-primary text-on-primary rounded-xl font-headline font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200"
          >
            下一步
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}

// STEP 4
function Step4({ onNext }: StepProps) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-between overflow-hidden absolute inset-0">
      <header className="w-full px-6 py-6 flex justify-start items-center relative z-10 max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <HeartPulse className="text-primary-container w-8 h-8" fill="currentColor" />
          <span className="text-xl font-bold text-primary-container font-headline tracking-tight">
            医前记
          </span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-8 text-center relative z-10">
        <div className="relative mb-12">
          <div className="absolute -inset-4 bg-primary-fixed/30 rounded-full blur-3xl opacity-60" />
          <div className="relative w-40 h-40 md:w-48 md:h-48 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-[0_32px_64px_-12px_rgba(0,102,136,0.08)] transform hover:scale-105 transition-transform duration-500">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-container/10 rounded-full flex items-center justify-center">
              <CheckCircle className="text-primary w-16 h-16 md:w-20 md:h-20" />
            </div>
          </div>
        </div>
        <section className="space-y-4">
          <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">
            准备就绪
          </h1>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed max-w-[280px] mx-auto">
            开始记录你的健康信息
          </p>
        </section>
        <div className="flex space-x-3 mt-12 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
          <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
          <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
          <div className="w-8 h-2.5 rounded-full bg-primary transition-all duration-300" />
        </div>
      </main>
      <footer className="w-full max-w-md px-8 pb-12 space-y-6 relative z-10">
        <button
          onClick={onNext}
          className="w-full h-14 bg-gradient-medical text-on-primary font-headline font-semibold text-lg rounded-xl shadow-[0_8px_24px_-4px_rgba(0,102,136,0.3)] active:scale-[0.98] transition-all flex items-center justify-center group"
        >
          进入首页
          <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="flex flex-col items-center space-y-2 pt-2">
          <p className="text-[11px] text-on-surface-variant/70 leading-normal max-w-[300px] text-center">
            点击上方按钮即表示您同意我们的
            <a className="text-primary font-medium underline underline-offset-4 decoration-primary/30 mx-1 cursor-pointer">
              隐私协议
            </a>
            及
            <a className="text-primary font-medium underline underline-offset-4 decoration-primary/30 ml-1 cursor-pointer">
              服务条款
            </a>
          </p>
          <div className="flex items-center space-x-1.5 opacity-50 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[9px] tracking-widest font-bold uppercase mt-0.5">
              Data stored locally
            </span>
          </div>
        </div>
      </footer>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setCurrentPatientId = useAppStore((s) => s.setCurrentPatientId);

  const finish = async () => {
    const patientId = await ensureEmptyPatient();
    setCurrentPatientId(patientId);
    setOnboarded(true);
    navigate('/', { replace: true });
  };

  const goNext = () => {
    if (step < 3) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      void finish();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const skipToLast = () => {
    setDirection(1);
    setStep(3);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? '50%' : '-50%', opacity: 0 }),
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex justify-center text-on-surface select-none">
      <div className="w-full max-w-md relative bg-surface border-x border-outline-variant/50 shadow-2xl h-[100dvh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 35, opacity: { duration: 0.2 } }}
              className="absolute inset-0"
            >
              <Step1 onNext={goNext} onSkip={skipToLast} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 35, opacity: { duration: 0.2 } }}
              className="absolute inset-0"
            >
              <Step2 onNext={goNext} onSkip={skipToLast} onBack={goBack} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 35, opacity: { duration: 0.2 } }}
              className="absolute inset-0"
            >
              <Step3 onNext={goNext} onSkip={skipToLast} onBack={goBack} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 35, opacity: { duration: 0.2 } }}
              className="absolute inset-0"
            >
              <Step4 onNext={goNext} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
