/**
 * 国产大模型天梯榜数据
 * 数据来源：SuperCLUE 2026年3月 + BenchLM.ai 2026年3月
 * 
 * Design: 竞技场/体育赛事排行美学
 * Color: Deep navy + gold champion + gradient blue
 */

export interface ModelData {
  id: string;
  name: string;
  shortName: string;
  company: string;
  companyEn: string;
  logo: string; // emoji as fallback
  isOpenSource: boolean;
  contextLength: string;
  type: "reasoning" | "non-reasoning";
  // SuperCLUE scores (2026年3月)
  superclue: {
    total: number;
    math: number;
    hallucination: number;
    science: number;
    instruction: number;
    coding: number;
    agent: number;
  };
  // BenchLM scores
  benchlm: {
    overall: number;
    arenaElo?: number;
  };
  // Specialty tags
  strengths: string[];
  strengthDetail: string;
  color: string; // brand color
}

export const models: ModelData[] = [
  {
    id: "doubao-seed",
    name: "Doubao-Seed-2.0-pro",
    shortName: "豆包 Seed 2.0",
    company: "字节跳动",
    companyEn: "ByteDance",
    logo: "🔥",
    isOpenSource: false,
    contextLength: "256K",
    type: "non-reasoning",
    superclue: { total: 71.53, math: 84.87, hallucination: 79.41, science: 80.49, instruction: 39.46, coding: 63.93, agent: 81.04 },
    benchlm: { overall: 65 },
    strengths: ["中文理解", "智能体", "综合能力"],
    strengthDetail: "SuperCLUE国内总分第一，中文综合理解能力突出，智能体任务规划表现优异",
    color: "#3b82f6",
  },
  {
    id: "kimi-k25",
    name: "Kimi-K2.5-Thinking",
    shortName: "Kimi K2.5",
    company: "月之暗面",
    companyEn: "Moonshot AI",
    logo: "🌙",
    isOpenSource: true,
    contextLength: "128K",
    type: "reasoning",
    superclue: { total: 64.60, math: 84.03, hallucination: 81.51, science: 68.29, instruction: 16.22, coding: 65.50, agent: 78.44 },
    benchlm: { overall: 74, arenaElo: 1447 },
    strengths: ["编程之王", "数学推理", "代码生成"],
    strengthDetail: "SWE-bench Verified 76.8 全球顶尖，LiveCodeBench 85 编程能力极强，AIME 96.1 数学接近满分",
    color: "#8b5cf6",
  },
  {
    id: "qwen35",
    name: "Qwen3.5-397B-A17B-Thinking",
    shortName: "通义千问 3.5",
    company: "阿里巴巴",
    companyEn: "Alibaba",
    logo: "☁️",
    isOpenSource: true,
    contextLength: "128K",
    type: "reasoning",
    superclue: { total: 64.48, math: 84.87, hallucination: 84.87, science: 75.61, instruction: 19.46, coding: 51.04, agent: 71.52 },
    benchlm: { overall: 75, arenaElo: 1450 },
    strengths: ["均衡全能", "幻觉控制", "开源生态"],
    strengthDetail: "BenchLM综合75分国产第二，幻觉控制84.87领先，MATH 500得分93全场最高，开源生态最完善",
    color: "#f97316",
  },
  {
    id: "glm5",
    name: "GLM-5",
    shortName: "GLM-5",
    company: "智谱AI",
    companyEn: "Zhipu AI",
    logo: "🧠",
    isOpenSource: true,
    contextLength: "200K",
    type: "reasoning",
    superclue: { total: 64.27, math: 73.95, hallucination: 86.85, science: 75.00, instruction: 24.86, coding: 58.32, agent: 66.64 },
    benchlm: { overall: 78, arenaElo: 1456 },
    strengths: ["数学天花板", "智能体", "全能王"],
    strengthDetail: "BenchLM综合78分国产第一！AIME 98近乎满分，Terminal-Bench 81智能体能力全球顶级，OSWorld 74媲美GPT-5.4",
    color: "#06b6d4",
  },
  {
    id: "deepseek-v32",
    name: "DeepSeek-V3.2-Thinking",
    shortName: "DeepSeek V3.2",
    company: "深度求索",
    companyEn: "DeepSeek",
    logo: "🐋",
    isOpenSource: true,
    contextLength: "128K",
    type: "reasoning",
    superclue: { total: 61.92, math: 78.15, hallucination: 77.23, science: 73.17, instruction: 25.95, coding: 60.43, agent: 56.62 },
    benchlm: { overall: 66 },
    strengths: ["开源先驱", "均衡发展", "生态广泛"],
    strengthDetail: "开源大模型的标杆，全维度均衡发展无明显短板，全球开发者生态最活跃",
    color: "#10b981",
  },
  {
    id: "mimo-v2",
    name: "MiMo-V2-Pro",
    shortName: "MiMo V2",
    company: "小米集团",
    companyEn: "Xiaomi",
    logo: "📱",
    isOpenSource: true,
    contextLength: "256K",
    type: "reasoning",
    superclue: { total: 60.67, math: 84.03, hallucination: 73.80, science: 74.39, instruction: 16.22, coding: 59.61, agent: 55.97 },
    benchlm: { overall: 70 },
    strengths: ["效率之星", "数学强劲", "长上下文"],
    strengthDetail: "从58分跃升至70分的黑马，AIME 94.1数学强劲，256K超长上下文，SWE-bench 73.4编程出色",
    color: "#f59e0b",
  },
  {
    id: "hy20",
    name: "Tencent HY 2.0 Think",
    shortName: "混元 2.0",
    company: "腾讯",
    companyEn: "Tencent",
    logo: "💎",
    isOpenSource: false,
    contextLength: "128K",
    type: "reasoning",
    superclue: { total: 59.16, math: 76.47, hallucination: 76.46, science: 70.73, instruction: 14.05, coding: 57.58, agent: 59.68 },
    benchlm: { overall: 60 },
    strengths: ["均衡稳健", "科学推理", "企业级"],
    strengthDetail: "腾讯混元系列最新力作，各维度均衡发展，科学推理和幻觉控制表现稳健",
    color: "#3b82f6",
  },
  {
    id: "step35",
    name: "Step-3.5-Flash",
    shortName: "Step 3.5",
    company: "阶跃星辰",
    companyEn: "StepFun",
    logo: "⚡",
    isOpenSource: true,
    contextLength: "128K",
    type: "reasoning",
    superclue: { total: 56.23, math: 80.67, hallucination: 63.94, science: 68.29, instruction: 9.73, coding: 50.71, agent: 64.06 },
    benchlm: { overall: 70 },
    strengths: ["编程新秀", "数学推理", "高性价比"],
    strengthDetail: "LiveCodeBench 86.4全场最高！AIME 97.3接近满分，BenchLM 70分跻身顶级，开源高性价比之选",
    color: "#ec4899",
  },
  {
    id: "minimax-m27",
    name: "MiniMax-M2.7",
    shortName: "MiniMax M2.7",
    company: "稀宇科技",
    companyEn: "MiniMax",
    logo: "✨",
    isOpenSource: false,
    contextLength: "128K",
    type: "non-reasoning",
    superclue: { total: 55.68, math: 78.15, hallucination: 55.61, science: 64.63, instruction: 17.30, coding: 58.74, agent: 59.68 },
    benchlm: { overall: 57 },
    strengths: ["性价比", "编程导向", "多语言"],
    strengthDetail: "SWE-bench Pro 56.22编程实力不俗，SWE-Multilingual 76.5多语言编程突出，极具性价比",
    color: "#a855f7",
  },
  {
    id: "spark-x2",
    name: "Spark X2",
    shortName: "星火 X2",
    company: "科大讯飞",
    companyEn: "iFlytek",
    logo: "🌟",
    isOpenSource: false,
    contextLength: "128K",
    type: "non-reasoning",
    superclue: { total: 52.79, math: 78.15, hallucination: 62.23, science: 71.95, instruction: 1.08, coding: 41.19, agent: 62.13 },
    benchlm: { overall: 50 },
    strengths: ["科学推理", "数学能力", "中文语音"],
    strengthDetail: "科学推理71.95表现突出，数学推理78.15不俗，语音交互领域的传统强者",
    color: "#ef4444",
  },
  {
    id: "longcat",
    name: "LongCat-Flash-Thinking-2601",
    shortName: "LongCat",
    company: "美团",
    companyEn: "Meituan",
    logo: "🐱",
    isOpenSource: true,
    contextLength: "128K",
    type: "reasoning",
    superclue: { total: 57.47, math: 77.31, hallucination: 66.31, science: 69.51, instruction: 11.89, coding: 51.86, agent: 67.94 },
    benchlm: { overall: 58 },
    strengths: ["智能体", "数学推理", "开源"],
    strengthDetail: "美团推出的开源推理模型，智能体任务规划67.94表现亮眼，数学推理77.31稳健",
    color: "#f59e0b",
  },
];

