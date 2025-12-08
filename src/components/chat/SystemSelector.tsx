import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Monitor, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface System {
  id: string;
  name: string;
  selected: boolean;
}

const defaultSystems: System[] = [
  { id: "1", name: "e-총무시스템", selected: false },
  { id: "2", name: "BiOn", selected: false },
  { id: "3", name: "SATIS", selected: false },
  { id: "4", name: "구매시스템", selected: false },
  { id: "5", name: "영업/물류시스템", selected: false },
];

export function SystemSelector() {
  const { t } = useTranslation();
  const [systems, setSystems] = useState<System[]>(defaultSystems);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCount = systems.filter((s) => s.selected).length;
  const isAllSelected = selectedCount === systems.length;

  const toggleSystem = (id: string) => {
    setSystems(systems.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const toggleAll = () => {
    const newSelected = !isAllSelected;
    setSystems(systems.map((s) => ({ ...s, selected: newSelected })));
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
    if (selectedCount === 0) return t("assistant.systemSelect", "시스템 선택");
    if (isAllSelected) return t("assistant.systemAll", "시스템 : ALL");
    return `${t("assistant.systemSelected", "시스템")} : ${selectedCount}${t("assistant.systemCount", "개")}`;
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
        <Monitor className="w-4 h-4" />
        <span>{getDisplayText()}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 p-3 rounded-xl bg-sidebar border border-border shadow-xl animate-fade-in z-50">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-sm font-medium">{t("assistant.systemList", "시스템 목록")}</span>
            <button
              onClick={toggleAll}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {isAllSelected ? t("assistant.deselectAll") : t("assistant.selectAll")}
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {systems.map((system) => (
              <label
                key={system.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  system.selected
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                <input
                  type="checkbox"
                  checked={system.selected}
                  onChange={() => toggleSystem(system.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs">{system.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
