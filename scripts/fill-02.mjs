// 把作品报告各章正文填入 docx
// 策略：在每章【填写说明】段落之后，插入一段合并版章节正文
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DOC = path.resolve('submission', 'yiqianji-2026', '03 设计与开发文档', '02-作品报告.docx');

// 每章的正文 = DRAFT-02 里对应章节的全部文字（去 Markdown 符号）
// 为保证段落可读，段落之间用中文破折号 " // " 分隔（用户可在 Word 里手动改回换行）

const chapter1 = `本作品诞生于对中国老龄化社会慢病患者就诊痛点的深度洞察。2024 年底中国 65 岁以上人口达 2.20 亿，占总人口 15.6%；高血压患者 2.45 亿、糖尿病患者 1.18 亿，慢病总患者规模约 5.0 亿。与此同时，三甲医院平均单次问诊时长仅 3–5 分钟，医患信息不对称成为慢病管理效率瓶颈。团队在调研中发现三类典型困境：资料散落四方（纸质报告、手机备忘、微信群相册各处分散）；话到嘴边讲不清（时间描述模糊率超 60%）；3 分钟说完半年（问诊时间严重不够）。基于此，项目团队提出"诊前 3 分钟"概念——在患者走进诊室前的最后 3 分钟，通过一份 AI 生成的专业摘要，让医患在有限时间内完成信息对齐。本作品的核心用户群体为慢病患者（35–65 岁，约 3.6 亿）、定期复诊人群（约 1.2 亿）、多病共存者（约 0.8 亿），典型画像为 55 岁老王，高血压患者，每日测血压、每月量 8–10 次、每半年复查。本作品的六大核心功能为：每日记录（血压/血糖/症状/用药/生活五维数据录入）；多模态 OCR（拍摄纸质检查报告 AI 自动识别）；趋势分析（30 天/6 月/1 年多时间尺度可视化）；AI 摘要（基于通义千问生成诊前 3 分钟摘要，医生扫码即看）；问诊准备度（近 30 天数据完整性评分 0-100 + 提升建议）；数据主权（本地 IndexedDB 存储、一键 JSON 导出、端到端加密）。差异化特征体现在诊前场景聚焦、多模态 AI 摘要、数据完全本地化、医生免安装查看、老年友好设计五个维度。应用价值涵盖患者侧（减少 70% 诊前准备时间，问诊效率提升，隐私自主）、医生侧（降低认知负荷，免软件门槛）、医疗生态侧（缓解医患矛盾，助力分级诊疗，契合"健康中国 2030"战略）。推广路径规划为三阶段：种子期（第 1 年）校园+社区医院试点 0.5 万用户；试点期（2-3 年）3-5 家三甲医院合作 20 万用户 第 3 年盈亏平衡；规模期（4-5 年）30+ 医院合作 100 万用户 营收 800 万 净利润 350 万。商业模式采用 Freemium 免费增值 + SaaS 授权组合：基础版免费，高级版 ¥15/月 或 ¥128/年，家庭版 ¥28/月 或 ¥268/年，企业版按需报价。`;

const chapter2_1 = `本作品选题的宏观背景为：中国人口老龄化加速（65+ 老年人口首次突破 2.2 亿，占比 15.6%，预计 2035 年达 4 亿占比 30%），慢病就诊高频化（高血压患者年均就诊 4.6 次，糖尿病 5.2 次，60 岁以上年就诊次数达 8 次以上），医疗资源紧张（中国三级医院日均接诊量是美国同类医院的 6-8 倍，单次问诊仅 3-5 分钟）。本作品的诞生源于团队成员对家中老人就诊经历的真实观察：团队负责人查烨凡的爷爷冠心病 20 年，每次就诊都带一摞检查单却因时间紧张无法一一查看；技术负责人王蓉的外婆糖尿病+高血压+高血脂三科室轮流就诊，药物相互作用难以把控；成员刘新奥在社区志愿服务时发现老年人对"就诊前整理资料"普遍缺乏方法和耐心；指导教师冯敏在临床调研中多次提及"患者叙述不清"是诊疗效率最大瓶颈。这些场景共同指向一个核心问题：患者的"无结构数据"与医生的"短时高效决策"之间存在巨大鸿沟。`;