// 维度定义
export const dimensions = [
  { key: "math" as const, label: "数学推理", labelEn: "Math", icon: "∑", color: "#3b82f6", description: "AIME、HMMT等数学竞赛题目" },
  { key: "coding" as const, label: "代码生成", labelEn: "Coding", icon: "{ }", color: "#10b981", description: "SWE-bench、LiveCodeBench等编程评测" },
  { key: "science" as const, label: "科学推理", labelEn: "Science", icon: "🧬", color: "#8b5cf6", description: "GPQA等科学知识推理" },
  { key: "agent" as const, label: "智能体", labelEn: "Agent", icon: "🤖", color: "#f59e0b", description: "Terminal-Bench、OSWorld等工具使用" },
  { key: "hallucination" as const, label: "幻觉控制", labelEn: "Hallucination", icon: "🛡️", color: "#06b6d4", description: "减少模型输出虚假信息的能力" },
  { key: "instruction" as const, label: "指令遵循", labelEn: "Instruction", icon: "🎯", color: "#ec4899", description: "精确理解和执行复杂指令" },
];

// 海外参考模型
export const referenceModels = [
  { name: "Claude Opus 4.6", company: "Anthropic", superclueTotal: 77.02, benchlmOverall: 81 },
  { name: "GPT-5.4", company: "OpenAI", superclueTotal: 72.48, benchlmOverall: 84 },
  { name: "Gemini 3.1 Pro", company: "Google", superclueTotal: 76.69, benchlmOverall: 83 },
];

