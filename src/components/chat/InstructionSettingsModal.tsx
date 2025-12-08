import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Save, Eye, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Instruction {
  id: string;
  name: string;
  content: string;
}

interface InstructionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: Instruction[];
  onSave: (instructions: Instruction[]) => void;
}

export function InstructionSettingsModal({
  isOpen,
  onClose,
  instructions,
  onSave,
}: InstructionSettingsModalProps) {
  const { t } = useTranslation();
  const [localInstructions, setLocalInstructions] = useState<Instruction[]>(instructions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const selectedInstruction = localInstructions.find((i) => i.id === selectedId);

  useEffect(() => {
    setLocalInstructions(instructions);
  }, [instructions]);

  useEffect(() => {
    if (selectedInstruction) {
      setEditedContent(selectedInstruction.content);
    }
  }, [selectedInstruction]);

  const handleSelectInstruction = (id: string) => {
    setSelectedId(id);
    setIsPreviewMode(false);
    const instruction = localInstructions.find((i) => i.id === id);
    if (instruction) {
      setEditedContent(instruction.content);
    }
  };

  const handleSaveContent = () => {
    if (selectedId) {
      const updated = localInstructions.map((inst) =>
        inst.id === selectedId ? { ...inst, content: editedContent } : inst
      );
      setLocalInstructions(updated);
      onSave(updated);
    }
  };

  const handleDeleteInstruction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = localInstructions.filter((inst) => inst.id !== id);
    setLocalInstructions(updated);
    onSave(updated);
    if (selectedId === id) {
      setSelectedId(null);
      setEditedContent("");
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split("\n")
      .map((line, index) => {
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
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0 bg-sidebar border-border">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t("assistant.instructionSettings", "지침 설정")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 h-[calc(600px-65px)]">
          {/* Left: Instruction List */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">
              {t("assistant.instructionList", "지침 목록")}
            </h3>
            <div className="flex flex-col gap-2">
              {localInstructions.map((instruction) => (
                <div
                  key={instruction.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group",
                    instruction.id === selectedId
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent"
                  )}
                >
                  <button
                    onClick={() => handleSelectInstruction(instruction.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{instruction.name}</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteInstruction(instruction.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all"
                    title={t("common.delete", "삭제")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content Editor */}
          <div className="flex-1 flex flex-col">
            {selectedInstruction ? (
              <>
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-sm font-medium">{selectedInstruction.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={cn(
                        "gap-1",
                        isPreviewMode && "bg-primary/20 text-primary"
                      )}
                    >
                      {isPreviewMode ? (
                        <>
                          <Edit3 className="w-4 h-4" />
                          {t("common.edit", "편집")}
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          {t("common.preview", "미리보기")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveContent}
                      className="gap-1"
                    >
                      <Save className="w-4 h-4" />
                      {t("common.save", "저장")}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  {isPreviewMode ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                      {renderMarkdown(editedContent)}
                    </div>
                  ) : (
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-full min-h-[400px] font-mono text-sm resize-none bg-background/50 border-border"
                      placeholder={t("assistant.instructionContentPlaceholder", "지침 내용을 입력하세요...")}
                    />
                  )}
                </div>
              </>
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
      </DialogContent>
    </Dialog>
  );
}
