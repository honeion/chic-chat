import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Settings, Info } from "lucide-react";
import { SOPAgentDashboard } from "@/components/agent/SOPAgentDashboard";
import { ITSAgentDashboard } from "@/components/agent/ITSAgentDashboard";
import { MonitoringAgentDashboard } from "@/components/agent/MonitoringAgentDashboard";
import { DBAgentDashboard } from "@/components/agent/DBAgentDashboard";
import { BizSupportAgentDashboard } from "@/components/agent/BizSupportAgentDashboard";
import { ChangeManagementAgentDashboard } from "@/components/agent/ChangeManagementAgentDashboard";
import { ReportAgentDashboard } from "@/components/agent/ReportAgentDashboard";
import { AgentChatPanel } from "@/components/agent/AgentChatPanel";

interface ProcessingStep { id: string; step: string; status: "pending" | "running" | "completed"; detail?: string; }
interface Message { role: "user" | "agent"; content: string; processingSteps?: ProcessingStep[]; }
interface AgentDetailProps { agentId: string; agentName: string; }
type AgentType = "sop" | "its" | "monitoring" | "db" | "biz-support" | "change-management" | "report";

// RequestItem 타입 (ITSAgentDashboard와 동일)
type RequestType = "I" | "C" | "D" | "A" | "S";
interface RequestItem {
  id: string;
  type: RequestType;
  title: string;
  date: string;
  status: "open" | "in-progress" | "resolved";
}

// 활성 요청 타입 (채팅 패널용)
interface ActiveRequest {
  id: string;
  type: RequestType;
  title: string;
  date: string;
}

// 채팅 세션 타입
export interface ChatSession {
  id: string;
  request: ActiveRequest;
  messages: Message[];
  status: "in-progress" | "completed";
  createdAt: string;
}

const requestTypeLabels: Record<RequestType, string> = {
  "I": "인시던트 요청",
  "C": "개선 요청",
  "D": "데이터 요청",
  "A": "계정/권한 요청",
  "S": "단순 요청",
};

const getAgentType = (agentName: string): AgentType => {
  const name = agentName.toLowerCase();
  if (name.includes("sop")) return "sop";
  if (name.includes("its")) return "its";
  if (name.includes("모니터링") || name.includes("monitoring") || name.includes("giám sát")) return "monitoring";
  if (name.includes("db") || name.includes("database")) return "db";
  if (name.includes("biz") || name.includes("support") || name.includes("비즈")) return "biz-support";
  if (name.includes("변경") || name.includes("change") || name.includes("quản lý thay đổi")) return "change-management";
  if (name.includes("보고서") || name.includes("report") || name.includes("báo cáo")) return "report";
  return "sop";
};

