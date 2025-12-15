import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  X, 
  Bot, 
  Plus, 
  FileText, 
  Wrench, 
  BookOpen, 
  Info,
  History
} from "lucide-react";
import { WorkflowItem } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  type: "RAG" | "Graph";
}

interface Instruction {
  id: string;
  name: string;
  content: string;
}

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: WorkflowItem | null;
  onAddToMyAgent: (agent: WorkflowItem) => void;
}

const mockTools: Tool[] = [
  { id: "t1", name: "Health Check", description: "시스템 상태 체크" },
  { id: "t2", name: "DB Connect", description: "데이터베이스 연결 확인" },
  { id: "t3", name: "Log Analyzer", description: "로그 분석 도구" },
  { id: "t4", name: "Report Gen", description: "보고서 생성 도구" },
  { id: "t5", name: "Alert Detect", description: "알림 감지 도구" },
  { id: "t6", name: "Notify", description: "알림 전송 도구" },
  { id: "t7", name: "Escalate", description: "에스컬레이션 도구" },
  { id: "t8", name: "Backup", description: "백업 도구" },
  { id: "t9", name: "Verify", description: "검증 도구" },
];

const mockKnowledgeBases: KnowledgeBase[] = [
  { id: "kb1", name: "시스템 매뉴얼", type: "RAG" },
  { id: "kb2", name: "장애 대응 가이드", type: "RAG" },
  { id: "kb3", name: "장애 대응 SOP", type: "RAG" },
  { id: "kb4", name: "연락처 목록", type: "Graph" },
  { id: "kb5", name: "백업 정책", type: "RAG" },
  { id: "kb6", name: "운영 절차서", type: "Graph" },
];

const mockInstructions: Instruction[] = [
  { id: "i1", name: "일일 점검 지침", content: "# 일일 점검 지침\n\n## 목적\n매일 아침 시스템 상태를 점검하고 보고서를 생성합니다.\n\n## 절차\n1. Health Check 실행\n2. DB 연결 확인\n3. 보고서 생성\n\n## 주의사항\n- 이상 발견 시 즉시 담당자에게 알림" },
  { id: "i2", name: "장애 대응 지침", content: "# 장애 대응 지침\n\n## 목적\n장애 발생 시 신속하게 대응합니다.\n\n## 절차\n1. 장애 감지 및 분류\n2. 로그 분석\n3. 담당자 알림\n4. 에스컬레이션" },
  { id: "i3", name: "백업 지침", content: "# 백업 지침\n\n## 목적\n데이터베이스를 안전하게 백업합니다.\n\n## 절차\n1. DB 연결\n2. 백업 생성\n3. 무결성 검증\n4. 완료 알림" },
];

// Mock agent data with extended information
const mockAgentDetails: Record<string, {
  instructions: string;
  selectedInstructionIds: string[];
  tools: string[];
  knowledgeBases: string[];
  currentVersion: string;
  versions: { version: string; changes: string; publishedAt: string; publishedBy: string }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}> = {
  "w1": {
    instructions: "# 일일 점검 지침\n\n## 목적\n매일 아침 시스템 상태를 점검하고 보고서를 생성합니다.\n\n## 절차\n1. Health Check 실행\n2. DB 연결 확인\n3. 보고서 생성\n\n## 주의사항\n- 이상 발견 시 즉시 담당자에게 알림",
    selectedInstructionIds: ["i1"],
    tools: ["t1", "t2", "t4"],
    knowledgeBases: ["kb1", "kb2"],
    currentVersion: "1.2.0",
    versions: [
      { version: "1.2.0", changes: "보고서 형식 개선", publishedAt: "2024-12-01", publishedBy: "김철수" },
      { version: "1.1.0", changes: "DB 점검 로직 추가", publishedAt: "2024-10-15", publishedBy: "김철수" },
      { version: "1.0.0", changes: "초기 버전", publishedAt: "2024-08-01", publishedBy: "김철수" },
    ],
    createdAt: "2024-08-01",
    updatedAt: "2024-12-01",
    createdBy: "김철수",
  },
  "w2": {
    instructions: "# 장애 대응 지침\n\n## 목적\n장애 발생 시 신속하게 대응합니다.\n\n## 절차\n1. 장애 감지 및 분류\n2. 로그 분석\n3. 담당자 알림\n4. 에스컬레이션",
    selectedInstructionIds: ["i2"],
    tools: ["t5", "t3", "t6", "t7"],
    knowledgeBases: ["kb3", "kb4"],
    currentVersion: "2.0.0",
    versions: [
      { version: "2.0.0", changes: "에스컬레이션 로직 개선", publishedAt: "2024-11-20", publishedBy: "이영희" },
    ],
    createdAt: "2024-06-15",
    updatedAt: "2024-11-20",
    createdBy: "이영희",
  },
  "w3": {
    instructions: "# 백업 지침\n\n## 목적\n데이터베이스를 안전하게 백업합니다.\n\n## 절차\n1. DB 연결\n2. 백업 생성\n3. 무결성 검증\n4. 완료 알림",
    selectedInstructionIds: ["i3"],
    tools: ["t2", "t8", "t9"],
    knowledgeBases: ["kb5"],
    currentVersion: "0.9.0",
    versions: [
      { version: "0.9.0", changes: "베타 버전", publishedAt: "2024-12-05", publishedBy: "박민수" },
    ],
    createdAt: "2024-12-01",
    updatedAt: "2024-12-05",
    createdBy: "박민수",
  },
};

