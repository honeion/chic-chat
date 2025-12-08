import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Instruction } from "@/data/instructions";

interface InstructionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: Instruction[];
  onSelect: (instruction: Instruction) => void;
}

export function InstructionImportModal({
  isOpen,
  onClose,
  instructions,
  onSelect,
}: InstructionImportModalProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");

  const handleSelectInstruction = (instruction: Instruction) => {
    setSelectedId(instruction.id);
    setPreviewContent(instruction.content);
  };

  const handleConfirm = () => {
    const selected = instructions.find((i) => i.id === selectedId);
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const renderMarkdown = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-xl font-bold mb-2">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-lg font-semibold mb-2">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-md font-medium mb-1">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-1">
          {line}
        </p>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[500px] p-0 gap-0 bg-sidebar border-border">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t("workflow.importInstruction", "지침 불러오기")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 h-[calc(500px-120px)]">
          {/* Left: Instruction List */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">
              {t("assistant.instructionList", "지침 목록")}
            </h3>
            <div className="flex flex-col gap-2">
              {instructions.map((instruction) => (
                <button
                  key={instruction.id}
                  onClick={() => handleSelectInstruction(instruction)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                    instruction.id === selectedId
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent"
                  )}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{instruction.name}</span>
                  {instruction.id === selectedId && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex flex-col">
            {selectedId ? (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                  {renderMarkdown(previewContent)}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t("assistant.selectInstruction", "지침을 선택하세요")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel", "취소")}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>
            {t("workflow.import", "불러오기")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
