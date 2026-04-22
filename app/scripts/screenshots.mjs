/**
 * 医前记 · 自动截图脚本（三阶段产出）
 *
 * 产出目录：app/screenshots/
 *   phone/      —— 全页手机截图（隐藏 fixed 底部 nav，适合 PPT 单屏展示 / iPhone mockup 合成）
 *   component/  —— UI 组件特写（单独截某张卡片 / 图表，适合功能点讲解）
 *   hero/       —— 三屏横版拼图（含 iPhone 外壳效果，适合 PPT 封面 / 章节页）
 *
 * 前置：先 `npm run dev`（端口 3000）。
 * 执行：`node scripts/screenshots.mjs`
 */

import { chromium, devices } from 'playwright';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'screenshots');
const OUT_PHONE = join(OUT, 'phone');
const OUT_COMPONENT = join(OUT, 'component');
const OUT_HERO = join(OUT, 'hero');
const TMP_HTML = join(OUT, '_hero-composite.html');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 重置输出
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT_PHONE, { recursive: true });
await mkdir(OUT_COMPONENT, { recursive: true });
await mkdir(OUT_HERO, { recursive: true });

console.log('🚀 Launching chromium (iPhone 14 Pro emulation)...');
const browser = await chromium.launch({ headless: true });
const mobileContext = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
});
const page = await mobileContext.newPage();

/** 给当前页面注入「隐藏固定底部 nav 和飘浮 toast」的 CSS，确保 fullPage 截图干净 */
async function hideChrome() {
  await page.addStyleTag({
    content: `
      nav.fixed[class*="bottom-0"] { display: none !important; }
      /* Home 页点击加载演示后弹出的顶部 toast */
      .fixed.top-20 { display: none !important; }
      /* 禁用动画加速，保证截图前稳定 */
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-delay: 0s !important; }
    `,
  });
}

async function navigate(path) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await hideChrome();
  await page.waitForTimeout(600);
}

async function shotPhone(name, { fullPage = true } = {}) {
  const path = join(OUT_PHONE, `${name}.png`);
  await page.screenshot({ path, fullPage });
  console.log(`📱 phone/${name}.png`);
  return path;
}

async function shotComponent(name, locator, padding = 0) {
  const path = join(OUT_COMPONENT, `${name}.png`);
  try {
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    await locator.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    if (padding > 0) {
      const box = await locator.first().boundingBox();
      if (!box) throw new Error('boundingBox null');
      await page.screenshot({
        path,
        clip: {
          x: Math.max(0, box.x - padding),
          y: Math.max(0, box.y - padding),
          width: box.width + padding * 2,
          height: box.height + padding * 2,
        },
      });
    } else {
      await locator.first().screenshot({ path });
    }
    console.log(`🎨 component/${name}.png`);
  } catch (e) {
    console.warn(`⚠️  component/${name} skipped: ${e.message}`);
  }
}

// =============== 重置应用状态 ===============
async function resetAppState() {
  await page.goto(BASE_URL);
  await page.evaluate(async () => {
    try { localStorage.clear(); } catch { }
    try { sessionStorage.clear(); } catch { }
    if (indexedDB.databases) {
      const dbs = await indexedDB.databases();
      await Promise.all(
        dbs.map(
          (d) =>
            new Promise((resolve) => {
              if (!d.name) return resolve();
              const req = indexedDB.deleteDatabase(d.name);
              req.onsuccess = req.onerror = req.onblocked = () => resolve();
            }),
        ),
      );
    }
  });
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
}
await resetAppState();

async function clickByText(text) {
  const selector = `button:has-text("${text}"):visible`;
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  // 拿到可见的最后一个（AnimatePresence 下可能暂时有两个同名按钮，最新的是 current step）
  const handle = await page.locator(selector).last();
  await handle.click();
}

// =============== Onboarding（不隐藏 footer，它是 Onboarding 自己的导航按钮） ===============
console.log('\n── Onboarding ──');
await page.waitForSelector('button:has-text("下一步"):visible', { timeout: 10000 });
await page.waitForTimeout(500); // 让 spring 动画完全稳定
await shotPhone('01-onboarding-step1');
await clickByText('下一步');
await page.waitForTimeout(900);
await shotPhone('02-onboarding-step2');
await clickByText('下一步');
await page.waitForTimeout(900);
await shotPhone('03-onboarding-step3');
await clickByText('下一步');
await page.waitForTimeout(900);
await shotPhone('04-onboarding-step4');
await clickByText('进入首页');

await page.waitForURL((url) => url.pathname === '/', { timeout: 5000 });
await page.waitForTimeout(1000);
await hideChrome(); // 进入主界面后开始隐藏 chrome