export function AgentDetail({ agentId, agentName }: AgentDetailProps) {
  const { t } = useTranslation();
  const agentType = getAgentType(agentName);

  const getQuickActions = () => {
    switch (agentType) {
      case "sop": return [{ label: t("agentDetail.quickActions.status"), action: "status" }, { label: t("agentDetail.quickActions.logs"), action: "logs" }, { label: t("agentDetail.quickActions.report"), action: "report" }];
      case "its": return [{ label: t("agentDetail.quickActions.tickets"), action: "tickets" }, { label: t("agentDetail.quickActions.requests"), action: "requests" }, { label: t("agentDetail.quickActions.stats"), action: "stats" }];
      case "monitoring": return [{ label: t("agentDetail.quickActions.overview"), action: "overview" }, { label: t("agentDetail.quickActions.alerts"), action: "alerts" }, { label: t("agentDetail.quickActions.resources"), action: "resources" }];
      case "db": return [{ label: t("agentDetail.quickActions.dbStatus"), action: "db-status" }, { label: t("agentDetail.quickActions.query"), action: "query" }, { label: t("agentDetail.quickActions.backup"), action: "backup" }];
      case "biz-support": return [{ label: t("agentDetail.quickActions.tasks"), action: "tasks" }, { label: t("agentDetail.quickActions.report"), action: "report" }, { label: t("agentDetail.quickActions.kpi"), action: "kpi" }];
      case "change-management": return [{ label: t("agentDetail.quickActions.request"), action: "request" }, { label: t("agentDetail.quickActions.schedule"), action: "schedule" }, { label: t("agentDetail.quickActions.approvals"), action: "approvals" }];
      case "report": return [{ label: t("agentDetail.quickActions.list"), action: "list" }, { label: t("agentDetail.quickActions.create"), action: "create" }, { label: t("agentDetail.quickActions.schedule"), action: "schedule" }];
      default: return [];
    }
  };

  const quickActions = getQuickActions();
  
  // 채팅 세션 관리
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // 현재 활성 세션의 메시지
  const activeSession = chatSessions.find(s => s.id === activeSessionId);
  const currentMessages = activeSession?.messages || [{ role: "agent" as const, content: t("agentDetail.hello", { agentName }) }];
  const activeRequest = activeSession?.request || null;

  // 메시지 업데이트 함수
  const updateSessionMessages = (sessionId: string, updater: (messages: Message[]) => Message[]) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: updater(session.messages) }
        : session
    ));
  };

  const simulateProcessing = (taskName: string, sessionId: string) => {
    const steps: ProcessingStep[] = [
      { id: "1", step: t("agentDetail.processing.analyzing"), status: "pending" },
      { id: "2", step: t("agentDetail.processing.collecting"), status: "pending" },
      { id: "3", step: t("agentDetail.processing.executing"), status: "pending" },
      { id: "4", step: t("agentDetail.processing.generating"), status: "pending" },
    ];
    
    updateSessionMessages(sessionId, prev => [...prev, { role: "agent", content: t("agentDetail.taskStart", { task: taskName }), processingSteps: steps }]);
    
    steps.forEach((_, index) => {
      setTimeout(() => {
        updateSessionMessages(sessionId, prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.processingSteps) {
            lastMsg.processingSteps = lastMsg.processingSteps.map((step, i) => ({ ...step, status: i < index ? "completed" : i === index ? "running" : "pending" }));
          }
          return [...updated];
        });
      }, (index + 1) * 800);
    });
    
    setTimeout(() => {
      updateSessionMessages(sessionId, prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.processingSteps) { 
          lastMsg.processingSteps = lastMsg.processingSteps.map(step => ({ ...step, status: "completed" as const })); 
        }
        return [...updated];
      });
      setTimeout(() => { 
        updateSessionMessages(sessionId, prev => [...prev, { role: "agent", content: t("agentDetail.taskComplete", { task: taskName }) }]); 
      }, 500);
    }, steps.length * 800 + 500);
  };

  const handleSendMessage = (message: string) => { 
    if (activeSessionId) {
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "user", content: message }]); 
      simulateProcessing(message, activeSessionId); 
    }
  };
  
  const handleQuickAction = (action: string) => {
    if (activeSessionId) {
      const label = t(`agentDetail.actionLabels.${action}`) || action;
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "user", content: label }]); 
      simulateProcessing(label, activeSessionId);
    }
  };
  
  const handleApprove = (_: string, incident: { title: string }) => { 
    if (activeSessionId) {
      simulateProcessing(`${incident.title} ${t("common.confirm")}`, activeSessionId); 
    }
  };
  
  const handleReject = () => { 
    if (activeSessionId) {
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "agent", content: t("agentDetail.rejected") }]); 
    }
  };
  
  const handleITSRequest = (requestType: string) => {
    const label = t(`agentDetail.requestTypes.${requestType}`) || requestType;
    // 새로운 세션 생성
    const newSessionId = `session-${Date.now()}`;
    const newRequest: ActiveRequest = {
      id: `req-${Date.now()}`,
      type: requestType === "account" ? "A" : requestType === "data" ? "D" : "S",
      title: label,
      date: new Date().toISOString().split('T')[0],
    };
    
    const typeLabel = requestTypeLabels[newRequest.type];
    const chatIntro = `[${typeLabel}] ${newRequest.title}\n일자: ${newRequest.date}\n\n해당 요청을 분석하고 처리를 시작하겠습니다.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: newRequest,
      messages: [{ role: "agent", content: chatIntro }],
      status: "in-progress",
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    
    setTimeout(() => simulateProcessing(label, newSessionId), 100);
  };

  // ITS 요청 채팅 시작 핸들러
  const handleStartChat = (request: RequestItem) => {
    // 기존 세션 확인
    const existingSession = chatSessions.find(s => s.request.id === request.id);
    if (existingSession) {
      setActiveSessionId(existingSession.id);
      return;
    }
    
    // 새로운 세션 생성
    const newSessionId = `session-${Date.now()}`;
    const typeLabel = requestTypeLabels[request.type];
    const chatIntro = `[${typeLabel}] ${request.title}\n일자: ${request.date}\n\n해당 요청을 분석하고 처리를 시작하겠습니다.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { id: request.id, type: request.type, title: request.title, date: request.date },
      messages: [{ role: "agent", content: chatIntro }],
      status: "in-progress",
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    
    setTimeout(() => simulateProcessing(request.title, newSessionId), 100);
  };

  const handleCloseRequest = () => {
    setActiveSessionId(null);
  };

  // 이력에서 세션 선택
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const renderDashboard = () => {
    switch (agentType) {
      case "sop": return <SOPAgentDashboard onApprove={handleApprove} onReject={handleReject} />;
      case "its": return (
        <ITSAgentDashboard 
          onRequest={handleITSRequest} 
          onStartChat={handleStartChat}
          chatSessions={chatSessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      );
      case "monitoring": return <MonitoringAgentDashboard />;
      case "db": return <DBAgentDashboard />;
      case "biz-support": return <BizSupportAgentDashboard />;
      case "change-management": return <ChangeManagementAgentDashboard />;
      case "report": return <ReportAgentDashboard />;
      default: return <SOPAgentDashboard onApprove={handleApprove} onReject={handleReject} />;
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="w-[70%] p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"><Bot className="w-6 h-6 text-primary" /></div>
            <div><h1 className="text-2xl font-bold">{agentName}</h1><p className="text-sm text-muted-foreground">Agent ID: {agentId}</p></div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Info className="w-4 h-4" />{t("common.info")}</button>
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Settings className="w-4 h-4" />{t("common.settings")}</button>
          </div>
        </div>
        {renderDashboard()}
      </div>
      <AgentChatPanel 
        agentName={agentName} 
        messages={currentMessages} 
        onSendMessage={handleSendMessage} 
        onQuickAction={handleQuickAction} 
        quickActions={quickActions}
        activeRequest={activeRequest}
        onCloseRequest={handleCloseRequest}
      />
    </div>
  );
}
