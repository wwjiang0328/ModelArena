#!/usr/bin/env node
/**
 * update-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 数据更新主入口脚本（串联三步流程）
 *
 * 执行顺序：
 *   1. build-data.js    → 标准化 data-source.json → sources/combined.json
 *   2. validate-data.js → 校验数据完整性和格式合法性
 *   3. generate-latest.js → 生成前端文件 + 快照 + history-index.json
 *
 * 若任意步骤失败，后续步骤不会执行。
 *
 * 运行方式：
 *   node scripts/update-data.js
 *
 * 也可单独运行各步骤：
 *   node scripts/build-data.js
 *   node scripts/validate-data.js
 *   node scripts/generate-latest.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { execSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function log(msg) {
  console.log(`[update-data] ${new Date().toISOString()} — ${msg}`);
}

function runStep(scriptName) {
  const scriptPath = resolve(__dirname, scriptName);
  log(`Running: ${scriptName}...`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`\n[update-data] ❌ Step failed: ${scriptName}`);
    process.exit(1);
  }
}

async function main() {
  log("=== Starting full data update pipeline ===");

  runStep("build-data.js");
  runStep("validate-data.js");
  runStep("generate-latest.js");

  log("=== ✅ Data update pipeline complete! ===");
}

main();
