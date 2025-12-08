import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Share2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeGraph {
  id: string;
  name: string;
}

const defaultKnowledgeGraphs: KnowledgeGraph[] = [
  { id: "1", name: "시스템 구성도" },
  { id: "2", name: "업무 프로세스" },
  { id: "3", name: "조직 구조" },
  { id: "4", name: "데이터 관계도" },
  { id: "5", name: "서비스 연결도" },
];

export function KnowledgeGraphSelector() {
  const { t } = useTranslation();
  const [knowledgeGraphs] = useState<KnowledgeGraph[]>(defaultKnowledgeGraphs);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleKnowledgeGraph = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(knowledgeGraphs.map((g) => g.id));
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayText = () => {
    if (selectedIds.length === 0) return t("assistant.graphSelect", "지식Graph 선택");
    if (selectedIds.length === knowledgeGraphs.length) return `${t("assistant.graph", "지식Graph")} : ALL`;
    return `${t("assistant.graph", "지식Graph")} : ${selectedIds.length}개`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border",
          isOpen
            ? "bg-primary/10 border-primary/50 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <Share2 className="w-4 h-4" />
        <span className="truncate max-w-[120px]">{getDisplayText()}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 p-3 rounded-xl bg-sidebar border border-border shadow-xl animate-fade-in z-50">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-sm font-medium">{t("assistant.graphList", "지식Graph 목록")}</span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {t("assistant.selectAll", "전체")}
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("assistant.clear", "해제")}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {knowledgeGraphs.map((graph) => (
              <button
                key={graph.id}
                onClick={() => toggleKnowledgeGraph(graph.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-left",
                  selectedIds.includes(graph.id)
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    selectedIds.includes(graph.id)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {selectedIds.includes(graph.id) && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-xs">{graph.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
