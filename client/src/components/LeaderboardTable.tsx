/**
 * LeaderboardTable - 完整排行榜表格
 * Design: 竞技场风格，hover展开详情，进度条动画
 * 新增：版本号展示、价格摘要、开源/API/推理类型筛选器
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, ExternalLink, Lock, Unlock, Info,
  Filter, X, DollarSign, Cpu, Zap
} from "lucide-react";
import { models, dimensions, dataMeta, type ModelData } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const sorted = [...models].sort((a, b) => b.superclue.total - a.superclue.total);

type SortKey = "total" | "math" | "coding" | "science" | "agent" | "hallucination" | "instruction" | "benchlm";
type FilterOpenSource = "all" | "open" | "closed";
type FilterApi = "all" | "has_api" | "no_api";
type FilterType = "all" | "reasoning" | "non-reasoning";

function ProgressBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth((value / max) * 100), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, max, delay]);

  return (
    <div ref={ref} className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-medium text-foreground/80 w-10 text-right tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

/** 价格状态徽章 */
function PriceStatusBadge({ status, inputPrice, outputPrice, currency }: {
  status: string;
  inputPrice: number | null;
  outputPrice: number | null;
  currency: string;
}) {
  if (status === "public" && inputPrice !== null) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-emerald-400 font-mono tabular-nums">
          输入 {inputPrice} {currency}/M
        </span>
        {outputPrice !== null && (
          <span className="text-[10px] text-emerald-400/70 font-mono tabular-nums">
            输出 {outputPrice} {currency}/M
          </span>
        )}
      </div>
    );
  }
  if (status === "open_source_free") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">开源免费</span>;
  }
  if (status === "no_api_yet") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">暂无 API</span>;
  }
  if (status === "officially_not_public") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20">联系商务</span>;
  }
  return <span className="text-[10px] text-muted-foreground">—</span>;
}

