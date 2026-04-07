/**
 * 国产大模型天梯榜数据
 * 数据来源：SuperCLUE 2026年3月 + BenchLM.ai 2026年3月
 *
 * 动态数据通过 GitHub Actions 自动更新以下 JSON 文件：
 *   - models.json           → 模型列表与评测得分
 *   - benchlm.json          → BenchLM 分维度细分数据
 *   - reference-models.json → 海外参考模型数据
 *   - data-meta.json        → 数据截止日期、页面生成时间、版本号
 *
 * 更新流程：
 *   scripts/update-data.js
 *     → build-data.js      （标准化 data-source.json）
 *     → validate-data.js   （字段校验）
 *     → generate-latest.js （生成前端文件 + 快照）
 *
 * Design: 竞技场/体育赛事排行美学
 * Color: Deep navy + gold champion + gradient blue
 * Font: DM Sans + Noto Sans SC + JetBrains Mono
 */

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

/** 价格信息（由 data-source.json 的 pricing 字段驱动，前端可选展示） */
export interface ModelPricing {
  hasApi: boolean;
  inputTokenPrice: number | null;
  outputTokenPrice: number | null;
  cacheInputPrice: number | null;
  currency: string;
  pricingUnit: string;
  pricingMode: string;
  subscriptionMode: string | null;
  freeTier: boolean | null;
  hasSubscription: boolean | null;
  enterpriseVersion: boolean | null;
  privateDeployment: boolean | null;
  /**
   * 价格状态枚举：
   *   "public"                  → 官方公开价格
   *   "officially_not_public"   → 官方未公开（需联系商务）
   *   "manual_inquiry_required" → 需人工询价
   *   "no_api_yet"              → 暂未开放 API
   *   "open_source_free"        → 开源免费自部署
   *   "unknown"                 → 未知
   */
  priceStatus: "public" | "officially_not_public" | "manual_inquiry_required" | "no_api_yet" | "open_source_free" | "unknown";
  priceEffectiveDate: string | null;
  priceSourceUrl: string | null;
}

/** 智能路由画像（为未来路由推荐功能预留，当前仅展示） */
export interface ModelRoutingProfile {
  cost_level: "free" | "low" | "medium" | "high" | "unknown";
  speed_level: "fast" | "medium" | "slow" | "unknown";
  quality_level: "high" | "medium_high" | "medium" | "low" | "unknown";
  best_for: string[];
  avoid_for: string[];
  stability_level: "high" | "medium" | "low" | "unknown";
  recommended_for_production: boolean | null;
}

/** 模型完整数据结构 */
export interface ModelData {
  id: string;
  name: string;
  shortName: string;
  company: string;
  companyEn: string;
  logo: string;
  isOpenSource: boolean;
  contextLength: string;
  type: "reasoning" | "non-reasoning";
  status?: "active" | "deprecated" | "beta";

  /** SuperCLUE 六维评测数据 */
  superclue: {
    total: number;
    math: number;
    hallucination: number;
    science: number;
    instruction: number;
    coding: number;
    agent: number;
  };

  /** BenchLM 综合评测数据 */
  benchlm: {
    overall: number;
    arenaElo?: number;
  };

  /** 价格信息（新增，可选展示） */
  pricing?: ModelPricing;

  /** 标签列表（新增，可用于筛选） */
  tags?: string[];

  /** 推荐使用场景（新增） */
  scenarioRecommendations?: string[];

  /** 路由画像（新增，为智能路由预留） */
  routingProfile?: ModelRoutingProfile;

  /** 展示用字段 */
  strengths: string[];
  strengthDetail: string;
  color: string;
}

export interface ReferenceModel {
  name: string;
  company: string;
  superclueTotal: number;
  benchlmOverall: number;
}

export interface BenchLMCodingItem {
  model: string;
  swebench: number;
  swebenchPro: number;
  livecodebench: number;
}

export interface BenchLMMathItem {
  model: string;
  aime: number;
  hmmt: number;
  math500: number;
}

