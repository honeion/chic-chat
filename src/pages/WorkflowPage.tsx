import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Workflow, Plus, Play, Save, Trash2, ChevronRight, ChevronDown, Clock, History, X, Settings, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewAgentModal } from "@/components/workflow/NewAgentModal";
import { WorkflowChatPanel } from "@/components/workflow/WorkflowChatPanel";
import { WorkflowItem, OperatingSystem, RegisteredAgent, OPERATING_SYSTEMS } from "@/pages/Index";

interface ExecutionHistory {
  id: string;
  timestamp: string;
  status: "success" | "failed" | "running";
  duration: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  example: string;
}

const mockTools: Tool[] = [
  { id: "1", name: "Health Check", description: "시스템 상태를 점검하고 이상 여부를 확인합니다.", example: "health_check(target='server1')" },
  { id: "2", name: "DB Connect", description: "데이터베이스 연결을 설정합니다.", example: "db_connect(host='localhost', port=5432)" },
  { id: "3", name: "Log Analyzer", description: "로그를 분석하여 패턴을 찾습니다.", example: "analyze_logs(path='/var/log')" },
  { id: "4", name: "Alert Send", description: "알림을 전송합니다.", example: "send_alert(channel='slack', message='...')" },
  { id: "5", name: "Report Gen", description: "리포트를 생성합니다.", example: "generate_report(type='daily')" },
  { id: "6", name: "API Request", description: "외부 API를 호출하고 응답을 처리합니다.", example: "api_request(url='https://api.example.com', method='GET')" },
  { id: "7", name: "File Manager", description: "파일 읽기, 쓰기, 삭제 작업을 수행합니다.", example: "file_manage(action='read', path='/data/config.json')" },
  { id: "8", name: "Email Sender", description: "이메일을 작성하고 발송합니다.", example: "send_email(to='user@example.com', subject='알림')" },
];

const mockExecutionHistory: Record<string, ExecutionHistory[]> = {
  m1: [
    { id: "e1", timestamp: "오늘 09:00", status: "success", duration: "2분 30초" },
    { id: "e2", timestamp: "어제 09:00", status: "success", duration: "2분 15초" },
  ],
};

interface WorkflowPageProps {
  myAgents: WorkflowItem[];
  setMyAgents: (agents: WorkflowItem[]) => void;
  selectedAgent: WorkflowItem | null;
  setSelectedAgent: (agent: WorkflowItem | null) => void;
  onAddFromMarket: (agent: WorkflowItem) => void;
  onAddNewAgent: (agent: { name: string; description: string; steps: string[]; instructions: string; systems: OperatingSystem[] }) => void;
  onAddRegisteredAgent: (agentTypeId: string, registeredAgent: RegisteredAgent) => void;
}

