#!/usr/bin/env node
/**
 * update-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 国产大模型天梯榜 — 每日数据自动更新脚本
 *
 * 职责：
 *   1. 从数据源抓取最新的模型评测数据（SuperCLUE、BenchLM、Chatbot Arena Elo）
 *   2. 将数据标准化并写入以下 JSON 文件：
 *      - client/src/lib/models.json
 *      - client/src/lib/benchlm.json
 *      - client/src/lib/reference-models.json
 *
 * 运行方式：
 *   node scripts/update-data.js
 *
 * 环境变量（可选，用于访问付费/私有 API）：
 *   SUPERCLUE_API_KEY   — SuperCLUE API 密钥
 *   BENCHLM_API_KEY     — BenchLM API 密钥
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 【重要说明】
 * 目前 SuperCLUE 和 BenchLM 尚未提供完全开放的公共 API。
 * 本脚本提供了两种数据获取策略，请根据实际情况选择：
 *
 *   策略 A（推荐）：手动维护 JSON 数据源
 *     将最新数据维护在 scripts/data-source.json 中，脚本读取并同步到前端 JSON。
 *     适合数据不频繁变化、或需要人工审核的场景。
 *
 *   策略 B：接入官方 API（需申请权限）
 *     当 SuperCLUE/BenchLM 提供 API 后，在 fetchFromAPI() 中实现调用逻辑。
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const LIB_DIR = resolve(ROOT, "client/src/lib");
const DATA_SOURCE = resolve(__dirname, "data-source.json");

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[update-data] ${new Date().toISOString()} — ${msg}`);
}

function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  log(`Written: ${filePath}`);
}

// ─── 策略 A：从本地 data-source.json 读取（默认策略）────────────────────────

function loadFromLocalSource() {
  if (!existsSync(DATA_SOURCE)) {
    throw new Error(
      `数据源文件不存在: ${DATA_SOURCE}\n` +
      `请先创建 scripts/data-source.json，或切换到策略 B（API 模式）。\n` +
      `可参考 scripts/data-source.example.json 了解数据格式。`
    );
  }
  log("Using local data source: scripts/data-source.json");
  return JSON.parse(readFileSync(DATA_SOURCE, "utf8"));
}

// ─── 策略 B：从远程 API 获取（需要 API Key，默认注释）────────────────────────

// async function fetchFromAPI() {
//   const superclueKey = process.env.SUPERCLUE_API_KEY;
//   const benchlmKey = process.env.BENCHLM_API_KEY;
//
//   if (!superclueKey || !benchlmKey) {
//     throw new Error("缺少 API Key，请在 GitHub Secrets 中配置 SUPERCLUE_API_KEY 和 BENCHLM_API_KEY");
//   }
//
//   // 示例：调用 SuperCLUE API
//   const superclueRes = await fetch("https://api.superclue.cn/v1/leaderboard", {
//     headers: { Authorization: `Bearer ${superclueKey}` },
//   });
//   const superclueData = await superclueRes.json();
//
//   // 示例：调用 BenchLM API
//   const benchlmRes = await fetch("https://api.benchlm.ai/v1/leaderboard", {
//     headers: { Authorization: `Bearer ${benchlmKey}` },
//   });
//   const benchlmData = await benchlmRes.json();
//
//   return { superclue: superclueData, benchlm: benchlmData };
// }

// ─── 数据转换：将数据源格式标准化为前端所需格式 ──────────────────────────────

function transformData(source) {
  const { models, benchlm, referenceModels } = source;

  // 校验必要字段
  if (!Array.isArray(models) || models.length === 0) {
    throw new Error("数据源中 models 字段为空或格式不正确");
  }
  if (!benchlm || !benchlm.coding || !benchlm.math || !benchlm.agent) {
    throw new Error("数据源中 benchlm 字段缺少 coding/math/agent 子项");
  }
  if (!Array.isArray(referenceModels)) {
    throw new Error("数据源中 referenceModels 字段格式不正确");
  }

  // 对 models 按 superclue.total 降序排列
  const sortedModels = [...models].sort(
    (a, b) => b.superclue.total - a.superclue.total
  );

  return { models: sortedModels, benchlm, referenceModels };
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

async function main() {
  log("Starting data update...");

  let rawData;
  try {
    // 默认使用策略 A（本地数据源）
    // 如需切换到策略 B，将下行替换为: rawData = await fetchFromAPI();
    rawData = loadFromLocalSource();
  } catch (err) {
    console.error(`[update-data] ERROR: ${err.message}`);
    process.exit(1);
  }

  let transformed;
  try {
    transformed = transformData(rawData);
  } catch (err) {
    console.error(`[update-data] 数据转换失败: ${err.message}`);
    process.exit(1);
  }

  // 写入前端 JSON 文件
  writeJson(resolve(LIB_DIR, "models.json"), transformed.models);
  writeJson(resolve(LIB_DIR, "benchlm.json"), transformed.benchlm);
  writeJson(resolve(LIB_DIR, "reference-models.json"), transformed.referenceModels);

  // 写入 data-meta.json（包含数据统计截止日期）
  const meta = {
    updatedAt: rawData._updated || new Date().toISOString().slice(0, 10),
    sources: rawData._sources || []
  };
  writeJson(resolve(LIB_DIR, "data-meta.json"), meta);

  log(`✅ Data update complete! ${transformed.models.length} models processed.`);
}

main();
