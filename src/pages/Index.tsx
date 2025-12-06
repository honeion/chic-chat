import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { AgentDetail } from "./AgentDetail";
import { WorkflowPage } from "./WorkflowPage";
import Dashboard from "./Dashboard";
import { AgentDetailModal } from "@/components/workflow/AgentDetailModal";

type ViewType = "agent" | "workflow" | "assistant";

export const OPERATING_SYSTEMS = ["e-총무", "BiOn", "SATIS", "ITS"] as const;
export type OperatingSystem = typeof OPERATING_SYSTEMS[number];

export type AgentTemplateType = "daily-check" | "incident-response" | "weekly-report" | "its-automation" | "custom";

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: "active" | "draft" | "completed";
  lastRun?: string;
  system?: OperatingSystem;
  systems?: OperatingSystem[]; // 복수 시스템 지원
  templateType?: AgentTemplateType; // 템플릿 타입
}

export const agentMarketItems: WorkflowItem[] = [
  { id: "r1", name: "서버 상태 점검 Agent", description: "서버 헬스체크 및 로그 분석", steps: ["Health Check", "Log Analyzer", "Alert Send"], status: "active" },
  { id: "r2", name: "DB 백업 Agent", description: "데이터베이스 백업 및 검증", steps: ["DB Connect", "Backup Create", "Verify", "Notify"], status: "active" },
  { id: "r3", name: "배포 자동화 Agent", description: "자동화된 배포 워크플로우", steps: ["Build", "Test", "Deploy", "Health Check"], status: "active" },
  { id: "r4", name: "로그 모니터링 Agent", description: "실시간 로그 수집 및 분석", steps: ["Log Collect", "Parse", "Analyze", "Alert"], status: "active" },
  { id: "r5", name: "보안 스캔 Agent", description: "취약점 탐지 및 보고", steps: ["Scan Init", "Vulnerability Check", "Report Gen", "Notify"], status: "active" },
  { id: "r6", name: "성능 테스트 Agent", description: "부하 테스트 및 성능 측정", steps: ["Load Test", "Metrics Collect", "Analyze", "Report"], status: "active" },
];