// =============== Home Empty ===============
console.log('\n── Home ──');
await shotPhone('05-home-empty');
await shotComponent(
  'home-empty-hero',
  page.locator('section', { hasText: '暂时还没有记录' }),
);

// 加载演示数据
await page.locator('button', { hasText: '加载演示数据' }).first().click();
await page.waitForTimeout(3000);
// 重载以确保 useLiveQuery 刷新和 toast 消失
await navigate('/');
await page.waitForTimeout(1500);
await shotPhone('06-home-full');
await shotComponent(
  'home-summary',
  page.locator('section', { hasText: 'Recent 14-day highlight' }),
);
await shotComponent(
  'home-trend',
  page.locator('section', { hasText: /BP (TREND|ALERT)/ }),
);

// =============== Report ===============
console.log('\n── Report ──');
await navigate('/report');
await page.waitForTimeout(2200); // Recharts 渲染
await shotPhone('07-report');
await shotComponent(
  'report-chart',
  page.locator('div.rounded-3xl', { hasText: '体征趋势 (30天)' }),
);
await shotComponent(
  'report-summary',
  page.locator('section, div.rounded-3xl', { hasText: '尚未生成就诊摘要' }).or(
    page.locator('section, div.rounded-3xl', { hasText: /核心主诉|此次就诊/ }),
  ),
);
await shotComponent(
  'report-medication',
  page.locator('section, div.rounded-3xl', { hasText: '用药状况' }),
);
await shotComponent(
  'report-timeline',
  page.locator('section, div.rounded-3xl', { hasText: '检查报告档案' }),
);

// =============== Profile ===============
console.log('\n── Profile ──');
await navigate('/profile');
await page.waitForTimeout(1800);
await shotPhone('08-profile');
await shotComponent(
  'profile-ring',
  page.locator('section, div.rounded-3xl', { hasText: /问诊准备度|就诊准备/ }),
);
await shotComponent(
  'profile-suggestion',
  page.locator('section, div.rounded-3xl', { hasText: /提升建议|下一步/ }),
);

// =============== Settings ===============
console.log('\n── Settings ──');
await navigate('/settings');
await page.waitForTimeout(1000);
await shotPhone('09-settings-custom');
await shotComponent(
  'settings-providers',
  page.locator('div.rounded-3xl', { hasText: '选择 AI 服务商' }),
);
await shotComponent(
  'settings-ocr',
  page.locator('div.rounded-3xl', { hasText: '报告识别（OCR）' }),
);
await shotComponent(
  'settings-data',
  page.locator('section.rounded-3xl, div.rounded-3xl', { hasText: '我的数据' }),
);

// Tab 2 订阅会员
await page.locator('button', { hasText: '订阅会员' }).first().click();
await page.waitForTimeout(700);
await shotPhone('10-settings-membership');
await shotComponent(
  'settings-pricing',
  page.locator('div.grid', { hasText: '月付' }).filter({ hasText: '年付' }).filter({ hasText: '终身' }),
);
await shotComponent(
  'settings-perks',
  page.locator('div.rounded-3xl', { hasText: '会员权益' }),
);

// =============== Record ===============
console.log('\n── Record ──');
await navigate('/record');
await page.waitForTimeout(900);
await shotPhone('11-record');

// =============== Summary ===============
console.log('\n── Summary ──');
await navigate('/summary');
await page.waitForTimeout(900);
await shotPhone('12-summary');

// =============== Hero 三屏拼图 ===============
console.log('\n── Hero composites ──');

/**
 * 用 composite HTML 把 3 张手机截图并排渲染（带 iPhone 外壳效果），再对整个合成页截图。
 * 不依赖图片处理库。
 */
