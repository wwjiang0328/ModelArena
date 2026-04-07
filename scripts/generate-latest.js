#!/usr/bin/env node
/**
 * generate-latest.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 第三步：生成前端消费文件、历史快照和索引
 *
 * 职责：
 *   1. 读取 scripts/sources/combined.json（标准化后的完整数据）
 *   2. 输出前端消费文件到 client/src/lib/：
 *      - models.json           → 模型列表（含能力、价格摘要、标签、展示字段）
 *      - benchlm.json          → BenchLM 分维度细分数据（兼容旧格式）
 *      - reference-models.json → 海外参考模型数据
 *      - data-meta.json        → 元数据（截止日期、版本号、生成时间）
 *   3. 按日期归档快照到 scripts/snapshots/YYYY-MM-DD/
 *   4. 更新 scripts/snapshots/history-index.json
 *
 * 运行方式：
 *   node scripts/generate-latest.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const COMBINED = resolve(__dirname, "sources", "combined.json");
const LIB_DIR = resolve(ROOT, "client/src/lib");
const SNAPSHOTS_DIR = resolve(__dirname, "snapshots");
const HISTORY_INDEX = resolve(SNAPSHOTS_DIR, "history-index.json");

function log(msg) {
  console.log(`[generate-latest] ${new Date().toISOString()} — ${msg}`);
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

// ─── 将标准化模型转换为前端消费格式（兼容现有 data.ts 类型定义）─────────────

function toFrontendModel(m) {
  const caps = m.capabilities || {};
  const pricing = m.pricing || {};
  const display = m.display || {};

  return {
    // 基础信息（保持与旧格式兼容）
    id: m.model_id,
    name: m.model_name,
    shortName: m.short_name,
    company: m.vendor_name,
    companyEn: m.vendor_name_en,
    logo: m.logo,
    isOpenSource: m.open_source,
    contextLength: m.context_window,
    type: m.model_type,
    status: m.status,

    // 能力评测（保持旧格式兼容）
    superclue: {
      total:         caps.superclue_total         ?? 0,
      math:          caps.math_reasoning          ?? 0,
      hallucination: caps.hallucination_control   ?? 0,
      science:       caps.science_reasoning       ?? 0,
      instruction:   caps.instruction_following   ?? 0,
      coding:        caps.code_generation         ?? 0,
      agent:         caps.agent                   ?? 0,
    },
    benchlm: {
      overall:  caps.benchlm_score ?? 0,
      arenaElo: caps.arena_elo     ?? undefined,
    },

    // 价格摘要（新增字段，前端可选展示）
    pricing: {
      hasApi:            pricing.has_api            ?? false,
      inputTokenPrice:   pricing.input_token_price  ?? null,
      outputTokenPrice:  pricing.output_token_price ?? null,
      currency:          pricing.currency           ?? "CNY",
      pricingMode:       pricing.pricing_mode       ?? "未知",
      freeTier:          pricing.free_tier          ?? null,
      privateDeployment: pricing.private_deployment ?? null,
      priceStatus:       pricing.price_status       ?? "unknown",
      priceSourceUrl:    pricing.price_source_url   ?? null,
    },

    // 标签与推荐场景（新增字段）
    tags: m.tags || [],
    scenarioRecommendations: m.scenario_recommendations || [],

    // 路由画像（新增字段，为智能路由预留）
    routingProfile: m.routing_profile || null,

    // 展示字段
    strengths: m.tags || [],
    strengthDetail: display.strength_detail || "",
    color: display.color || "#6b7280",
  };
}

// ─── 将 benchmarks 转换为前端消费格式（兼容旧 benchlm.json 格式）────────────

function toBenchLMFrontend(benchmarks) {
  const coding = (benchmarks.coding || []).map(item => ({
    model:          item.model_label || item.model_id,
    swebench:       item.swebench       ?? item.swebench_verified ?? 0,
    swebenchPro:    item.swebench_pro   ?? item.swebenchPro       ?? 0,
    livecodebench:  item.livecodebench  ?? 0,
  }));

  const math = (benchmarks.math || []).map(item => ({
    model:    item.model_label || item.model_id,
    aime:     item.aime    ?? 0,
    hmmt:     item.hmmt    ?? 0,
    math500:  item.math500 ?? 0,
  }));

  const agent = (benchmarks.agent || []).map(item => ({
    model:         item.model_label || item.model_id,
    terminalBench: item.terminal_bench ?? item.terminalBench ?? 0,
    browseComp:    item.browse_comp    ?? item.browseComp    ?? 0,
    osworld:       item.osworld        ?? 0,
  }));

  return { coding, math, agent };
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

async function main() {
  log("Starting generate-latest...");

  if (!existsSync(COMBINED)) {
    console.error(`[generate-latest] ERROR: 找不到 ${COMBINED}，请先运行 build-data.js`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(COMBINED, "utf8"));
  const { meta, models, benchmarks, reference_models, sources } = data;

  ensureDir(LIB_DIR);
  ensureDir(SNAPSHOTS_DIR);

  // ── 1. 生成前端消费文件 ──────────────────────────────────────────────────────

  // models.json
  const frontendModels = models.map(toFrontendModel);
  writeJson(resolve(LIB_DIR, "models.json"), frontendModels);

  // benchlm.json（兼容旧格式）
  const benchlmFrontend = toBenchLMFrontend(benchmarks || {});
  writeJson(resolve(LIB_DIR, "benchlm.json"), benchlmFrontend);

  // reference-models.json（兼容旧格式）
  const refModels = (reference_models || []).map(r => ({
    name:             r.model_name || r.name,
    company:          r.vendor_name || r.company,
    superclueTotal:   r.superclue_total   ?? r.superclueTotal   ?? 0,
    benchlmOverall:   r.benchlm_overall   ?? r.benchlmOverall   ?? 0,
  }));
  writeJson(resolve(LIB_DIR, "reference-models.json"), refModels);

  // data-meta.json（新增 page_generated_at 字段）
  const dataMeta = {
    updatedAt:        meta.data_cutoff_date,
    pageGeneratedAt:  meta.page_generated_at,
    version:          meta.version,
    updateBatchId:    meta.update_batch_id,
    notes:            meta.notes || "",
    sources:          (sources || []).map(s => s.name),
  };
  writeJson(resolve(LIB_DIR, "data-meta.json"), dataMeta);

  // ── 2. 归档快照 ──────────────────────────────────────────────────────────────

  const snapshotDate = meta.data_cutoff_date || new Date().toISOString().slice(0, 10);
  const snapshotDir = resolve(SNAPSHOTS_DIR, snapshotDate);
  ensureDir(snapshotDir);

  writeJson(resolve(snapshotDir, "models.json"), frontendModels);
  writeJson(resolve(snapshotDir, "benchmarks.json"), benchlmFrontend);
  writeJson(resolve(snapshotDir, "pricing.json"), models.map(m => ({
    model_id: m.model_id,
    short_name: m.short_name,
    pricing: m.pricing,
  })));
  writeJson(resolve(snapshotDir, "metadata.json"), dataMeta);

  // ── 3. 更新 history-index.json ───────────────────────────────────────────────

  let historyIndex = [];
  if (existsSync(HISTORY_INDEX)) {
    try {
      historyIndex = JSON.parse(readFileSync(HISTORY_INDEX, "utf8"));
    } catch {
      historyIndex = [];
    }
  }

  // 去重：同一 data_cutoff_date 只保留最新一条
  historyIndex = historyIndex.filter(h => h.data_cutoff_date !== snapshotDate);
  historyIndex.unshift({
    version:          meta.version,
    data_cutoff_date: snapshotDate,
    generated_at:     meta.page_generated_at,
    update_batch_id:  meta.update_batch_id,
    model_count:      models.length,
    snapshot_path:    `snapshots/${snapshotDate}/models.json`,
    notes:            meta.notes || "",
  });

  writeJson(HISTORY_INDEX, historyIndex);

  log(`✅ generate-latest complete! ${models.length} models → frontend + snapshot[${snapshotDate}].`);
}

main();