export function AgentDetailModal({ isOpen, onClose, agent, onAddToMyAgent }: AgentDetailModalProps) {
  const { t } = useTranslation();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isInstructionPreviewOpen, setIsInstructionPreviewOpen] = useState(false);
  const [previewInstruction, setPreviewInstruction] = useState<Instruction | null>(null);

  useEffect(() => {
    if (agent) {
      setShowVersionHistory(false);
    }
  }, [agent]);

  if (!agent) return null;

  // Get agent details from mock data or use defaults
  const agentDetails = mockAgentDetails[agent.id] || {
    instructions: "",
    selectedInstructionIds: [],
    tools: [],
    knowledgeBases: [],
    currentVersion: "1.0.0",
    versions: [{ version: "1.0.0", changes: "초기 버전", publishedAt: "2024-01-01", publishedBy: "시스템" }],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    createdBy: "시스템",
  };

  const selectedInstructions = mockInstructions.filter(i => agentDetails.selectedInstructionIds.includes(i.id));
  const selectedTools = mockTools.filter(t => agentDetails.tools.includes(t.id));
  const selectedKnowledgeBases = mockKnowledgeBases.filter(kb => agentDetails.knowledgeBases.includes(kb.id));

  const openInstructionPreview = (instruction: Instruction, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewInstruction(instruction);
    setIsInstructionPreviewOpen(true);
  };

  const handleAdd = () => {
    onAddToMyAgent(agent);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Agent 상세 정보
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  버전 이력
                </Button>
                <Badge variant="outline" className="text-xs">
                  v{agentDetails.currentVersion}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex gap-6 h-[calc(90vh-180px)]">
            {/* Left Side - Basic Info & Selections */}
            <div className="w-[400px] space-y-4 overflow-y-auto pr-4">
              {showVersionHistory && (
                <div className="p-4 rounded-lg bg-secondary/50 space-y-2 mb-4">
                  <h4 className="font-medium text-sm">버전 이력</h4>
                  <div className="space-y-2">
                    {agentDetails.versions.map((v, idx) => (
                      <div
                        key={v.version}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg text-sm",
                          idx === 0 ? "bg-primary/10 border border-primary/30" : "bg-background"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={idx === 0 ? "default" : "secondary"}>v{v.version}</Badge>
                            <span className="text-muted-foreground">{v.publishedBy}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{v.changes}</p>
                        </div>
                        <span className="text-muted-foreground">{v.publishedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  Agent 이름
                </label>
                <p className="text-sm font-medium px-3 py-2 rounded-lg bg-secondary/50 border">
                  {agent.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                <p className="text-sm px-3 py-2 rounded-lg bg-secondary/50 border min-h-[60px]">
                  {agent.description || "설명 없음"}
                </p>
              </div>

              {/* Instruction Display */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  지침 ({selectedInstructions.length}개)
                </label>
                <ScrollArea className="h-28 border rounded-lg p-2 bg-secondary/30">
                  <div className="space-y-1">
                    {selectedInstructions.length > 0 ? (
                      selectedInstructions.map((instruction) => (
                        <div
                          key={instruction.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-primary/10"
                        >
                          <span className="text-sm">{instruction.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => openInstructionPreview(instruction, e)}
                          >
                            <Info className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">등록된 지침이 없습니다.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Tool Display */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tool ({selectedTools.length}개)
                </label>
                <ScrollArea className="h-28 border rounded-lg p-2 bg-secondary/30">
                  <div className="space-y-1">
                    {selectedTools.length > 0 ? (
                      selectedTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="p-2 rounded-lg bg-primary/10"
                        >
                          <span className="text-sm font-medium">{tool.name}</span>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">등록된 도구가 없습니다.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Knowledge Base Display */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  지식 ({selectedKnowledgeBases.length}개)
                </label>
                <ScrollArea className="h-28 border rounded-lg p-2 bg-secondary/30">
                  <div className="space-y-1">
                    {selectedKnowledgeBases.length > 0 ? (
                      selectedKnowledgeBases.map((kb) => (
                        <div
                          key={kb.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-primary/10"
                        >
                          <span className="text-sm font-medium">{kb.name}</span>
                          <Badge variant="outline" className="text-xs">{kb.type}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">등록된 지식이 없습니다.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs text-muted-foreground">
                <div>
                  <span>생성자: {agentDetails.createdBy}</span>
                </div>
                <div>
                  <span>수정일: {agentDetails.updatedAt}</span>
                </div>
              </div>
            </div>

            {/* Right Side - Instructions MD Preview */}
            <div className="flex-1 flex flex-col border-l pl-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Agent 프롬프트
                </label>
              </div>
              <div className="flex-1 border rounded-lg overflow-hidden bg-secondary/30">
                <ScrollArea className="h-full p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {agentDetails.instructions ? (
                      <ReactMarkdown>{agentDetails.instructions}</ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">등록된 프롬프트가 없습니다.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("workflow.addToMyAgent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instruction Preview Modal */}
      <Dialog open={isInstructionPreviewOpen} onOpenChange={setIsInstructionPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {previewInstruction?.name || "지침 내용"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] border rounded-lg p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{previewInstruction?.content || ""}</ReactMarkdown>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstructionPreviewOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