// BenchLM 分维度数据
export const benchlmCoding = [
  { model: "Kimi K2.5", swebench: 76.8, swebenchPro: 70, livecodebench: 85 },
  { model: "Step 3.5 Flash", swebench: 74.4, swebenchPro: 49, livecodebench: 86.4 },
  { model: "MiMo V2 Flash", swebench: 73.4, swebenchPro: 52, livecodebench: 80.6 },
  { model: "GLM-4.7", swebench: 73.8, swebenchPro: 51, livecodebench: 84.9 },
  { model: "GLM-5", swebench: 62, swebenchPro: 67, livecodebench: 58 },
];

export const benchlmMath = [
  { model: "GLM-5", aime: 98, hmmt: 95, math500: 92 },
  { model: "Kimi K2.5", aime: 96.1, hmmt: 95.4, math500: 92 },
  { model: "MiMo V2 Flash", aime: 94.1, hmmt: 76, math500: 90 },
  { model: "通义千问 3.5", aime: 94, hmmt: 90, math500: 93 },
  { model: "DeepSeek V3.2", aime: 88, hmmt: 84, math500: 84 },
];

export const benchlmAgent = [
  { model: "GLM-5", terminalBench: 81, browseComp: 80, osworld: 74 },
  { model: "通义千问 3.5", terminalBench: 77, browseComp: 78, osworld: 70 },
  { model: "DeepSeek V3.2", terminalBench: 71, browseComp: 70, osworld: 67 },
  { model: "Step 3.5 Flash", terminalBench: 62, browseComp: 66, osworld: 54 },
  { model: "Kimi K2.5", terminalBench: 50.8, browseComp: 60.6, osworld: 63.3 },
];
