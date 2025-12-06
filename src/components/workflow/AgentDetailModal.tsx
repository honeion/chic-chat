import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Workflow, ChevronRight, Plus, Pencil } from "lucide-react";
import { WorkflowItem } from "@/pages/Index";
import { Input } from "@/components/ui/input";

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: WorkflowItem | null;
  onAddToMyAgent: (agent: WorkflowItem) => void;
}

export function AgentDetailModal({ isOpen, onClose, agent, onAddToMyAgent }: AgentDetailModalProps) {
  const { t } = useTranslation();
  const [customName, setCustomName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    if (agent) {
      setCustomName(agent.name);
      setIsEditingName(false);
    }
  }, [agent]);

  if (!isOpen || !agent) return null;

  const handleAdd = () => {
    const agentToAdd = {
      ...agent,
      name: customName.trim() || agent.name,
    };
    onAddToMyAgent(agentToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-sidebar border border-border shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-accent" />
            </div>
            <div>
              {isEditingName ? (
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                  className="text-xl font-semibold h-8 w-64"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{customName}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                    title={t("common.edit")}
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{t("workflow.agentMarket")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">{t("common.description")}</label>
            <div className="p-4 rounded-xl bg-chat-user/30 border border-border/50">
              <p className="text-sm">{agent.description}</p>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-muted-foreground">
              {t("common.steps")} ({agent.steps.length})
            </label>
            <div className="space-y-2">
              {agent.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-chat-user/50 border border-border/50"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">{step}</span>
                  {idx < agent.steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
            <p className="text-sm text-muted-foreground">
              {t("workflow.addToMyAgentDesc")}
            </p>
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
            onClick={handleAdd}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("workflow.addToMyAgent")}
          </button>
        </div>
      </div>
    </div>
  );
}
