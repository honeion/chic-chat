import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstructionSettingsModal } from "./InstructionSettingsModal";
import { Instruction, defaultInstructions } from "@/data/instructions";

export function InstructionSelector() {
  const { t } = useTranslation();
  const [instructions, setInstructions] = useState<Instruction[]>(defaultInstructions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedInstruction = instructions.find((i) => i.id === selectedId);

  const selectInstruction = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
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
    if (!selectedInstruction) return t("assistant.instructionSelect", "지침 선택");
    return `${t("assistant.instruction", "지침")} : ${selectedInstruction.name}`;
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsOpen(true);
  };

  const handleSaveInstructions = (updatedInstructions: Instruction[]) => {
    setInstructions(updatedInstructions);
  };

  return (
    <>
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
          <FileText className="w-4 h-4" />
          <span className="truncate max-w-[120px]">{getDisplayText()}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-56 p-3 rounded-xl bg-sidebar border border-border shadow-xl animate-fade-in z-50">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-sm font-medium">{t("assistant.instructionList", "지침 목록")}</span>
              <div className="flex items-center gap-2">
                {selectedId && (
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("assistant.clear", "해제")}
                  </button>
                )}
                <button
                  onClick={handleOpenSettings}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  title={t("assistant.instructionSettings", "지침 설정")}
                >
                  <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {instructions.map((instruction) => (
                <button
                  key={instruction.id}
                  onClick={() => selectInstruction(instruction.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-left",
                    instruction.id === selectedId
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      instruction.id === selectedId
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {instruction.id === selectedId && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs">{instruction.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <InstructionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        instructions={instructions}
        onSave={handleSaveInstructions}
      />
    </>
  );
}
