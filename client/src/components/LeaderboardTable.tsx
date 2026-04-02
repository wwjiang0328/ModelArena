/**
 * LeaderboardTable - 完整排行榜表格
 * Design: 竞技场风格，hover展开详情，进度条动画
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink, Lock, Unlock, Info } from "lucide-react";
import { models, dimensions, type ModelData } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const sorted = [...models].sort((a, b) => b.superclue.total - a.superclue.total);

type SortKey = "total" | "math" | "coding" | "science" | "agent" | "hallucination" | "instruction" | "benchlm";

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

export default function LeaderboardTable() {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sortedModels = [...sorted].sort((a, b) => {
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">综合排行榜</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">SuperCLUE 2026.03</span>
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
              {sortedModels.map((model, idx) => (
                <TableRow
                  key={model.id}
                  model={model}
                  rank={idx + 1}
                  isExpanded={expandedId === model.id}
                  onToggle={() => setExpandedId(expandedId === model.id ? null : model.id)}
                  delay={idx * 50}
                />
              ))}
            </tbody>
          </table>
        </div>
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
            <td colSpan={10} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-accent/30 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        {model.name}
                        {model.isOpenSource && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            开源
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{model.strengthDetail}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-start">
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
