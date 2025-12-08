import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, ChevronRight, GripVertical, Trash2, Folder, FileInput, Edit3, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { OperatingSystem } from "@/pages/Index";
import { InstructionImportModal } from "./InstructionImportModal";
import { Instruction, defaultInstructions } from "@/data/instructions";
import ReactMarkdown from "react-markdown";

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: {
    name: string;
    description: string;
    steps: string[];
    instructions: string;
    systems: OperatingSystem[];
  }) => void;
  tools: Tool[];
}

export function NewAgentModal({ isOpen, onClose, onSave, tools }: NewAgentModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [instructions, setInstructions] = useState("");
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [selectedSystems, setSelectedSystems] = useState<OperatingSystem[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [availableInstructions] = useState<Instruction[]>(defaultInstructions);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const SYSTEM_BOXES: OperatingSystem[] = ["e-총무", "BiOn", "SATIS"];

  if (!isOpen) return null;

  const handleToolClick = (tool: Tool) => {
    if (!selectedTools.find((t) => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleRemoveTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  const toggleSystem = (system: OperatingSystem) => {
    setSelectedSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const handleSave = () => {
    if (name && selectedTools.length > 0 && selectedSystems.length > 0) {
      onSave({
        name,
        description,
        steps: selectedTools.map((t) => t.name),
        instructions,
        systems: selectedSystems,
      });
      // Reset form
      setName("");
      setDescription("");
      setSelectedTools([]);
      setInstructions("");
      setSelectedSystems([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-sidebar border border-border shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">{t("workflow.createNewAgent")}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* System Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">대상 시스템 (필수)</label>
            <div className="flex gap-3">
              {SYSTEM_BOXES.map((system) => (
                <button
                  key={system}
                  onClick={() => toggleSystem(system)}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm flex items-center gap-2",
                    selectedSystems.includes(system)
                      ? "bg-primary/20 border-primary text-primary shadow-md"
                      : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-card"
                  )}
                >
                  <Folder className="w-4 h-4" />
                  {system}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Description */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t("workflow.agentName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("workflow.agentNamePlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t("common.description")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("workflow.descriptionPlaceholder")}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary/50 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Instructions - positioned below description */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{t("workflow.instructions")}</label>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden border border-border">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors",
                      !isPreviewMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {t("workflow.edit", "편집")}
                  </button>
                  <button
                    onClick={() => setIsPreviewMode(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors",
                      isPreviewMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t("workflow.preview", "미리보기")}
                  </button>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileInput className="w-3.5 h-3.5" />
                  {t("workflow.importInstruction", "지침 불러오기")}
                </button>
              </div>
            </div>
            {isPreviewMode ? (
              <div className="w-full min-h-[120px] max-h-[200px] overflow-y-auto px-4 py-2.5 rounded-lg bg-secondary border border-border prose prose-sm prose-invert max-w-none">
                {instructions ? (
                  <ReactMarkdown>{instructions}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">{t("workflow.instructionsPlaceholder")}</p>
                )}
              </div>
            ) : (
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t("workflow.instructionsPlaceholder")}
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary/50 focus:outline-none transition-colors resize-none"
              />
            )}
          </div>

          {/* Tool Selection with Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">{t("workflow.selectTools")}</label>
            <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-chat-user/30 border border-border/50 max-h-48 overflow-y-auto">
              {tools.map((tool) => (
                <div key={tool.id} className="relative">
                  <button
                    onClick={() => handleToolClick(tool)}
                    onMouseEnter={() => setHoveredTool(tool)}
                    onMouseLeave={() => setHoveredTool(null)}
                    disabled={!!selectedTools.find((t) => t.id === tool.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-all",
                      selectedTools.find((t) => t.id === tool.id)
                        ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                        : "bg-secondary hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {tool.name}
                  </button>
                  {/* Tooltip */}
                  {hoveredTool?.id === tool.id && !selectedTools.find((t) => t.id === tool.id) && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg bg-popover border border-border shadow-lg z-10 animate-fade-in">
                      <p className="text-sm font-medium mb-1">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tools (Workflow Steps) */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              {t("common.steps")} ({selectedTools.length})
            </label>
            {selectedTools.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border/50 text-center text-muted-foreground text-sm">
                {t("workflow.noToolsSelected")}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTools.map((tool, idx) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-chat-user/50 border border-border/50"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{tool.name}</span>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                    {idx < selectedTools.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <button
                      onClick={() => handleRemoveTool(tool.id)}
                      className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!name || selectedTools.length === 0 || selectedSystems.length === 0}
            className={cn(
              "px-6 py-2 rounded-lg transition-colors",
              name && selectedTools.length > 0 && selectedSystems.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {t("common.save")}
          </button>
        </div>

        {/* Import Modal */}
        <InstructionImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          instructions={availableInstructions}
          onSelect={(instruction) => setInstructions(instruction.content)}
        />
      </div>
    </div>
  );
}