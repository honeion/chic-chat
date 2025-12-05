import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Wrench, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  name: string;
  enabled: boolean;
}

const defaultTools: Tool[] = [
  { id: "1", name: "Health Check", enabled: true },
  { id: "2", name: "DB Connect", enabled: true },
  { id: "3", name: "Log Analyzer", enabled: true },
  { id: "4", name: "Alert Send", enabled: true },
  { id: "5", name: "Report Gen", enabled: true },
  { id: "6", name: "API Request", enabled: true },
  { id: "7", name: "File Manager", enabled: true },
  { id: "8", name: "Email Sender", enabled: true },
  { id: "9", name: "Scheduler", enabled: true },
  { id: "10", name: "Data Transform", enabled: true },
  { id: "11", name: "Cache Manager", enabled: true },
  { id: "12", name: "Backup Tool", enabled: true },
  { id: "13", name: "Security Scan", enabled: true },
  { id: "14", name: "Metrics Collector", enabled: true },
  { id: "15", name: "Load Balancer", enabled: true },
];

export function ToolSelector() {
  const { t } = useTranslation();
  const [tools, setTools] = useState<Tool[]>(defaultTools);
  const [isHovered, setIsHovered] = useState(false);

  const selectedCount = tools.filter((t) => t.enabled).length;
  const isAllSelected = selectedCount === tools.length;

  const toggleTool = (id: string) => {
    setTools(tools.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const toggleAll = () => {
    const newEnabled = !isAllSelected;
    setTools(tools.map((t) => ({ ...t, enabled: newEnabled })));
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Button */}
      <button
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border",
          isHovered
            ? "bg-primary/10 border-primary/50 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <Wrench className="w-4 h-4" />
        <span>
          {isAllSelected
            ? `${t("assistant.toolSelect")} : ALL`
            : `Selected : ${selectedCount}${t("assistant.toolCount")}`}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isHovered && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isHovered && (
        <div className="absolute bottom-full left-0 mb-2 w-80 p-3 rounded-xl bg-sidebar border border-border shadow-xl animate-fade-in z-50">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-sm font-medium">{t("workflow.toolList")}</span>
            <button
              onClick={toggleAll}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {isAllSelected ? t("assistant.deselectAll") : t("assistant.selectAll")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {tools.map((tool) => (
              <label
                key={tool.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  tool.enabled
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                <input
                  type="checkbox"
                  checked={tool.enabled}
                  onChange={() => toggleTool(tool.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs">{tool.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