const chapter2_2 = `现有解决方案可分为三类。第一类是综合型互联网医疗平台（好大夫在线/微医/京东健康），优势是用户规模大、生态完整，劣势是缺乏诊前聚焦、数据在平台侧存在隐私风险、医生端门槛高。第二类是垂直型慢病管理 App（糖护士/血压管家/爱康蓓馨），优势是专业性强、用户粘性高，劣势是功能单一、数据孤岛、无诊前输出。第三类是医院信息化系统（HIS/EMR/互联网医院平台），优势是权威性高、合规性强，劣势是服务对象是医院而非患者、无法跨院、体验差。综合以上分析，当前市场缺乏一款"诊前场景聚焦 + 多模态 AI + 数据主权 + 医生免安装"四要素兼备的解决方案，这正是本作品的定位空白。`;

const chapter2_3 = `综合分析，本作品聚焦以下三个核心痛点：痛点 1 资料碎片化诊前整理耗时长，患者报告、体征、用药、症状分散在纸质档案、手机备忘、微信群、各 App 中，平均每次就诊前需 30-60 分钟整理资料仍有 40% 概率遗漏，本作品方案为一键聚合五源数据构建统一健康档案；痛点 2 表达不连贯医生反复澄清，患者对"多久前"、"多严重"这类时间/程度描述模糊率超 60%，挤占问诊时间，本作品方案为自动记录每条数据的时间戳和严重度评分，AI 摘要按时间线呈现；痛点 3 三分钟问诊塞半年病史信息遗漏严重，三甲医院平均问诊 3-5 分钟，患者讲 1 分钟等于 50% 信息被覆盖，本作品方案为 AI 自动生成 200 字诊前摘要卡，涵盖"主诉/近期变化/用药/建议"四段式结构，医生 30 秒读完。`;

const chapter2_4 = `本作品的功能需求包括：多模态数据输入（拍照 OCR、手动录入、语音识别、蓝牙设备同步）；结构化健康档案（症状、体征、检查、用药、生活五大模块统一管理）；AI 摘要生成（调用通义千问生成 200 字医生可读摘要）；可视化趋势分析（Recharts 多时间尺度可视化）；二维码分享（医生扫码即看，无需安装应用）；隐私保护（本地 IndexedDB + 端到端加密 + 一键导出）。性能需求包括：首屏加载时间 < 2 秒（3G 网络）；OCR 识别响应时间 < 5 秒；AI 摘要生成时间 < 8 秒；离线可用；支持 10 万条记录不卡顿。本作品不依赖训练数据集（采用公有 AI API），但构造了测试数据：100 份模拟病历（高血压 40、糖尿病 30、多病共存 30，基于《中国心血管健康与疾病报告 2023》典型案例构造）；50 张检查报告图像（20 张团队成员真实检查单 + 30 张公开医学数据集）；30 天 x 10 患者血压/血糖记录（团队成员家人自愿提供）。评估指标：AI 摘要医生满意度 ≥ 4.0/5；OCR 识别准确率 ≥ 90%（关键字段）；用户单次使用时长 2-5 分钟；数据导出兼容性 JSON 格式 100% 可读。`;

const chapter3 = `本作品总体技术路线采用四层分层架构：用户界面层（PWA · React 19）包含 Onboarding、Home、Record、Report、Profile、Summary 等页面；业务逻辑层（Zustand Store）负责记录管理、摘要生成、趋势分析、准备度评分；AI 服务层接入阿里云百炼（qwen-plus 摘要、qwen-vl-plus OCR）和火山引擎（豆包 TTS）；数据存储层采用 Dexie.js + IndexedDB + Blob 管理症状、体征、用药、检查报告图、档案元数据。核心技术模块之一多模态 OCR 模块选用通义千问 qwen-vl-plus，关键设计包括客户端图像压缩至 1024×1024 减少 API 流量 70%、few-shot prompt 固定 JSON schema 输出、AI 异常时降级至人工录入的容错机制。核心技术模块之二 AI 摘要生成选用通义千问 qwen-plus，关键设计包括从全量档案提取最近 30 天关键数据避免 token 超限、固定"主诉/近期变化/用药/建议"四段式 prompt 模板、相同数据+相同 prompt 结果缓存 24 小时。核心技术模块之三多模态时序建模将"文本症状+数值体征+图像报告"三类异构数据做统一时序建模：文本用 Jieba 分词 + TF-IDF 主题词提取，数值用滑动窗口均值+标准差+3σ 异常检测，图像用 qwen-vl-plus 识别结果+关键指标对比。核心技术模块之四数据主权设计核心原则是数据默认本地用户完全掌控，使用 Dexie.js 封装 IndexedDB 支持 50GB 数据毫秒级查询，Web Crypto API 做 AES-GCM 256 加密，JSON 一键导出，端到端传输使用一次性 JWT + 端到端加密。所涉及的核心 AI 模型全部为国产：通义千问 qwen-plus（阿里云 2025 文本摘要）、通义千问 qwen-vl-plus（阿里云 2025 多模态 OCR）、豆包语音合成大模型（火山引擎 2025 TTS）。关键协议采用 HTTP/2 + HTTPS（TLS 1.3）、PWA Service Worker 离线缓存、W3C IndexedDB API 2.0 标准。核心算法包括 OCR 后处理（JSON Schema 验证 + 字段级置信度过滤）、摘要裁剪（时间衰减权重筛选）、准备度评分（完整性+时效性+异常标记三维加权）。本作品原创内容包括诊前 3 分钟摘要卡信息架构、问诊准备度评分算法、PWA+本地加密+一键导出数据主权方案、Remotion 视频产品演示全流程；复用开源内容均注明引用：React 19（MIT）、Dexie.js（Apache 2.0）、Recharts（MIT）、Tailwind CSS v4（MIT）。`;