export interface BenchLMAgentItem {
  model: string;
  terminalBench: number;
  browseComp: number;
  osworld: number;
}

/** 来源详情（由 data-source.json 的 sources 字段驱动） */
export interface SourceDetail {
  id: string;
  name: string;
  url: string;
  dataDate: string;
  /** 该来源适用的字段列表（如 capabilities、basic_info） */
  applicableFields: string[];
  /** 信任等级：official > authoritative > aggregated > community > manual */
  trustLevel: "official" | "authoritative" | "aggregated" | "community" | "manual" | "unknown";
}

/** 数据元信息 */
export interface DataMeta {
  /** 数据统计截止日期（格式：YYYY-MM-DD），与模型新品发布节奏对齐，不固定周期 */
  updatedAt: string;
  /** 页面生成时间（ISO 8601），每次 GitHub Actions 运行时自动更新，与数据截止时间是两个不同概念 */
  pageGeneratedAt: string;
  /** 版本号（格式：YYYY.MM.DD） */
  version: string;
  /** 更新批次 ID */
  updateBatchId: string;
  /** 本次更新备注 */
  notes: string;
  /** 数据来源名称列表（展示用） */
  sources: string[];
  /** 详细来源信息（含信任等级和适用字段） */
  sourceDetails?: SourceDetail[];
}

// ─── 动态数据（由 JSON 文件驱动，通过 GitHub Actions 自动更新）────────────────

import modelsJson from "./models.json";
import benchlmJson from "./benchlm.json";
import referenceModelsJson from "./reference-models.json";
import metaJson from "./data-meta.json";

export const models: ModelData[] = modelsJson as ModelData[];
export const referenceModels: ReferenceModel[] = referenceModelsJson as ReferenceModel[];
export const benchlmCoding: BenchLMCodingItem[] = (benchlmJson as any).coding as BenchLMCodingItem[];
export const benchlmMath: BenchLMMathItem[] = (benchlmJson as any).math as BenchLMMathItem[];
export const benchlmAgent: BenchLMAgentItem[] = (benchlmJson as any).agent as BenchLMAgentItem[];

/** 完整元数据对象 */
export const dataMeta: DataMeta = metaJson as DataMeta;

/**
 * 数据统计截止日期（格式：YYYY-MM-DD）
 * 含义：本次榜单数据所覆盖的最晚评测发布日期，与模型新品发布节奏对齐，不固定更新周期
 */
export const dataUpdatedAt: string = dataMeta.updatedAt;

/**
 * 页面生成时间（ISO 8601）
 * 含义：本次 GitHub Actions 运行并重新构建页面的时间，与数据截止时间是两个不同概念
 */
export const pageGeneratedAt: string = dataMeta.pageGeneratedAt;

// ─── 静态配置（维度定义，不随数据更新变化）────────────────────────────────────

export const dimensions = [
  { key: "math" as const,          label: "数学推理", labelEn: "Math",          icon: "∑",   color: "#3b82f6", description: "AIME、HMMT等数学竞赛题目" },
  { key: "coding" as const,        label: "代码生成", labelEn: "Coding",        icon: "{ }", color: "#10b981", description: "SWE-bench、LiveCodeBench等编程评测" },
  { key: "science" as const,       label: "科学推理", labelEn: "Science",       icon: "🧬",  color: "#8b5cf6", description: "GPQA等科学知识推理" },
  { key: "agent" as const,         label: "智能体",   labelEn: "Agent",         icon: "🤖",  color: "#f59e0b", description: "Terminal-Bench、OSWorld等工具使用" },
  { key: "hallucination" as const, label: "幻觉控制", labelEn: "Hallucination", icon: "🛡️", color: "#06b6d4", description: "减少模型输出虚假信息的能力" },
  { key: "instruction" as const,   label: "指令遵循", labelEn: "Instruction",   icon: "🎯",  color: "#ec4899", description: "精确理解和执行复杂指令" },
];