async function composeHero(name, imagePaths, { title, subtitle, accent = '#005f8a' }) {
  const escHtml = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const toFileUrl = (p) => `file:///${p.replace(/\\/g, '/').replace(/^\/+/, '')}`;
  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>hero</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; }
  body {
    background:
      radial-gradient(circle at 20% 10%, rgba(0,95,138,0.08) 0%, transparent 45%),
      radial-gradient(circle at 85% 90%, rgba(115,160,205,0.12) 0%, transparent 40%),
      linear-gradient(135deg, #f6fafc 0%, #e9f2f7 100%);
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    padding: 80px 60px 80px 80px;
    display: flex; align-items: center; gap: 80px;
    min-height: 100vh;
  }
  .copy {
    flex: 0 0 440px;
  }
  .copy .eyebrow {
    font-size: 11px; font-weight: 800; letter-spacing: 0.35em;
    color: ${accent}; text-transform: uppercase;
    margin-bottom: 16px; opacity: 0.75;
  }
  .copy h1 {
    font-size: 44px; font-weight: 800; line-height: 1.15;
    color: #0b1a24; margin-bottom: 18px;
    letter-spacing: -0.02em;
  }
  .copy h1 em {
    color: ${accent}; font-style: normal;
    background: linear-gradient(135deg, ${accent}, #4aa3c7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .copy p {
    font-size: 17px; line-height: 1.7;
    color: #3d566a; max-width: 420px;
  }
  .stage {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: 28px; position: relative;
  }
  .phone {
    width: 310px; aspect-ratio: 390/844;
    border-radius: 50px;
    background: #0a0a0a;
    padding: 10px 10px;
    box-shadow:
      0 40px 80px -10px rgba(0, 70, 100, 0.25),
      0 8px 16px rgba(0, 0, 0, 0.08),
      inset 0 0 0 1px rgba(255,255,255,0.08);
    position: relative;
    flex-shrink: 0;
  }
  .phone::before {
    content: '';
    position: absolute;
    top: 18px; left: 50%; transform: translateX(-50%);
    width: 96px; height: 28px;
    background: #000; border-radius: 99px;
    z-index: 3;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
  }
  .phone > .screen {
    position: relative; overflow: hidden;
    width: 100%; height: 100%;
    border-radius: 42px;
    background: #fff;
  }
  .phone > .screen > img {
    width: 100%; display: block;
    position: absolute; top: 0; left: 0;
  }
  .phone:nth-child(1) { transform: translateY(20px) rotate(-2deg); z-index: 1; }
  .phone:nth-child(2) { transform: translateY(-10px); z-index: 2; }
  .phone:nth-child(3) { transform: translateY(20px) rotate(2deg); z-index: 1; }
  .logo {
    position: absolute; bottom: 32px; left: 80px;
    font-size: 13px; font-weight: 800; color: ${accent};
    letter-spacing: 0.3em; opacity: 0.55;
  }
</style>
</head>
<body>
  <div class="copy">
    <div class="eyebrow">${escHtml(subtitle || 'YIQIANJI · MEDICAL PRE-CONSULT')}</div>
    <h1>${title}</h1>
    <p>诊前信息整理与沟通辅助系统 —— 把杂乱的记录一键结构化为医生可读的专业摘要，让宝贵的门诊时间更有效。</p>
  </div>
  <div class="stage">
    ${imagePaths.map((p) => `<div class="phone"><div class="screen"><img src="${toFileUrl(p)}" /></div></div>`).join('')}
  </div>
  <div class="logo">医前记 · YIQIANJI</div>
</body></html>`;
  await writeFile(TMP_HTML, html, 'utf8');

  // 用独立桌面级 context 渲染合成页
  const desktopContext = await browser.newContext({
    viewport: { width: 1680, height: 900 },
    deviceScaleFactor: 2,
  });
  const heroPage = await desktopContext.newPage();
  await heroPage.goto(`file:///${TMP_HTML.replace(/\\/g, '/')}`);
  await heroPage.waitForLoadState('networkidle');
  await heroPage.waitForTimeout(600);
  const outPath = join(OUT_HERO, `${name}.png`);
  await heroPage.screenshot({ path: outPath, fullPage: false });
  await desktopContext.close();
  console.log(`🖼  hero/${name}.png`);
}

const P = (n) => join(OUT_PHONE, `${n}.png`);

await composeHero(
  'hero-onboarding',
  [P('01-onboarding-step1'), P('03-onboarding-step3'), P('04-onboarding-step4')],
  {
    title: '4 步引导<br/>让用户<em>立刻懂</em>产品价值',
    subtitle: 'ONBOARDING · 4 STEPS',
  },
);

await composeHero(
  'hero-mainflow',
  [P('06-home-full'), P('07-report'), P('08-profile')],
  {
    title: '三屏串起<br/>一次<em>完整就诊周期</em>',
    subtitle: 'CORE EXPERIENCE',
  },
);

await composeHero(
  'hero-data-ownership',
  [P('05-home-empty'), P('09-settings-custom'), P('10-settings-membership')],
  {
    title: '数据权<em>在用户自己</em>手里',
    subtitle: 'PRIVACY · SELF-HOSTED · SAAS-READY',
  },
);

await browser.close();
console.log('\n✅ Done. Output:');
console.log('  📱 ', OUT_PHONE);
console.log('  🎨 ', OUT_COMPONENT);
console.log('  🖼 ', OUT_HERO);