const chapter4 = `本作品前端采用 React 19 + TypeScript 5.8 + Vite 6 框架，Tailwind CSS v4 样式，React Router v6 路由，Zustand 状态管理，Lucide React 图标，Recharts 图表，motion/react 动画。关键页面包括 Onboarding（/onboarding 新用户 4 步引导 Swiper+滑动手势）、Home（/ 摘要卡+今日记录+BP 趋势 懒加载+骨架屏）、Record（/record 五维数据录入 语音输入+快捷 chip）、Report（/report 30 天趋势+历史报告时间轴 Recharts+虚拟滚动）、Summary（/summary AI 摘要生成+QR 分享 Canvas 二维码渲染）、Profile（/profile 准备度评分+数据管理 环形进度条+动画）。响应式设计采用移动端优先，断点 sm 640px、md 768px、lg 1024px，PWA 安装后全屏沉浸体验。数据输入来源多元：手动录入（Form 表单）、拍照 OCR（qwen-vl-plus API）、语音输入（Web Speech API + qwen-plus 后处理）、蓝牙设备（Web Bluetooth API 待实现）、JSON 导入（文件上传 + Schema 校验）。数据模型基于 Dexie.js 封装：class YiQianJiDB 下定义 records（++id,type,timestamp,*tags）、reports（++id,reportType,timestamp,*keywords）、medications（++id,name,dosage,timestamp）、profiles（++id,userId）四张表。数据加密采用 AES-GCM 256 Web Crypto API，敏感字段（姓名、身份证）加密存储。AI 集成封装层位于 src/services/ai/summary.ts，通过 fetch 调用阿里云百炼 qwen-plus 接口，temperature 设为 0.3 保证输出稳定，max_tokens 500。降级策略包括网络异常时使用本地缓存摘要、AI 超限时降级为规则引擎生成简化摘要、免费用户每日 3 次 AI 摘要配额超出提示升级。视频产品演示实现基于 Remotion 4.0 框架，共 9 个场景 90 秒 1920×1080 30fps。工程结构 app/video/ 下包含 Main.tsx（总入口 Composition+BGM+配音音频层）、constants.ts（颜色字号时长常量）、scenes/01-Cover.tsx 至 09-Ending.tsx 九个场景、components/（PhoneFrame、Subtitle）、voice-script.json（分段配音脚本）。关键实现包括真实产品 UI 复用（视频中"手机内部"UI 直接 import 自 app/src/components/pure/）、国产 AI 配音（通过火山引擎豆包 TTS 批量生成 9 段 mp3）、BGM 音量 ducking（配音期间 BGM 音量自动降至 20%）。开发过程遇到的主要困难包括 Remotion 动画 inputRange 抛错（解决方案：对所有动画组件加入防御式 early return）、qwen-vl-plus OCR 对手写体识别率低（解决方案：提示用户拍摄电子血压计数字屏，加入手动录入降级入口）、IndexedDB 在 iOS Safari 隐私模式下失效（解决方案：检测并提示用户关闭隐私模式或降级 sessionStorage）、PWA 在 Android 微信浏览器无法安装（解决方案：引导用户"在浏览器中打开"）。`;

