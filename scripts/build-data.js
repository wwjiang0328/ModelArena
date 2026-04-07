#!/usr/bin/env node
/**
 * build-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 第一步：将 data-source.json 转换为标准化中间数据结构
 *
 * 职责：
 *   1. 读取 scripts/data-source.json（原始数据源）
 *   2. 对字段进行标准化处理（字段名统一、类型校正、兼容旧格式）
 *   3. 输出标准化中间数据到 scripts/sources/ 目录：
 *      - model-basic.json       → 模型基础信息
 *      - model-benchmarks.json  → 能力评测数据
 *      - model-pricing.json     → 价格信息
 *      - model-tags.json        → 标签与推荐场景
 *      - model-routing.json     → 智能路由预留字段
 *      - model-sources.json     → 数据来源引用
 *      - meta.json              → 元数据（截止日期、版本号等）
 *
 * 运行方式：
 *   node scripts/build-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_SOURCE = resolve(__dirname, "data-source.json");
const SOURCES_DIR = resolve(__dirname, "sources");

function log(msg) {
  console.log(`[build-data] ${new Date().toISOString()} — ${msg}`);
}

function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  log(`Written: ${filePath}`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

// ─── 标准化单个模型数据 ────────────────────────────────────────────────────────

function normalizeModel(raw) {
  // 兼容旧格式（id → model_id，company → vendor_name 等）
  const modelId = raw.model_id || raw.id;
  const modelName = raw.model_name || raw.name;
  const shortName = raw.short_name || raw.shortName;
  const vendorName = raw.vendor_name || raw.company;
  const vendorNameEn = raw.vendor_name_en || raw.companyEn;
  const openSource = raw.open_source !== undefined ? raw.open_source : raw.isOpenSource;
  const contextWindow = raw.context_window || raw.contextLength;
  const modelType = raw.model_type || raw.type;

  if (!modelId) throw new Error(`模型缺少 model_id 字段：${JSON.stringify(raw).slice(0, 80)}`);
  if (!modelName) throw new Error(`模型 ${modelId} 缺少 model_name 字段`);

  // 能力字段：兼容新格式（capabilities.*）和旧格式（superclue.* + benchlm.*）
  const caps = raw.capabilities || {};
  const superclue = raw.superclue || {};
  const benchlm = raw.benchlm || {};

  const capabilities = {
    math_reasoning:          caps.math_reasoning          ?? superclue.math          ?? null,
    code_generation:         caps.code_generation         ?? superclue.coding         ?? null,
    science_reasoning:       caps.science_reasoning       ?? superclue.science        ?? null,
    agent:                   caps.agent                   ?? superclue.agent          ?? null,
    hallucination_control:   caps.hallucination_control   ?? superclue.hallucination  ?? null,
    instruction_following:   caps.instruction_following   ?? superclue.instruction    ?? null,
    superclue_total:         caps.superclue_total         ?? superclue.total          ?? null,
    benchlm_score:           caps.benchlm_score           ?? benchlm.overall          ?? null,
    arena_elo:               caps.arena_elo               ?? benchlm.arenaElo         ?? null,
  };

  // 价格字段：兼容旧格式（无 pricing 字段时填充默认值）
  const pricing = raw.pricing || {
    has_api: false,
    input_token_price: null,
    output_token_price: null,
    cache_input_price: null,
    currency: "CNY",
    pricing_unit: "per_1M_tokens",
    pricing_mode: "未知",
    subscription_mode: "未知",
    free_tier: null,
    has_subscription: null,
    enterprise_version: null,
    private_deployment: null,
    price_status: "unknown",
    price_effective_date: null,
    price_source_url: null,
  };

  // 标签与推荐场景：兼容旧格式（strengths → tags）
  const tags = raw.tags || raw.strengths || [];
  const scenarioRecommendations = raw.scenario_recommendations || [];

  // 路由画像：兼容旧格式（无 routing_profile 时填充默认值）
  const routingProfile = raw.routing_profile || {
    cost_level: "unknown",
    speed_level: "unknown",
    quality_level: "unknown",
    best_for: [],
    avoid_for: [],
    stability_level: "unknown",
    recommended_for_production: null,
  };

  // 来源引用
  const sourceRefs = raw.source_refs || { capabilities: [], pricing: [], basic_info: [] };

  // 展示字段：兼容旧格式
  const display = raw.display || {
    color: raw.color || "#6b7280",
    strength_detail: raw.strengthDetail || "",
  };

  return {
    model_id: modelId,
    model_name: modelName,
    short_name: shortName,
    vendor_name: vendorName,
    vendor_name_en: vendorNameEn,
    logo: raw.logo || "🤖",
    open_source: openSource,
    context_window: contextWindow,
    model_type: modelType,
    status: raw.status || "active",
    latest_version_label: raw.latest_version_label || null,
    capabilities,
    pricing,
    tags,
    scenario_recommendations: scenarioRecommendations,
    routing_profile: routingProfile,
    source_refs: sourceRefs,
    display,
  };
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

async function main() {
  log("Starting build-data...");

  if (!existsSync(DATA_SOURCE)) {
    console.error(`[build-data] ERROR: 数据源文件不存在: ${DATA_SOURCE}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(DATA_SOURCE, "utf8"));
  ensureDir(SOURCES_DIR);

  // 1. 标准化所有模型
  const normalizedModels = [];
  for (const m of raw.models || []) {
    try {
      normalizedModels.push(normalizeModel(m));
    } catch (err) {
      console.error(`[build-data] 模型标准化失败: ${err.message}`);
      process.exit(1);
    }
  }

  // 2. 按 superclue_total 降序排列
  normalizedModels.sort((a, b) =>
    (b.capabilities.superclue_total || 0) - (a.capabilities.superclue_total || 0)
  );

  // 3. 拆分输出到 sources/ 子文件
  const modelBasic = normalizedModels.map(m => ({
    model_id: m.model_id,
    model_name: m.model_name,
    short_name: m.short_name,
    vendor_name: m.vendor_name,
    vendor_name_en: m.vendor_name_en,
    logo: m.logo,
    open_source: m.open_source,
    context_window: m.context_window,
    model_type: m.model_type,
    status: m.status,
    latest_version_label: m.latest_version_label,
    display: m.display,
  }));

  const modelBenchmarks = normalizedModels.map(m => ({
    model_id: m.model_id,
    capabilities: m.capabilities,
    source_refs: m.source_refs,
  }));

  const modelPricing = normalizedModels.map(m => ({
    model_id: m.model_id,
    pricing: m.pricing,
  }));

  const modelTags = normalizedModels.map(m => ({
    model_id: m.model_id,
    tags: m.tags,
    scenario_recommendations: m.scenario_recommendations,
  }));

  const modelRouting = normalizedModels.map(m => ({
    model_id: m.model_id,
    routing_profile: m.routing_profile,
  }));

  const modelSources = raw.sources || [];

  // 4. 标准化 meta
  const now = new Date();
  const meta = {
    data_cutoff_date: raw.meta?.data_cutoff_date || now.toISOString().slice(0, 10),
    page_generated_at: now.toISOString(),
    version: raw.meta?.version || now.toISOString().slice(0, 10).replace(/-/g, "."),
    update_batch_id: raw.meta?.update_batch_id || `batch-${now.toISOString().slice(0, 10).replace(/-/g, "")}`,
    notes: raw.meta?.notes || "",
    model_count: normalizedModels.length,
  };

  // 5. 写入各子文件
  writeJson(resolve(SOURCES_DIR, "model-basic.json"), modelBasic);
  writeJson(resolve(SOURCES_DIR, "model-benchmarks.json"), modelBenchmarks);
  writeJson(resolve(SOURCES_DIR, "model-pricing.json"), modelPricing);
  writeJson(resolve(SOURCES_DIR, "model-tags.json"), modelTags);
  writeJson(resolve(SOURCES_DIR, "model-routing.json"), modelRouting);
  writeJson(resolve(SOURCES_DIR, "model-sources.json"), modelSources);
  writeJson(resolve(SOURCES_DIR, "meta.json"), meta);

  // 6. 同时输出合并后的完整标准化数据（供后续脚本使用）
  const combined = {
    meta,
    models: normalizedModels,
    benchmarks: raw.benchmarks || {},
    reference_models: raw.reference_models || raw.referenceModels || [],
    sources: modelSources,
    history_refs: raw.history_refs || [],
  };
  writeJson(resolve(SOURCES_DIR, "combined.json"), combined);

  log(`✅ build-data complete! ${normalizedModels.length} models normalized.`);
}

main();
