#!/usr/bin/env node
/**
 * validate-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 第二步：数据校验脚本
 *
 * 校验规则：
 *   1. 每个模型必须有唯一 model_id
 *   2. 日期必须统一为 YYYY-MM-DD 格式
 *   3. 时间必须统一为 ISO 8601 格式
 *   4. 分数字段必须是数值或 null
 *   5. 布尔字段不能混用 "yes"/"true"/1 等写法
 *   6. 价格字段必须配套币种和计费单位
 *   7. 每个 source_ref 必须在 sources 节点中存在
 *   8. benchmarks 中的 model_id 必须能在 models 列表中找到
 *
 * 若校验失败，输出错误列表并以非零状态码退出，阻止后续脚本执行
 *
 * 运行方式：
 *   node scripts/validate-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMBINED = resolve(__dirname, "sources", "combined.json");

function log(msg) {
  console.log(`[validate-data] ${new Date().toISOString()} — ${msg}`);
}

const errors = [];
const warnings = [];

function addError(msg) {
  errors.push(`❌ ${msg}`);
}

function addWarning(msg) {
  warnings.push(`⚠️  ${msg}`);
}

// ─── 校验规则 ─────────────────────────────────────────────────────────────────

function validateDate(value, fieldPath) {
  if (value === null || value === undefined) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    addError(`${fieldPath} 日期格式不合法（应为 YYYY-MM-DD）：${value}`);
  }
}

function validateISODateTime(value, fieldPath) {
  if (value === null || value === undefined) return;
  if (isNaN(Date.parse(value))) {
    addError(`${fieldPath} 时间格式不合法（应为 ISO 8601）：${value}`);
  }
}

function validateNumber(value, fieldPath, allowNull = true) {
  if (value === null || value === undefined) {
    if (!allowNull) addError(`${fieldPath} 不能为 null`);
    return;
  }
  if (typeof value !== "number" || isNaN(value)) {
    addError(`${fieldPath} 必须是数值或 null，当前值：${JSON.stringify(value)}`);
  }
}

function validateBoolean(value, fieldPath, allowNull = true) {
  if (value === null || value === undefined) {
    if (!allowNull) addError(`${fieldPath} 不能为 null`);
    return;
  }
  if (typeof value !== "boolean") {
    addError(`${fieldPath} 必须是布尔值（true/false），不能使用 "${value}"（类型：${typeof value}）`);
  }
}

function validateString(value, fieldPath, required = true) {
  if (value === null || value === undefined || value === "") {
    if (required) addError(`${fieldPath} 不能为空`);
    return;
  }
  if (typeof value !== "string") {
    addError(`${fieldPath} 必须是字符串，当前值：${JSON.stringify(value)}`);
  }
}

// ─── 主校验逻辑 ───────────────────────────────────────────────────────────────

function validateMeta(meta) {
  if (!meta) { addError("缺少 meta 字段"); return; }
  validateDate(meta.data_cutoff_date, "meta.data_cutoff_date");
  validateISODateTime(meta.page_generated_at, "meta.page_generated_at");
  validateString(meta.version, "meta.version");
  validateString(meta.update_batch_id, "meta.update_batch_id");
}

function validateSources(sources) {
  if (!Array.isArray(sources)) { addError("sources 必须是数组"); return; }
  const sourceIds = new Set();
  for (const s of sources) {
    validateString(s.source_id, `sources[].source_id`);
    if (s.source_id) {
      if (sourceIds.has(s.source_id)) {
        addError(`source_id 重复：${s.source_id}`);
      }
      sourceIds.add(s.source_id);
    }
    validateDate(s.data_date, `sources[${s.source_id}].data_date`);
  }
  return sourceIds;
}

function validateModels(models, sourceIds) {
  if (!Array.isArray(models) || models.length === 0) {
    addError("models 必须是非空数组");
    return new Set();
  }

  const modelIds = new Set();

  for (const m of models) {
    const mid = m.model_id;

    // 1. 唯一 model_id
    validateString(mid, "model.model_id");
    if (mid) {
      if (modelIds.has(mid)) {
        addError(`model_id 重复：${mid}`);
      }
      modelIds.add(mid);
    }

    const prefix = `models[${mid}]`;

    // 2. 基础字段
    validateString(m.model_name, `${prefix}.model_name`);
    validateString(m.short_name, `${prefix}.short_name`);
    validateString(m.vendor_name, `${prefix}.vendor_name`);
    validateBoolean(m.open_source, `${prefix}.open_source`, false);
    validateString(m.context_window, `${prefix}.context_window`);

    // 3. 能力字段（数值或 null）
    const caps = m.capabilities || {};
    const capFields = [
      "math_reasoning", "code_generation", "science_reasoning",
      "agent", "hallucination_control", "instruction_following",
      "superclue_total", "benchlm_score"
    ];
    for (const f of capFields) {
      validateNumber(caps[f], `${prefix}.capabilities.${f}`);
    }

    // 4. 价格字段
    const p = m.pricing;
    if (!p) {
      addWarning(`${prefix} 缺少 pricing 字段`);
    } else {
      validateBoolean(p.has_api, `${prefix}.pricing.has_api`, false);
      validateNumber(p.input_token_price, `${prefix}.pricing.input_token_price`);
      validateNumber(p.output_token_price, `${prefix}.pricing.output_token_price`);

      // 若有价格数值，必须有币种和计费单位
      if (p.input_token_price !== null || p.output_token_price !== null) {
        if (!p.currency) addError(`${prefix}.pricing.currency 不能为空（有价格数值时必填）`);
        if (!p.pricing_unit) addError(`${prefix}.pricing.pricing_unit 不能为空（有价格数值时必填）`);
      }

      // price_status 必须是合法枚举值
      const validPriceStatus = [
        "public", "officially_not_public", "manual_inquiry_required",
        "no_api_yet", "open_source_free", "unknown"
      ];
      if (p.price_status && !validPriceStatus.includes(p.price_status)) {
        addError(`${prefix}.pricing.price_status 值不合法：${p.price_status}，合法值：${validPriceStatus.join(", ")}`);
      }

      validateDate(p.price_effective_date, `${prefix}.pricing.price_effective_date`);
    }

    // 5. source_refs 引用必须存在于 sources 中
    const refs = m.source_refs || {};
    for (const [refType, refList] of Object.entries(refs)) {
      if (!Array.isArray(refList)) continue;
      for (const refId of refList) {
        if (sourceIds && !sourceIds.has(refId)) {
          addError(`${prefix}.source_refs.${refType} 引用了不存在的 source_id：${refId}`);
        }
      }
    }

    // 6. 标签必须是字符串数组
    if (!Array.isArray(m.tags)) {
      addError(`${prefix}.tags 必须是数组`);
    }
  }

  return modelIds;
}

function validateBenchmarks(benchmarks, modelIds) {
  if (!benchmarks) { addWarning("缺少 benchmarks 字段"); return; }

  for (const [category, items] of Object.entries(benchmarks)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      // benchmarks 中的 model_id 必须能在 models 中找到（允许不存在，仅警告）
      if (item.model_id && modelIds && !modelIds.has(item.model_id)) {
        addWarning(`benchmarks.${category}[].model_id "${item.model_id}" 在 models 列表中不存在`);
      }
      // 分数字段必须是数值
      for (const [k, v] of Object.entries(item)) {
        if (k === "model_id" || k === "model_label") continue;
        validateNumber(v, `benchmarks.${category}[${item.model_id}].${k}`);
      }
    }
  }
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

async function main() {
  log("Starting validate-data...");

  if (!existsSync(COMBINED)) {
    console.error(`[validate-data] ERROR: 找不到 ${COMBINED}，请先运行 build-data.js`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(COMBINED, "utf8"));

  validateMeta(data.meta);
  const sourceIds = validateSources(data.sources);
  const modelIds = validateModels(data.models, sourceIds);
  validateBenchmarks(data.benchmarks, modelIds);

  // 输出结果
  if (warnings.length > 0) {
    console.log("\n[validate-data] Warnings:");
    warnings.forEach(w => console.log(`  ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\n[validate-data] ❌ 校验失败，共 ${errors.length} 个错误：`);
    errors.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }

  log(`✅ validate-data passed! ${data.models?.length || 0} models validated, ${warnings.length} warnings.`);
}

main();