const chapter5 = `本作品采用多维度测试策略：单元测试用 Vitest 覆盖核心算法（摘要裁剪、准备度评分、OCR 后处理）；集成测试用 Playwright 做端到端流程测试（记录→摘要→分享）；AI 效果评测用 100 份模拟病历人工评分；性能测试用 Lighthouse + WebPageTest；可用性测试用 5 位老年真实用户入户测试。AI 摘要效果评测数据集规模 100 份模拟病历，病例类型覆盖高血压 40、糖尿病 30、多病共存 30，人工标注由指导教师冯敏（医学信息学背景）+ 1 位三甲医院主治医师协作评分。评分维度加权结果：信息完整性 30% 权重 4.3 分；时间表述准确性 20% 权重 4.5 分；异常突出程度 20% 权重 4.1 分；语言专业性 15% 权重 4.2 分；篇幅适宜性 15% 权重 4.6 分。综合评分 4.32/5。Bad Case 分析发现 5% 病例出现药名简写与全名不统一（如 ACEI vs 血管紧张素转化酶抑制剂），3% 病例时间描述过于笼统（最近、之前），优化方向是 prompt 中加入药名标准化字典+强制日期格式化。OCR 识别准确率评测数据集 50 张检查报告图像，来源是 20 张团队成员真实检查单 + 30 张公开医学数据集，类型覆盖血常规 20、肝功能 15、CT 报告 10、药盒 5。准确率结果：血常规关键字段识别率 94% 数值识别率 96%；肝功能 92%/95%；CT 报告 88%/N/A；药盒 91%/93%。平均关键字段识别率 91.25% 数值识别率 94.7%。失败案例归因：40% 图像模糊或倾斜、30% 手写体、20% 特殊排版（老旧 HIS 系统）、10% 特殊字符或缩写。性能测试 Lighthouse 得分 Performance 92、Accessibility 98、Best Practices 95、SEO 90、PWA 100。关键指标：首屏加载时间 3G 网络 1.8 秒；TTI 2.3 秒；OCR 响应时间中位数 3.8 秒；AI 摘要响应时间中位数 5.2 秒。可用性测试邀请 5 位 55-72 岁老年用户入户测试，病史高血压 3、糖尿病 2、甲状腺 1。任务完成率：打开应用独立 100%；记录今日血压独立 80%/提示 20%；拍照上传检查单独立 60%/提示 40%；生成诊前摘要独立 60%/提示 20%/需帮助 20%；分享给子女/医生独立 40%/提示 40%/需帮助 20%。改进方向：摘要生成入口过深（4 次点击→优化至 2 次）；分享二维码说明文案需增加语音引导；未来考虑 XXL 字号模式。`;

const chapter6_1 = `本作品特色与创新点体现在场景、技术、体验三个层面。场景创新是首次提出"诊前 3 分钟"场景——在患者走进诊室前的最后 3 分钟通过 AI 摘要完成医患信息对齐，此前同类产品聚焦"问诊中"和"问诊后"，本作品开辟"问诊前"新赛道。技术创新体现在三点：多模态统一建模将文本症状、数值体征、图像报告三类异构数据统一为时间序列支持跨类型关联分析；数据主权架构在业内少见实现"完全本地化 + 一键导出"模式在合规性和隐私保护做到极致；全国产 AI 栈从开发工具（通义灵码、Kimi Code、DeepSeek、Trae）到生产模型（qwen-plus、qwen-vl-plus、豆包）全部国产，符合国赛合规并具备可推广性。体验创新体现在两点：医生免安装，生成二维码医生扫码 Web 页面即看无需下载 app 无需账号登录极大降低医生端使用门槛；老年友好设计参考 Material Design 3 Adaptive Typography 默认字号 20px 行高 1.5 避开纯黑色遵循 WCAG AAA 对比度。`;

const chapter6_2 = `应用推广分三期推进。短期推广（1 年内）：校园试点在山东第一医科大学附属医院患教中心开展种子用户招募；社区医院联络济南市 3-5 家社区医院做慢病管理试点；学术合作发表医学信息学学术论文 1-2 篇参与医学信息学会议。中期推广（1-3 年）：三甲医院合作目标 5 家共建"诊前摘要"工作流；医保对接探索与医保系统对接的可行性实现诊前摘要官方认可；企业客户与药企合作做慢病管理增值服务。长期推广（3-5 年）：全国推广覆盖 30+ 医院、100 万用户；作为"健康中国 2030"战略数字化医疗患者端标准案例贡献；生态开放开放 API 供其他慢病管理 App 集成"诊前摘要"能力。`;

