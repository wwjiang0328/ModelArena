/**
 * LeaderboardTable - 综合排行榜
 * Desktop: 全宽表格，无横向滚动条，六维度进度条紧凑排列
 * Mobile:  卡片式布局，每张卡片展示模型核心信息
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, ExternalLink, Lock, Unlock, Info,
  Filter, X, DollarSign, Zap, ChevronRight
} from "lucide-react";
import { models, dimensions, dataMeta, type ModelData } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const sorted = [...models].sort((a, b) => b.superclue.total - a.superclue.total);

type SortKey = "total" | "math" | "coding" | "science" | "agent" | "hallucination" | "instruction" | "benchlm";
type FilterOpenSource = "all" | "open" | "closed";
type FilterApi = "all" | "has_api" | "no_api";
type FilterType = "all" | "reasoning" | "non-reasoning";

// ─── 进度条（仅桌面端表格使用）────────────────────────────────────────────────
function ProgressBar({ value, max, color, delay = 0 }: {
  value: number; max: number; color: string; delay?: number;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setWidth((value / max) * 100), delay);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, max, delay]);

  return (
    <div ref={ref} className="flex items-center gap-1.5 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-mono text-foreground/70 w-8 text-right tabular-nums shrink-0">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── 价格状态徽章 ─────────────────────────────────────────────────────────────
function PriceStatusBadge({ status, inputPrice, outputPrice, currency }: {
  status: string; inputPrice: number | null; outputPrice: number | null; currency: string;
}) {
  if (status === "public" && inputPrice !== null) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-emerald-400 font-mono tabular-nums leading-tight">
          ¥{inputPrice}/M 输入
        </span>
        {outputPrice !== null && (
          <span className="text-[10px] text-emerald-400/60 font-mono tabular-nums leading-tight">
            ¥{outputPrice}/M 输出
          </span>
        )}
      </div>
    );
  }
  const badges: Record<string, { text: string; cls: string }> = {
    open_source_free:        { text: "开源免费", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    no_api_yet:              { text: "暂无 API",  cls: "bg-muted text-muted-foreground border-border" },
    officially_not_public:   { text: "联系商务", cls: "bg-amber-500/10 text-amber-400/80 border-amber-500/20" },
    manual_inquiry_required: { text: "人工询价", cls: "bg-orange-500/10 text-orange-400/80 border-orange-500/20" },
  };
  const b = badges[status];
  if (b) return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${b.cls} whitespace-nowrap`}>{b.text}</span>
  );
  return <span className="text-[10px] text-muted-foreground">—</span>;
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function LeaderboardTable() {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterOpenSource, setFilterOpenSource] = useState<FilterOpenSource>("all");
  const [filterApi, setFilterApi] = useState<FilterApi>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const handleSort = (key: SortKey) => {
    setSortKey(key);
    setSortAsc(sortKey === key ? !sortAsc : false);
  };

  const hasActiveFilter = filterOpenSource !== "all" || filterApi !== "all" || filterType !== "all";

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

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortAsc ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />)
    : <ChevronDown className="w-3 h-3 opacity-25" />;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-[1600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* ── 标题行 ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shrink-0" />
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

        {/* ── 筛选器工具栏 ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">筛选：</span>

          {/* 开源状态 */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {([["all", "全部"], ["open", "开源"], ["closed", "闭源"]] as [FilterOpenSource, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setFilterOpenSource(val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${filterOpenSource === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* API 可用性 */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {([["all", "全部"], ["has_api", "有 API"], ["no_api", "无 API"]] as [FilterApi, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setFilterApi(val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${filterApi === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* 模型类型 */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            {([["all", "全部"], ["reasoning", "推理型"], ["non-reasoning", "通用型"]] as [FilterType, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setFilterType(val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${filterType === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {hasActiveFilter && (
            <button onClick={() => { setFilterOpenSource("all"); setFilterApi("all"); setFilterType("all"); }}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3 h-3" /> 清除
            </button>
          )}
        </div>

        {/* ── 桌面端表格（md 以上显示）── */}
        <div className="hidden md:block rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              {/* # */}
              <col style={{ width: "44px" }} />
              {/* 模型名 */}
              <col style={{ width: "160px" }} />
              {/* 开源 */}
              <col style={{ width: "52px" }} />
              {/* 价格 */}
              <col style={{ width: "100px" }} />
              {/* 总分 */}
              <col style={{ width: "72px" }} />
              {/* 6 维度，均分剩余宽度 */}
              {dimensions.map((d) => <col key={d.key} />)}
              {/* BenchLM */}
              <col style={{ width: "68px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left pl-3 pr-1 py-3 font-semibold text-muted-foreground text-xs">#</th>
                <th className="text-left px-2 py-3 font-semibold text-muted-foreground text-xs">模型</th>
                <th className="text-center px-1 py-3 font-semibold text-muted-foreground text-xs">
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-0.5">
                      开源<Info className="w-2.5 h-2.5" />
                    </TooltipTrigger>
                    <TooltipContent>模型权重是否公开可下载</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left px-2 py-3 font-semibold text-muted-foreground text-xs">
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" />价格
                    </TooltipTrigger>
                    <TooltipContent>API 调用价格（元/百万 token）</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-right px-2 py-3 font-semibold text-xs cursor-pointer select-none hover:text-amber-400 transition-colors"
                  onClick={() => handleSort("total")}>
                  <span className="inline-flex items-center gap-0.5 justify-end text-amber-400">
                    总分<SortIcon k="total" />
                  </span>
                </th>
                {dimensions.map((d) => (
                  <th key={d.key}
                    className="text-left px-2 py-3 font-semibold text-xs cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleSort(d.key as SortKey)}>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-0.5 text-muted-foreground">
                        <span className="text-[11px]">{d.icon}</span>{d.label}<SortIcon k={d.key as SortKey} />
                      </TooltipTrigger>
                      <TooltipContent>{d.description}</TooltipContent>
                    </Tooltip>
                  </th>
                ))}
                <th className="text-right px-2 py-3 font-semibold text-xs cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("benchlm")}>
                  <span className="inline-flex items-center gap-0.5 justify-end text-muted-foreground">
                    BenchLM<SortIcon k="benchlm" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-muted-foreground text-sm">
                    没有符合条件的模型，请调整筛选条件
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((model, idx) => (
                  <DesktopRow
                    key={model.id}
                    model={model}
                    rank={idx + 1}
                    isExpanded={expandedId === model.id}
                    onToggle={() => setExpandedId(expandedId === model.id ? null : model.id)}
                    delay={idx * 40}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── 移动端卡片列表（md 以下显示）── */}
        <div className="md:hidden space-y-3">
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm rounded-xl border border-border bg-card/50">
              没有符合条件的模型，请调整筛选条件
            </div>
          ) : (
            filteredAndSorted.map((model, idx) => (
              <MobileCard
                key={model.id}
                model={model}
                rank={idx + 1}
                isExpanded={expandedId === model.id}
                onToggle={() => setExpandedId(expandedId === model.id ? null : model.id)}
                delay={idx * 40}
              />
            ))
          )}
        </div>

        {/* ── 数据来源 ── */}
        {dataMeta.sourceDetails && dataMeta.sourceDetails.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {dataMeta.sourceDetails.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="w-2.5 h-2.5" />
                {s.name}
                <span className="text-muted-foreground/40">（{s.dataDate}）</span>
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

// ─── 桌面端表格行 ─────────────────────────────────────────────────────────────
function DesktopRow({ model, rank, isExpanded, onToggle, delay }: {
  model: ModelData; rank: number; isExpanded: boolean; onToggle: () => void; delay: number;
}) {
  const rankCls = rank === 1
    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : rank === 2
    ? "bg-gray-400/20 text-gray-300 border-gray-400/30"
    : rank === 3
    ? "bg-orange-600/20 text-orange-400 border-orange-600/30"
    : "bg-muted text-muted-foreground border-transparent";

  const pricing = model.pricing;

  return (
    <>
      <tr
        className="border-b border-border/40 hover:bg-white/[0.025] transition-colors cursor-pointer group"
        onClick={onToggle}
      >
        {/* # */}
        <td className="pl-3 pr-1 py-2.5">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold border ${rankCls}`}>
            {rank}
          </span>
        </td>
        {/* 模型名 */}
        <td className="px-2 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{model.logo}</span>
            <div className="min-w-0">
              <div className="font-semibold text-xs text-foreground group-hover:text-amber-400 transition-colors flex items-center gap-1 flex-wrap">
                <span className="truncate">{model.shortName}</span>
                {model.type === "reasoning" && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 shrink-0">推理</span>
                )}
                <ChevronDown className={`w-3 h-3 text-muted-foreground/50 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
              <div className="text-[10px] text-muted-foreground truncate">{model.company}</div>
            </div>
          </div>
        </td>
        {/* 开源 */}
        <td className="text-center px-1 py-2.5">
          {model.isOpenSource
            ? <Unlock className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
            : <Lock className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}
        </td>
        {/* 价格 */}
        <td className="px-2 py-2.5">
          {pricing
            ? <PriceStatusBadge status={pricing.priceStatus} inputPrice={pricing.inputTokenPrice} outputPrice={pricing.outputTokenPrice} currency={pricing.currency} />
            : <span className="text-[10px] text-muted-foreground">—</span>}
        </td>
        {/* 总分 */}
        <td className="text-right px-2 py-2.5">
          <span className="text-base font-extrabold font-mono text-amber-400 tabular-nums">
            {model.superclue.total.toFixed(2)}
          </span>
        </td>
        {/* 六维度进度条 */}
        {dimensions.map((d, i) => (
          <td key={d.key} className="px-2 py-2.5">
            <ProgressBar value={model.superclue[d.key]} max={100} color={d.color} delay={delay + i * 60} />
          </td>
        ))}
        {/* BenchLM */}
        <td className="text-right px-2 py-2.5">
          <span className="text-xs font-bold font-mono text-foreground/60 tabular-nums">{model.benchlm.overall}</span>
        </td>
      </tr>

      {/* 展开详情行 */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={12} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <ExpandedDetail model={model} />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── 移动端卡片 ───────────────────────────────────────────────────────────────
function MobileCard({ model, rank, isExpanded, onToggle, delay }: {
  model: ModelData; rank: number; isExpanded: boolean; onToggle: () => void; delay: number;
}) {
  const rankCls = rank === 1
    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : rank === 2
    ? "bg-gray-400/20 text-gray-300 border-gray-400/30"
    : rank === 3
    ? "bg-orange-600/20 text-orange-400 border-orange-600/30"
    : "bg-muted text-muted-foreground border-transparent";

  const pricing = model.pricing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      {/* 卡片头部 */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={onToggle}>
        {/* 排名 */}
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border shrink-0 ${rankCls}`}>
          {rank}
        </span>
        {/* Logo */}
        <span className="text-2xl shrink-0">{model.logo}</span>
        {/* 模型信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-foreground">{model.shortName}</span>
            {model.type === "reasoning" && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">推理</span>
            )}
            {model.isOpenSource
              ? <Unlock className="w-3 h-3 text-emerald-400" />
              : <Lock className="w-3 h-3 text-muted-foreground/40" />}
          </div>
          <div className="text-xs text-muted-foreground">{model.company} · {model.contextLength}</div>
        </div>
        {/* 总分 */}
        <div className="text-right shrink-0">
          <div className="text-xl font-extrabold font-mono text-amber-400 tabular-nums leading-tight">
            {model.superclue.total.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground">SuperCLUE</div>
        </div>
        {/* 展开箭头 */}
        <ChevronRight className={`w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
      </div>

      {/* 六维度评分条（始终可见） */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {dimensions.map((d) => (
          <div key={d.key} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-12 shrink-0">{d.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(model.superclue[d.key] / 100) * 100}%`, backgroundColor: d.color }}
              />
            </div>
            <span className="text-[10px] font-mono text-foreground/60 w-7 text-right tabular-nums shrink-0">
              {model.superclue[d.key].toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      {/* BenchLM 评分 */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">BenchLM</span>
        <span className="text-xs font-bold font-mono text-foreground/70 tabular-nums">{model.benchlm.overall}</span>
        {pricing && (
          <div className="ml-auto">
            <PriceStatusBadge
              status={pricing.priceStatus}
              inputPrice={pricing.inputTokenPrice}
              outputPrice={pricing.outputTokenPrice}
              currency={pricing.currency}
            />
          </div>
        )}
      </div>

      {/* 展开详情 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border/50"
          >
            <ExpandedDetail model={model} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── 展开详情（桌面 / 移动共用）─────────────────────────────────────────────
function ExpandedDetail({ model }: { model: ModelData }) {
  const pricing = model.pricing;
  return (
    <div className="px-4 sm:px-6 py-4 bg-accent/20">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 左：描述 + 商业化信息 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2 flex-wrap">
            <span className="truncate">{model.name}</span>
            {model.isOpenSource && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">开源</span>
            )}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{model.strengthDetail}</p>

          {pricing && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pricing.hasApi && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Zap className="w-2.5 h-2.5" />API 可用
                </span>
              )}
              {pricing.freeTier && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">免费额度</span>
              )}
              {pricing.privateDeployment && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">私有化部署</span>
              )}
              {pricing.enterpriseVersion && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">企业版</span>
              )}
              {pricing.priceStatus === "public" && pricing.inputTokenPrice !== null && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-2.5 h-2.5" />
                  输入 {pricing.inputTokenPrice} · 输出 {pricing.outputTokenPrice} {pricing.currency}/M
                </span>
              )}
              {pricing.priceSourceUrl && (
                <a href={pricing.priceSourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="w-2.5 h-2.5" />价格详情
                </a>
              )}
            </div>
          )}
        </div>

        {/* 右：标签 */}
        <div className="flex flex-wrap gap-1.5 sm:max-w-[180px]">
          {model.strengths.map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-lg border border-border bg-muted/50 text-foreground/70">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