export function WorkflowPage({
  myAgents,
  setMyAgents,
  selectedAgent,
  setSelectedAgent,
  onAddFromMarket,
  onAddNewAgent,
  onAddRegisteredAgent
}: WorkflowPageProps) {
  const { t } = useTranslation();
  const [expandedMyAgent, setExpandedMyAgent] = useState<string | null>(null);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<RegisteredAgent | null>(null);
  const [activeAgentForChat, setActiveAgentForChat] = useState<RegisteredAgent | null>(null);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentDescription, setNewAgentDescription] = useState("");
  const [newAgentSystem, setNewAgentSystem] = useState<OperatingSystem | null>(null);
  const [newAgentSelectedTools, setNewAgentSelectedTools] = useState<string[]>([]);
  const [newAgentKnowledge, setNewAgentKnowledge] = useState<string[]>([]);
  const [newAgentInstructions, setNewAgentInstructions] = useState("");

  // Mock chat history for agents
  const [chatHistory] = useState([
    { id: "ch1", agentName: "e-총무 점검 Agent", timestamp: "2024-01-15 09:30", status: "completed" as const, summary: "일일 점검 완료" },
    { id: "ch2", agentName: "BiOn 모니터링", timestamp: "2024-01-15 10:15", status: "completed" as const, summary: "시스템 정상 확인" },
    { id: "ch3", agentName: "SATIS 리포트", timestamp: "2024-01-14 14:00", status: "completed" as const, summary: "주간 리포트 생성" },
  ]);

  const mockKnowledgeBases = [
    { id: "k1", name: "운영 매뉴얼" },
    { id: "k2", name: "장애 대응 가이드" },
    { id: "k3", name: "시스템 설정 문서" },
    { id: "k4", name: "FAQ 데이터베이스" },
  ];

  const getStatusStyle = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return "bg-status-online/20 text-status-online";
      case "draft": return "bg-status-busy/20 text-status-busy";
      case "completed": return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return t("common.active");
      case "draft": return t("common.draft");
      case "completed": return t("common.completed");
    }
  };

  const getExecutionStatusStyle = (status: ExecutionHistory["status"]) => {
    switch (status) {
      case "success": return "text-status-online";
      case "failed": return "text-destructive";
      case "running": return "text-status-busy";
    }
  };

  const getExecutionStatusLabel = (status: ExecutionHistory["status"]) => {
    switch (status) {
      case "success": return t("common.success");
      case "failed": return t("common.failed");
      case "running": return t("common.running");
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    const updatedAgents = myAgents.filter(a => a.id !== agentId);
    setMyAgents(updatedAgents);
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
  };

  const handleAddRegisteredAgent = () => {
    if (!selectedAgent || !newAgentSystem || !newAgentName.trim()) return;
    
    const registeredAgent: RegisteredAgent = {
      id: `ra${Date.now()}`,
      name: newAgentName.trim(),
      system: newAgentSystem,
      settings: {
        description: newAgentDescription,
        tools: newAgentSelectedTools.join(","),
        knowledge: newAgentKnowledge.join(","),
        instructions: newAgentInstructions,
      },
      createdAt: new Date().toISOString(),
    };
    
    onAddRegisteredAgent(selectedAgent.id, registeredAgent);
    resetAddAgentModal();
  };

  const resetAddAgentModal = () => {
    setIsAddAgentModalOpen(false);
    setIsEditAgentModalOpen(false);
    setEditingAgent(null);
    setNewAgentName("");
    setNewAgentDescription("");
    setNewAgentSystem(null);
    setNewAgentSelectedTools([]);
    setNewAgentKnowledge([]);
    setNewAgentInstructions("");
  };

  const handleEditAgent = (agent: RegisteredAgent) => {
    setEditingAgent(agent);
    setNewAgentName(agent.name);
    setNewAgentDescription(agent.settings?.description || "");
    setNewAgentSystem(agent.system);
    setNewAgentSelectedTools(agent.settings?.tools?.split(",").filter(Boolean) || []);
    setNewAgentKnowledge(agent.settings?.knowledge?.split(",").filter(Boolean) || []);
    setNewAgentInstructions(agent.settings?.instructions || "");
    setIsEditAgentModalOpen(true);
  };

  const handleRunAgent = (agent: RegisteredAgent) => {
    setActiveAgentForChat(agent);
  };

  const toggleTool = (toolId: string) => {
    setNewAgentSelectedTools(prev => 
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const toggleKnowledge = (knowledgeId: string) => {
    setNewAgentKnowledge(prev => 
      prev.includes(knowledgeId) ? prev.filter(id => id !== knowledgeId) : [...prev, knowledgeId]
    );
  };

  const registeredAgents = selectedAgent?.registeredAgents || [];
  const getSystemAgentCount = (system: OperatingSystem) => {
    return registeredAgents.filter(a => a.system === system).length;
  };

  // 선택된 Agent Type이 있으면 해당 타입의 상세 화면 표시
  const showAgentTypeDetail = selectedAgent !== null;

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content - 70% */}
      <div className="flex-[7] p-6 overflow-y-auto">
        {showAgentTypeDetail ? (
          <>
            {/* Agent Type Detail View */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedAgent?.name}</h1>
                  <p className="text-sm text-muted-foreground">{selectedAgent?.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddAgentModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agent 추가
              </button>
            </div>

            {/* System Boxes */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">시스템</h2>
              <div className="grid grid-cols-3 gap-4">
                {(["e-총무", "BiOn", "SATIS"] as const).map((system) => (
                  <div
                    key={system}
                    className="p-6 rounded-xl border-2 border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Workflow className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{system}</h3>
                    <p className="text-sm text-muted-foreground mt-1">등록된 Agent: {getSystemAgentCount(system)}개</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent List */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                등록된 Agent
                <span className="text-sm font-normal text-muted-foreground">({registeredAgents.length}개)</span>
              </h2>
              {registeredAgents.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-border/50 text-center">
                  <p className="text-muted-foreground mb-4">
                    이 Agent Type에 등록된 Agent가 없습니다.<br />
                    Agent 추가 버튼을 눌러 시스템별 Agent를 등록하세요.
                  </p>
                  <button 
                    onClick={() => setIsAddAgentModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agent 추가
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {registeredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Workflow className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{agent.name}</h3>
                          <p className="text-xs text-muted-foreground">{agent.system}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAgent(agent)}
                          className="flex-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          설정
                        </button>
                        <button
                          onClick={() => handleRunAgent(agent)}
                          className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          실행
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 처리 Chat 이력 */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                처리 Chat 이력
              </h2>
              <div className="space-y-2">
                {chatHistory.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border/50 text-center">
                    <p className="text-muted-foreground">처리된 Chat 이력이 없습니다.</p>
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className="p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{chat.agentName}</h4>
                            <p className="text-xs text-muted-foreground">{chat.summary}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-status-online/20 text-status-online">
                            완료
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Default View - No Agent Type Selected */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{t("sidebar.myAgent")}</h1>
                  <p className="text-sm text-muted-foreground">{t("workflow.subtitle")}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewAgentModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("workflow.newAgent")}
              </button>
            </div>

            {/* My Agent Type List */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                등록된 Agent Type
                <span className="text-sm font-normal text-muted-foreground">
                  ({myAgents.length}개)
                </span>
              </h2>
              <div className="space-y-3">
                {myAgents.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-border/50 text-center">
                    <p className="text-muted-foreground mb-4">
                      등록된 Agent Type이 없습니다.<br />
                      직접 등록하거나 Agent 마켓에서 추가해주세요.
                    </p>
                    <button 
                      onClick={() => setIsNewAgentModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      직접 등록하기
                    </button>
                  </div>
                ) : (
                  myAgents.map((agent) => (
                    <div key={agent.id}>
                      {/* Agent Type Card */}
                      <div
                        onClick={() => setSelectedAgent(agent)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                          "bg-chat-user/30 border-border/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                              <Workflow className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{agent.name}</h3>
                                <span className={cn("px-2 py-0.5 rounded-full text-xs", getStatusStyle(agent.status))}>
                                  {getStatusLabel(agent.status)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{agent.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">등록된 Agent: {(agent.registeredAgents || []).length}개</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAgent(agent.id);
                              }}
                              className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chat Panel - 30% */}
      <WorkflowChatPanel 
        agentName={selectedAgent?.name} 
        activeAgent={activeAgentForChat ? { id: activeAgentForChat.id, name: activeAgentForChat.name, system: activeAgentForChat.system } : null}
      />

      {/* New Agent Type Modal */}
      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
        onSave={onAddNewAgent}
        tools={mockTools}
      />

      {/* Add Registered Agent Modal */}
      {isAddAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">Agent 추가</h2>
              <button 
                onClick={resetAddAgentModal}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-5 overflow-y-auto flex-1">
              {/* System Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">시스템 선택 *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["e-총무", "BiOn", "SATIS"] as const).map((system) => (
                    <button
                      key={system}
                      onClick={() => setNewAgentSystem(system)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                        newAgentSystem === system
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {system}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent 이름 *</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Agent 이름을 입력하세요"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Agent Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent 설명</label>
                <textarea
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  placeholder="Agent의 역할과 기능을 설명하세요"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
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
                        newAgentSelectedTools.includes(tool.id)
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
                  선택된 Tool: {newAgentSelectedTools.length}개
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
                        newAgentKnowledge.includes(kb.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {kb.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  선택된 지식: {newAgentKnowledge.length}개
                </p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium mb-2">지침</label>
                <textarea
                  value={newAgentInstructions}
                  onChange={(e) => setNewAgentInstructions(e.target.value)}
                  placeholder="Agent가 따라야 할 지침을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border shrink-0">
              <button
                onClick={resetAddAgentModal}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddRegisteredAgent}
                disabled={!newAgentSystem || !newAgentName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Registered Agent Modal */}
      {isEditAgentModalOpen && editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">Agent 수정</h2>
              <button 
                onClick={resetAddAgentModal}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-5 overflow-y-auto flex-1">
              {/* System Display */}
              <div>
                <label className="block text-sm font-medium mb-2">시스템</label>
                <div className="px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm">
                  {newAgentSystem}
                </div>
              </div>
              
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent 이름 *</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Agent 이름을 입력하세요"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Agent Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Agent 설명</label>
                <textarea
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  placeholder="Agent의 역할과 기능을 설명하세요"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
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
                        newAgentSelectedTools.includes(tool.id)
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
                  선택된 Tool: {newAgentSelectedTools.length}개
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
                        newAgentKnowledge.includes(kb.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {kb.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  선택된 지식: {newAgentKnowledge.length}개
                </p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium mb-2">지침</label>
                <textarea
                  value={newAgentInstructions}
                  onChange={(e) => setNewAgentInstructions(e.target.value)}
                  placeholder="Agent가 따라야 할 지침을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border shrink-0">
              <button
                onClick={resetAddAgentModal}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={resetAddAgentModal}
                disabled={!newAgentName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}