const chapter6_3 = `作品展望涵盖功能扩展、技术升级、产品升级三方面。功能扩展：多病种支持从慢病扩展到术后康复、肿瘤随访、孕产管理；家庭账户支持子女代父母管理健康档案；语音交互老年用户语音输入全场景覆盖；可穿戴设备对接小米手环、华为手表、Apple Watch。技术升级：端侧 AI 模型引入量化版轻量 LLM（如 Qwen-0.5B）部分摘要生成可在端侧完成减少 API 依赖；时序预测模型基于 LSTM + Attention 预测"未来 3-7 天血压异常概率"；联邦学习在不上传原始数据的前提下让模型从大规模用户数据中学习；多语言支持英语、繁中、粤语方言。产品升级：医生端专业版为医生开发独立的"患者管理"视图；保险对接与商业保险公司合作把"问诊准备度"变成保费优惠凭证；健康处方基于 AI 生成个性化生活方式建议。`;

const chapter7 = `[1] 国家统计局. 2024 年国民经济和社会发展统计公报[R]. 北京: 国家统计局, 2025. // [2] 中国心血管健康与疾病报告编写组. 《中国心血管健康与疾病报告 2023》[R]. 北京: 中国循环杂志, 2023. // [3] Li, X., Krumholz, H. M., Yip, W., et al. Quality of primary health care in China: challenges and recommendations[J]. The Lancet, 2020, 395(10239): 1802-1812. // [4] 沙利文咨询. 《2024 中国数字医疗健康市场研究报告》[R]. 北京: 沙利文, 2024. // [5] Liu, Z., et al. Qwen Technical Report[R]. Alibaba Cloud, 2023. // [6] DeepSeek-AI. DeepSeek-V3 Technical Report[R]. 2024. // [7] 月之暗面. Kimi K2 Blog. // [8] 火山引擎. 豆包大模型技术白皮书[R]. 字节跳动, 2025. // [9] W3C. Indexed Database API 2.0 [S]. World Wide Web Consortium, 2018. // [10] WHO. Digital health and wellness: framework for action[R]. World Health Organization, 2023. // [11] 国务院. "健康中国 2030"规划纲要[Z]. 2016. // [12] 国家卫生健康委. 互联网医院管理办法（试行）[Z]. 2018.`;

// 每章内容在对应【填写说明】段落之后插入
const sections = [
  { afterParaId: '34DECA1E', content: chapter1 },       // 作品概述
  { afterParaId: '72632E64', content: chapter2_1 },     // 问题来源
  { afterParaId: '1974D893', content: chapter2_2 },     // 现有解决方案
  { afterParaId: '659CF6F4', content: chapter2_3 },     // 痛点问题
  { afterParaId: '7714C684', content: chapter2_4 },     // 解决思路
  { afterParaId: '268BADFD', content: chapter3 },       // 技术方案
  { afterParaId: '6DF3D914', content: chapter4 },       // 系统实现
  { afterParaId: '2BCB30A8', content: chapter5 },       // 测试分析
  { afterParaId: '583BD79C', content: chapter6_1 + '【应用推广】' + chapter6_2 + '【作品展望】' + chapter6_3 }, // 作品总结（合并 6.1/6.2/6.3）
  { afterParaId: '4B0AA4E2', content: chapter7 },       // 参考文献
];

const ops = [
  // 1. 填封面
  { op: 'set', path: '/body/p[@paraId=6FAEF54B]', props: { find: '作品名称：', replace: '作品名称：医前记' } },
  { op: 'set', path: '/body/p[@paraId=054485EB]', props: { find: '填写日期：', replace: '填写日期：2026-04-21' } },
];

// 2. 每章正文插入
for (const s of sections) {
  ops.push({
    op: 'add',
    parent: '/body',
    type: 'paragraph',
    after: `/body/p[@paraId=${s.afterParaId}]`,
    props: { text: s.content, font: '宋体', size: '12pt' },
  });
}

const json = JSON.stringify(ops);
console.log(`准备执行 ${ops.length} 个操作，正文总字符约 ${sections.reduce((a, s) => a + s.content.length, 0)} 字...`);

const result = execFileSync('officecli', ['batch', DOC, '--json'], {
  input: json,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
  maxBuffer: 10 * 1024 * 1024,
});

const parsed = JSON.parse(result);
const results = parsed.results || parsed.data?.results || [];
const okCount = results.filter(r => r.success).length;
console.log(`\n✅ 成功 ${okCount} / ${results.length}`);
for (const r of results) {
  if (!r.success) console.log(`  ❌ [${r.index}] ${r.error}`);
}
