/**
 * 国产大模型天梯榜数据
 * 数据来源：SuperCLUE 2026年3月 + BenchLM.ai 2026年3月
 *
 * 动态数据通过 GitHub Actions 每日自动更新以下 JSON 文件：
 *   - models.json           → 模型列表与评测得分
 *   - benchlm.json          → BenchLM 分维度细分数据
 *   - reference-models.json → 海外参考模型数据
 *
 * Design: 竞技场/体育赛事排行美学
 * Color: Deep navy + gold champion + gradient blue
 */

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

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
  superclue: {
    total: number;
    math: number;
    hallucination: number;
    science: number;
    instruction: number;
    coding: number;
    agent: number;
  };
  benchlm: {
    overall: number;
    arenaElo?: number;
  };
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

// ─── 动态数据（由 JSON 文件驱动，每日通过 GitHub Actions 自动更新）────────────

import modelsJson from "./models.json";
import benchlmJson from "./benchlm.json";
import referenceModelsJson from "./reference-models.json";
import metaJson from "./data-meta.json";

export const models: ModelData[] = modelsJson as ModelData[];
export const referenceModels: ReferenceModel[] = referenceModelsJson as ReferenceModel[];
export const benchlmCoding: BenchLMCodingItem[] = (benchlmJson as any).coding as BenchLMCodingItem[];
export const benchlmMath: BenchLMMathItem[] = (benchlmJson as any).math as BenchLMMathItem[];
export const benchlmAgent: BenchLMAgentItem[] = (benchlmJson as any).agent as BenchLMAgentItem[];

/** 数据统计截止日期（格式：YYYY-MM-DD），由 GitHub Actions 自动更新 */
export const dataUpdatedAt: string = (metaJson as any).updatedAt as string;

// ─── 静态配置（维度定义，不随数据更新变化）────────────────────────────────────

export const dimensions = [
  { key: "math" as const, label: "数学推理", labelEn: "Math", icon: "∑", color: "#3b82f6", description: "AIME、HMMT等数学竞赛题目" },
  { key: "coding" as const, label: "代码生成", labelEn: "Coding", icon: "{ }", color: "#10b981", description: "SWE-bench、LiveCodeBench等编程评测" },
  { key: "science" as const, label: "科学推理", labelEn: "Science", icon: "🧬", color: "#8b5cf6", description: "GPQA等科学知识推理" },
  { key: "agent" as const, label: "智能体", labelEn: "Agent", icon: "🤖", color: "#f59e0b", description: "Terminal-Bench、OSWorld等工具使用" },
  { key: "hallucination" as const, label: "幻觉控制", labelEn: "Hallucination", icon: "🛡️", color: "#06b6d4", description: "减少模型输出虚假信息的能力" },
  { key: "instruction" as const, label: "指令遵循", labelEn: "Instruction", icon: "🎯", color: "#ec4899", description: "精确理解和执行复杂指令" },
];