// Agent 템플릿 정의
export const agentTemplates: { type: AgentTemplateType; name: string; description: string; steps: string[] }[] = [
  { type: "daily-check", name: "일일 점검 루틴", description: "매일 아침 자동 실행되는 점검 루틴", steps: ["Health Check", "DB Connect", "Report Gen"] },
  { type: "incident-response", name: "장애 대응 플로우", description: "장애 감지 시 자동 대응 플로우", steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"] },
  { type: "weekly-report", name: "주간 리포트", description: "매주 월요일 리포트 생성", steps: ["Data Collect", "Analyze", "Report Gen", "Email Send"] },
  { type: "its-automation", name: "ITS 티켓 자동화", description: "티켓 자동 분류 및 할당", steps: ["Ticket Parse", "Classify", "Assign", "Notify"] },
  { type: "custom", name: "커스텀 Agent", description: "사용자 정의 Agent", steps: [] },
];

export const initialMyAgents: WorkflowItem[] = [
  { id: "m1", name: "e-총무 일일 점검", description: "e-총무 시스템 매일 아침 점검", steps: ["Health Check", "DB Connect", "Report Gen"], status: "active", lastRun: "오늘 09:00", systems: ["e-총무"], templateType: "daily-check" },
  { id: "m1-2", name: "BiOn 일일 점검", description: "BiOn 시스템 매일 아침 점검", steps: ["Health Check", "DB Connect", "Report Gen"], status: "active", lastRun: "오늘 09:00", systems: ["BiOn"], templateType: "daily-check" },
  { id: "m2", name: "BiOn 장애 대응", description: "BiOn 장애 감지 시 자동 대응", steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"], status: "draft", systems: ["BiOn"], templateType: "incident-response" },
  { id: "m2-2", name: "SATIS 장애 대응", description: "SATIS 장애 감지 시 자동 대응", steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"], status: "active", systems: ["SATIS"], templateType: "incident-response" },
  { id: "m3", name: "SATIS 주간 리포트", description: "SATIS 매주 월요일 리포트 생성", steps: ["Data Collect", "Analyze", "Report Gen", "Email Send"], status: "completed", lastRun: "지난주 월요일", systems: ["SATIS"], templateType: "weekly-report" },
  { id: "m3-2", name: "전체 시스템 주간 리포트", description: "전체 시스템 통합 주간 리포트", steps: ["Data Collect", "Analyze", "Report Gen", "Email Send"], status: "active", systems: ["e-총무", "BiOn", "SATIS"], templateType: "weekly-report" },
  { id: "m4", name: "ITS 티켓 자동화", description: "티켓 자동 분류 및 할당", steps: ["Ticket Parse", "Classify", "Assign", "Notify"], status: "active", systems: ["ITS"], templateType: "its-automation" },
];

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [currentView, setCurrentView] = useState<ViewType>("assistant");
  const [selectedAgent, setSelectedAgent] = useState<string | null>("a1");
  const [myAgents, setMyAgents] = useState<WorkflowItem[]>(initialMyAgents);
  const [selectedWorkflowAgent, setSelectedWorkflowAgent] = useState<WorkflowItem | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState<AgentTemplateType | null>(null);
  const [selectedSystems, setSelectedSystems] = useState<OperatingSystem[]>([]);
  const [selectedMarketAgent, setSelectedMarketAgent] = useState<WorkflowItem | null>(null);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const { t } = useTranslation();

  const SYSTEM_BOXES: OperatingSystem[] = ["e-총무", "BiOn", "SATIS"];

  const handleSelectAllSystems = () => {
    setSelectedSystems([...SYSTEM_BOXES]);
  };

  const agentNames: Record<string, string> = {
    "a1": t("agent.its"),
    "a2": t("agent.sop"),
    "a3": t("agent.changeManagement"),
    "a4": t("agent.db"),
    "a5": t("agent.monitoring"),
    "a6": t("agent.report"),
    "a7": t("agent.bizSupport"),
  };

  const handleAddFromMarket = (marketAgent: WorkflowItem) => {
    const newAgent: WorkflowItem = {
      ...marketAgent,
      id: `m${Date.now()}`,
      status: "active",
      templateType: "custom", // 마켓에서 추가된 Agent는 커스텀 타입
    };
    setMyAgents([...myAgents, newAgent]);
    setSelectedWorkflowAgent(newAgent);
    setSelectedMarketAgent(null);
  };

  const handleAddNewAgent = (agent: { name: string; description: string; steps: string[]; instructions: string }) => {
    const newAgent: WorkflowItem = {
      id: `m${Date.now()}`,
      name: agent.name,
      description: agent.description,
      steps: agent.steps,
      status: "draft",
    };
    setMyAgents([...myAgents, newAgent]);
  };

  const handleNavigateToAgent = (targetAgentId: string) => {
    setSelectedAgent(targetAgentId);
    setCurrentView("agent");
  };

  const renderContent = () => {
    if (isDashboard) {
      return <Dashboard />;
    }

    switch (currentView) {
      case "agent":
        return selectedAgent ? (
          <AgentDetail 
            agentId={selectedAgent} 
            agentName={agentNames[selectedAgent] || "Agent"}
            onNavigateToAgent={handleNavigateToAgent}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {t("common.selectAgent")}
          </div>
        );
      case "workflow":
        return (
          <WorkflowPage 
            myAgents={myAgents}
            setMyAgents={setMyAgents}
            selectedAgent={selectedWorkflowAgent}
            setSelectedAgent={setSelectedWorkflowAgent}
            onAddFromMarket={handleAddFromMarket}
            onAddNewAgent={handleAddNewAgent}
            selectedTemplateType={selectedTemplateType}
            setSelectedTemplateType={setSelectedTemplateType}
            selectedSystems={selectedSystems}
            setSelectedSystems={setSelectedSystems}
          />
        );
      case "assistant":
      default:
        return <ChatArea selectedChatId={selectedChat} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat}
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
        myAgents={myAgents}
        selectedWorkflowAgent={selectedWorkflowAgent}
        onSelectWorkflowAgent={setSelectedWorkflowAgent}
        selectedTemplateType={selectedTemplateType}
        onSelectTemplateType={setSelectedTemplateType}
        onSelectAllSystems={handleSelectAllSystems}
        onAddFromMarket={handleAddFromMarket}
        selectedMarketAgent={selectedMarketAgent}
        onSelectMarketAgent={setSelectedMarketAgent}
      />
      {renderContent()}
      
      {/* Agent Market Detail Modal */}
      <AgentDetailModal
        isOpen={!!selectedMarketAgent}
        onClose={() => setSelectedMarketAgent(null)}
        agent={selectedMarketAgent}
        onAddToMyAgent={handleAddFromMarket}
      />
    </div>
  );
};

export default Index;
