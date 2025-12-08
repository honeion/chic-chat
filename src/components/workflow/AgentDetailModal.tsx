import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Workflow, Plus, Pencil, Eye, Edit3 } from "lucide-react";
import { WorkflowItem } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
}

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: WorkflowItem | null;
  onAddToMyAgent: (agent: WorkflowItem) => void;
}

const mockTools: Tool[] = [
  { id: "1", name: "Health Check", description: "시스템 상태를 점검하고 이상 여부를 확인합니다." },
  { id: "2", name: "DB Connect", description: "데이터베이스 연결을 설정합니다." },
  { id: "3", name: "Log Analyzer", description: "로그를 분석하여 패턴을 찾습니다." },
  { id: "4", name: "Alert Send", description: "알림을 전송합니다." },
  { id: "5", name: "Report Gen", description: "리포트를 생성합니다." },
  { id: "6", name: "API Request", description: "외부 API를 호출하고 응답을 처리합니다." },
  { id: "7", name: "File Manager", description: "파일 읽기, 쓰기, 삭제 작업을 수행합니다." },
  { id: "8", name: "Email Sender", description: "이메일을 작성하고 발송합니다." },
];

const mockKnowledgeBases: KnowledgeBase[] = [
  { id: "k1", name: "운영 매뉴얼" },
  { id: "k2", name: "장애 대응 가이드" },
  { id: "k3", name: "시스템 설정 문서" },
  { id: "k4", name: "FAQ 데이터베이스" },
];

export function AgentDetailModal({ isOpen, onClose, agent, onAddToMyAgent }: AgentDetailModalProps) {
  const { t } = useTranslation();
  const [customName, setCustomName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [instructionsViewMode, setInstructionsViewMode] = useState<"edit" | "preview">("edit");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([]);

  useEffect(() => {
    if (agent) {
      setCustomName(agent.name);
      setDescription(agent.description || "");
      setInstructions("");
      setSelectedTools([]);
      setSelectedKnowledge([]);
      setIsEditingName(false);
      setInstructionsViewMode("edit");
    }
  }, [agent]);

  if (!isOpen || !agent) return null;

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const toggleKnowledge = (knowledgeId: string) => {
    setSelectedKnowledge(prev => 
      prev.includes(knowledgeId) ? prev.filter(id => id !== knowledgeId) : [...prev, knowledgeId]
    );
  };

  const handleAdd = () => {
    const agentToAdd = {
      ...agent,
      name: customName.trim() || agent.name,
      description: description,
    };
    onAddToMyAgent(agentToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-sidebar border border-border shadow-xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Agent Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Agent 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agent의 역할과 기능을 설명하세요"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Instructions with Markdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">지침</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setInstructionsViewMode("edit")}
                  className={cn(
                    "px-3 py-1 text-xs flex items-center gap-1 transition-colors",
                    instructionsViewMode === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  <Edit3 className="w-3 h-3" />
                  편집
                </button>
                <button
                  onClick={() => setInstructionsViewMode("preview")}
                  className={cn(
                    "px-3 py-1 text-xs flex items-center gap-1 transition-colors",
                    instructionsViewMode === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  미리보기
                </button>
              </div>
            </div>
            {instructionsViewMode === "edit" ? (
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Agent가 따라야 할 지침을 Markdown 형식으로 입력하세요&#10;&#10;예시:&#10;# 역할&#10;- 시스템 점검 수행&#10;- 결과 리포트 생성"
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
              />
            ) : (
              <div className="w-full min-h-[150px] max-h-[200px] overflow-y-auto px-3 py-2 rounded-lg border border-border bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
                {instructions ? (
                  <div className="whitespace-pre-wrap text-sm">
                    {instructions.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold mt-2 mb-1">{line.slice(2)}</h1>;
                      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold mt-2 mb-1">{line.slice(3)}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold mt-1 mb-1">{line.slice(4)}</h3>;
                      if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.slice(2)}</li>;
                      if (line.startsWith('* ')) return <li key={i} className="ml-4">{line.slice(2)}</li>;
                      if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-primary pl-2 italic text-muted-foreground">{line.slice(2)}</blockquote>;
                      if (line.startsWith('```')) return null;
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="my-1">{line}</p>;
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">지침을 입력하면 여기에 미리보기가 표시됩니다.</p>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Markdown 형식을 지원합니다.</p>
          </div>

          {/* Tool Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Tool 선택</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-border rounded-lg">
              {mockTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={cn(
                    "p-2 rounded-lg border text-left text-sm transition-all",
                    selectedTools.includes(tool.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              선택된 Tool: {selectedTools.length}개
            </p>
          </div>

          {/* Knowledge (RAG) Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">지식(RAG) 선택</label>
            <div className="grid grid-cols-2 gap-2 p-2 border border-border rounded-lg">
              {mockKnowledgeBases.map((kb) => (
                <button
                  key={kb.id}
                  onClick={() => toggleKnowledge(kb.id)}
                  className={cn(
                    "p-2 rounded-lg border text-left text-sm transition-all",
                    selectedKnowledge.includes(kb.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {kb.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              선택된 지식: {selectedKnowledge.length}개
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border shrink-0">
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
