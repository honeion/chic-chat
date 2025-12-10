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
export type OperatingSystem = (typeof OPERATING_SYSTEMS)[number];

export interface RegisteredAgent {
  id: string;
  name: string;
  system: OperatingSystem;
  settings?: Record<string, string>;
  createdAt: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: "active" | "draft" | "completed";
  lastRun?: string;
  system?: OperatingSystem;
  systems?: OperatingSystem[];
  registeredAgents?: RegisteredAgent[];
}

export const agentMarketItems: WorkflowItem[] = [
  {
    id: "r1",
    name: "일일 점검 루틴",
    description: "매일 아침 자동 실행되는 점검 루틴",
    steps: ["Health Check", "DB Connect", "Report Gen"],
    status: "active",
  },
  {
    id: "r2",
    name: "장애 대응 플로우",
    description: "장애 감지 시 자동 대응 플로우",
    steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"],
    status: "active",
  },
  {
    id: "r3",
    name: "주간 리포트",
    description: "매주 월요일 리포트 생성",
    steps: ["Data Collect", "Analyze", "Report Gen", "Email Send"],
    status: "active",
  },
  {
    id: "r4",
    name: "ITS 티켓 자동화",
    description: "티켓 자동 분류 및 할당",
    steps: ["Ticket Parse", "Classify", "Assign", "Notify"],
    status: "active",
  },
  {
    id: "r5",
    name: "서버 상태 점검 Agent",
    description: "서버 헬스체크 및 로그 분석",
    steps: ["Health Check", "Log Analyzer", "Alert Send"],
    status: "active",
  },
  {
    id: "r6",
    name: "DB 백업 Agent",
    description: "데이터베이스 백업 및 검증",
    steps: ["DB Connect", "Backup Create", "Verify", "Notify"],
    status: "active",
  },
  {
    id: "r7",
    name: "배포 자동화 Agent",
    description: "자동화된 배포 워크플로우",
    steps: ["Build", "Test", "Deploy", "Health Check"],
    status: "active",
  },
  {
    id: "r8",
    name: "로그 모니터링 Agent",
    description: "실시간 로그 수집 및 분석",
    steps: ["Log Collect", "Parse", "Analyze", "Alert"],
    status: "active",
  },
];

export const initialMyAgents: WorkflowItem[] = [
  {
    id: "mat1",
    name: "시스템 점검 Agent",
    description: "정기적인 시스템 상태 점검 및 모니터링을 위한 Agent 타입",
    steps: ["Health Check", "Log Analyzer", "Report Gen"],
    status: "active",
    systems: ["e-총무", "BiOn", "SATIS"],
    registeredAgents: [
      {
        id: "ra1",
        name: "e-총무 일일점검 Agent",
        system: "e-총무",
        settings: {
          description: "e-총무 시스템 일일 점검",
          tools: "1,2,3",
          knowledge: "k1,k2",
          instructions: "매일 09시에 실행",
        },
        createdAt: "2024-01-10",
      },
      {
        id: "ra2",
        name: "BiOn 상태 모니터링",
        system: "BiOn",
        settings: {
          description: "BiOn 실시간 상태 체크",
          tools: "1,4",
          knowledge: "k1",
          instructions: "5분마다 상태 확인",
        },
        createdAt: "2024-01-11",
      },
      {
        id: "ra3",
        name: "SATIS 헬스체크",
        system: "SATIS",
        settings: {
          description: "SATIS 시스템 헬스체크",
          tools: "1,2",
          knowledge: "k2,k3",
          instructions: "서비스 상태 점검",
        },
        createdAt: "2024-01-12",
      },
    ],
  },
  {
    id: "mat2",
    name: "장애 대응 Agent",
    description: "장애 감지 및 자동 대응을 위한 Agent 타입",
    steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"],
    status: "active",
    systems: ["e-총무", "BiOn"],
    registeredAgents: [
      {
        id: "ra4",
        name: "e-총무 장애대응 Agent",
        system: "e-총무",
        settings: {
          description: "e-총무 장애 자동 대응",
          tools: "3,4,5",
          knowledge: "k2",
          instructions: "장애 감지 시 즉시 알림",
        },
        createdAt: "2024-01-13",
      },
      {
        id: "ra5",
        name: "BiOn 알림 Agent",
        system: "BiOn",
        settings: {
          description: "BiOn 이상 탐지 알림",
          tools: "4,5",
          knowledge: "k2,k4",
          instructions: "이상 징후 감지 시 담당자 알림",
        },
        createdAt: "2024-01-14",
      },
    ],
  },
];

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [currentView, setCurrentView] = useState<ViewType>("assistant");
  const [selectedAgent, setSelectedAgent] = useState<string | null>("a1");
  const [myAgents, setMyAgents] = useState<WorkflowItem[]>(initialMyAgents);
  const [selectedWorkflowAgent, setSelectedWorkflowAgent] = useState<WorkflowItem | null>(null);
  const [selectedMarketAgent, setSelectedMarketAgent] = useState<WorkflowItem | null>(null);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const { t } = useTranslation();

  const agentNames: Record<string, string> = {
    a1: t("agent.its"),
    a2: t("agent.sop"),
    a3: t("agent.changeManagement"),
    a4: t("agent.db"),
    a5: t("agent.monitoring"),
    a6: t("agent.report"),
    a7: t("agent.bizSupport"),
    a8: "Infra Agent",
  };

  const handleAddFromMarket = (marketAgent: WorkflowItem) => {
    const newAgent: WorkflowItem = {
      ...marketAgent,
      id: `m${Date.now()}`,
      status: "active",
      systems: marketAgent.systems || [],
    };
    setMyAgents([...myAgents, newAgent]);
    setSelectedWorkflowAgent(newAgent);
    setSelectedMarketAgent(null);
  };

  const handleAddNewAgent = (agent: {
    name: string;
    description: string;
    steps: string[];
    instructions: string;
    systems: OperatingSystem[];
  }) => {
    const newAgent: WorkflowItem = {
      id: `m${Date.now()}`,
      name: agent.name,
      description: agent.description,
      steps: agent.steps,
      status: "draft",
      systems: agent.systems,
      registeredAgents: [],
    };
    setMyAgents([...myAgents, newAgent]);
    setSelectedWorkflowAgent(newAgent);
  };

  const handleAddRegisteredAgent = (agentTypeId: string, registeredAgent: RegisteredAgent) => {
    const updatedAgents = myAgents.map((agent) => {
      if (agent.id === agentTypeId) {
        return {
          ...agent,
          registeredAgents: [...(agent.registeredAgents || []), registeredAgent],
        };
      }
      return agent;
    });
    setMyAgents(updatedAgents);
    // Update selectedWorkflowAgent too
    const updatedSelectedAgent = updatedAgents.find((a) => a.id === agentTypeId);
    if (updatedSelectedAgent) {
      setSelectedWorkflowAgent(updatedSelectedAgent);
    }
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
          <div className="flex-1 flex items-center justify-center text-muted-foreground">{t("common.selectAgent")}</div>
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
            onAddRegisteredAgent={handleAddRegisteredAgent}
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