export default function LeaderboardTable() {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 筛选状态
  const [filterOpenSource, setFilterOpenSource] = useState<FilterOpenSource>("all");
  const [filterApi, setFilterApi] = useState<FilterApi>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const hasActiveFilter = filterOpenSource !== "all" || filterApi !== "all" || filterType !== "all";

  const clearFilters = () => {
    setFilterOpenSource("all");
    setFilterApi("all");
    setFilterType("all");
  };

  const filteredAndSorted = [...sorted]
    .filter((m) => {
      if (filterOpenSource === "open" && !m.isOpenSource) return false;
      if (filterOpenSource === "closed" && m.isOpenSource) return false;
      if (filterApi === "has_api" && !m.pricing?.hasApi) return false;
      if (filterApi === "no_api" && m.pricing?.hasApi) return false;
      if (filterType === "reasoning" && m.type !== "reasoning") return false;
      if (filterType === "non-reasoning" && m.type !== "non-reasoning") return false;
      return true;
    })
    .sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "total") { va = a.superclue.total; vb = b.superclue.total; }
      else if (sortKey === "benchlm") { va = a.benchlm.overall; vb = b.benchlm.overall; }
      else { va = a.superclue[sortKey]; vb = b.superclue[sortKey]; }
      return sortAsc ? va - vb : vb - va;
    });

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />;
  };

  return (
    <section className="container py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* 标题行：含版本号 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">综合排行榜</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              SuperCLUE {dataMeta.updatedAt.replace(/^(\d{4})-(\d{2})-\d{2}$/, (_, y, m) => `${y}.${m}`)}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-sky-400/80 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-md cursor-default font-mono">
                  v{dataMeta.version}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">数据截止：{dataMeta.updatedAt}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{dataMeta.notes}</p>
              </TooltipContent>
            </Tooltip>
            {filteredAndSorted.length !== sorted.length && (
              <span className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md">
                已筛选 {filteredAndSorted.length} / {sorted.length}
              </span>
            )}
          </div>
        </div>

        {/* 筛选器工具栏 */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground mr-1">筛选：</span>

          {/* 开源状态筛选 */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
            {([["all", "全部"], ["open", "开源"], ["closed", "闭源"]] as [FilterOpenSource, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterOpenSource(val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                  filterOpenSource === val
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* API 可用性筛选 */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
            {([["all", "全部 API"], ["has_api", "有 API"], ["no_api", "无 API"]] as [FilterApi, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterApi(val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                  filterApi === val
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 模型类型筛选 */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
            {([["all", "全部类型"], ["reasoning", "推理型"], ["non-reasoning", "通用型"]] as [FilterType, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterType(val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                  filterType === val
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 清除筛选 */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> 清除
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-12">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground min-w-[180px]">模型</th>
                <th className="text-center px-2 py-3 font-semibold text-muted-foreground w-16">
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1">开源 <Info className="w-3 h-3" /></TooltipTrigger>
                    <TooltipContent>模型权重是否公开可下载</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left px-3 py-3 font-semibold text-muted-foreground min-w-[110px]">
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> 价格
                    </TooltipTrigger>
                    <TooltipContent>API 调用价格（元/百万 token）</TooltipContent>
                  </Tooltip>
                </th>
                <th
                  className="text-right px-4 py-3 font-semibold cursor-pointer hover:text-amber-400 transition-colors select-none"
                  onClick={() => handleSort("total")}
                >
                  <span className="inline-flex items-center gap-1 justify-end text-amber-400">
                    总分 <SortIcon k="total" />
                  </span>
                </th>
                {dimensions.map((d) => (
                  <th
                    key={d.key}
                    className="text-left px-3 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors select-none min-w-[150px]"
                    onClick={() => handleSort(d.key as SortKey)}
                  >
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 text-muted-foreground">
                        <span>{d.icon}</span> {d.label} <SortIcon k={d.key as SortKey} />
                      </TooltipTrigger>
                      <TooltipContent>{d.description}</TooltipContent>
                    </Tooltip>
                  </th>
                ))}
                <th
                  className="text-right px-4 py-3 font-semibold cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort("benchlm")}
                >
                  <span className="inline-flex items-center gap-1 justify-end text-muted-foreground">
                    BenchLM <SortIcon k="benchlm" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground text-sm">
                    没有符合条件的模型，请调整筛选条件
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((model, idx) => (
                  <TableRow
                    key={model.id}
                    model={model}
                    rank={idx + 1}
                    isExpanded={expandedId === model.id}
                    onToggle={() => setExpandedId(expandedId === model.id ? null : model.id)}
                    delay={idx * 50}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 数据来源说明 */}
        {dataMeta.sourceDetails && dataMeta.sourceDetails.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {dataMeta.sourceDetails.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {s.name}
                <span className="text-muted-foreground/50">（{s.dataDate}）</span>
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function TableRow({
  model,
  rank,
  isExpanded,
  onToggle,
  delay,
}: {
  model: ModelData;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const rankBadge = rank <= 3
    ? rank === 1
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : rank === 2
      ? "bg-gray-400/20 text-gray-300 border-gray-400/30"
      : "bg-orange-600/20 text-orange-400 border-orange-600/30"
    : "bg-muted text-muted-foreground border-transparent";

  const pricing = model.pricing;

  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer group"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${rankBadge}`}>
            {rank}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{model.logo}</span>
            <div>
              <div className="font-semibold text-foreground group-hover:text-amber-400 transition-colors flex items-center gap-2">
                {model.shortName}
                {model.type === "reasoning" && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-medium">
                    推理
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
              <div className="text-xs text-muted-foreground">{model.company} · {model.contextLength}</div>
            </div>
          </div>
        </td>
        <td className="text-center px-2 py-3">
          {model.isOpenSource ? (
            <Unlock className="w-4 h-4 text-emerald-400 mx-auto" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground/50 mx-auto" />
          )}
        </td>
        <td className="px-3 py-3">
          {pricing ? (
            <PriceStatusBadge
              status={pricing.priceStatus}
              inputPrice={pricing.inputTokenPrice}
              outputPrice={pricing.outputTokenPrice}
              currency={pricing.currency}
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </td>
        <td className="text-right px-4 py-3">
          <span className="text-lg font-extrabold font-mono text-amber-400 tabular-nums">
            {model.superclue.total.toFixed(2)}
          </span>
        </td>
        {dimensions.map((d, i) => (
          <td key={d.key} className="px-3 py-3">
            <ProgressBar
              value={model.superclue[d.key]}
              max={100}
              color={d.color}
              delay={delay + i * 80}
            />
          </td>
        ))}
        <td className="text-right px-4 py-3">
          <span className="text-sm font-bold font-mono text-foreground/70 tabular-nums">{model.benchlm.overall}</span>
          {model.benchlm.arenaElo && (
            <div className="text-[10px] text-muted-foreground">Elo {model.benchlm.arenaElo}</div>
          )}
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={11} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-accent/30 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* 左侧：模型描述 */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        {model.name}
                        {model.isOpenSource && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            开源
                          </span>
                        )}
                        {model.type === "reasoning" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            推理型
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{model.strengthDetail}</p>

                      {/* 商业化信息 */}
                      {pricing && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {pricing.hasApi && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              <Zap className="w-2.5 h-2.5" /> API 可用
                            </span>
                          )}
                          {pricing.freeTier && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              免费额度
                            </span>
                          )}
                          {pricing.privateDeployment && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              支持私有化部署
                            </span>
                          )}
                          {pricing.enterpriseVersion && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              企业版可用
                            </span>
                          )}
                          {pricing.priceStatus === "public" && pricing.inputTokenPrice !== null && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <DollarSign className="w-2.5 h-2.5" />
                              输入 {pricing.inputTokenPrice} · 输出 {pricing.outputTokenPrice} {pricing.currency}/M token
                            </span>
                          )}
                          {pricing.subscriptionMode && pricing.subscriptionMode !== "无" && pricing.subscriptionMode !== "暂无" && pricing.subscriptionMode !== "无订阅制" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              {pricing.subscriptionMode}
                            </span>
                          )}
                          {pricing.priceSourceUrl && (
                            <a
                              href={pricing.priceSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> 价格详情
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 右侧：标签 */}
                    <div className="flex flex-wrap gap-2 items-start sm:max-w-[200px]">
                      {model.strengths.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2.5 py-1 rounded-lg border border-border bg-muted/50 text-foreground/80 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
