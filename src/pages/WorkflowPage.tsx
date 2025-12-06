import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Workflow, Plus, Play, Save, Trash2, ChevronRight, ChevronDown, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewAgentModal } from "@/components/workflow/NewAgentModal";
import { WorkflowChatPanel } from "@/components/workflow/WorkflowChatPanel";
import { WorkflowItem, OperatingSystem } from "@/pages/Index";

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
}

export function WorkflowPage({
  myAgents,
  setMyAgents,
  selectedAgent,
  setSelectedAgent,
  onAddFromMarket,
  onAddNewAgent
}: WorkflowPageProps) {
  const { t } = useTranslation();
  const [expandedMyAgent, setExpandedMyAgent] = useState<string | null>(null);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);

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
                  <h1 className="text-2xl font-bold">{selectedAgent.name}</h1>
                  <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewAgentModalOpen(true)}
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
                    <p className="text-sm text-muted-foreground mt-1">등록된 Agent: 0개</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty Agent List */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                등록된 Agent
                <span className="text-sm font-normal text-muted-foreground">(0개)</span>
              </h2>
              <div className="p-8 rounded-xl border border-dashed border-border/50 text-center">
                <p className="text-muted-foreground mb-4">
                  이 Agent Type에 등록된 Agent가 없습니다.<br />
                  Agent 추가 버튼을 눌러 시스템별 Agent를 등록하세요.
                </p>
                <button 
                  onClick={() => setIsNewAgentModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agent 추가
                </button>
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
                            <span className="text-xs text-muted-foreground">등록된 Agent: 0개</span>
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
      <WorkflowChatPanel agentName={selectedAgent?.name} />

      {/* New Agent Modal */}
      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
        onSave={onAddNewAgent}
        tools={mockTools}
      />
    </div>
  );
}