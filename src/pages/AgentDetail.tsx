import { useState } from "react";
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

const getAgentType = (agentName: string): AgentType => {
  const name = agentName.toLowerCase();
  if (name.includes("sop")) return "sop";
  if (name.includes("its")) return "its";
  if (name.includes("모니터링") || name.includes("monitoring")) return "monitoring";
  if (name.includes("db") || name.includes("database")) return "db";
  if (name.includes("biz") || name.includes("support") || name.includes("비즈")) return "biz-support";
  if (name.includes("변경") || name.includes("change")) return "change-management";
  if (name.includes("보고서") || name.includes("report")) return "report";
  return "sop";
};

const getQuickActions = (agentType: AgentType) => {
  switch (agentType) {
    case "sop": return [{ label: "상태 확인", action: "status" }, { label: "로그 분석", action: "logs" }, { label: "보고서 생성", action: "report" }];
    case "its": return [{ label: "티켓 현황", action: "tickets" }, { label: "요청 처리", action: "requests" }, { label: "통계 보기", action: "stats" }];
    case "monitoring": return [{ label: "전체 현황", action: "overview" }, { label: "알림 확인", action: "alerts" }, { label: "리소스 분석", action: "resources" }];
    case "db": return [{ label: "DB 상태", action: "db-status" }, { label: "쿼리 분석", action: "query" }, { label: "백업 현황", action: "backup" }];
    case "biz-support": return [{ label: "업무 현황", action: "tasks" }, { label: "보고서 생성", action: "report" }, { label: "KPI 확인", action: "kpi" }];
    case "change-management": return [{ label: "변경 요청", action: "request" }, { label: "일정 확인", action: "schedule" }, { label: "승인 현황", action: "approvals" }];
    case "report": return [{ label: "보고서 목록", action: "list" }, { label: "새 보고서", action: "create" }, { label: "예약 관리", action: "schedule" }];
    default: return [];
  }
};

export function AgentDetail({ agentId, agentName }: AgentDetailProps) {
  const agentType = getAgentType(agentName);
  const quickActions = getQuickActions(agentType);
  const [messages, setMessages] = useState<Message[]>([{ role: "agent", content: `안녕하세요! ${agentName}입니다. 무엇을 도와드릴까요?` }]);

  const simulateProcessing = (taskName: string) => {
    const steps: ProcessingStep[] = [
      { id: "1", step: "요청 분석 중...", status: "pending" },
      { id: "2", step: "데이터 수집 중...", status: "pending" },
      { id: "3", step: "처리 실행 중...", status: "pending" },
      { id: "4", step: "결과 생성 중...", status: "pending" },
    ];
    setMessages(prev => [...prev, { role: "agent", content: `"${taskName}" 작업을 시작합니다.`, processingSteps: steps }]);
    steps.forEach((_, index) => {
      setTimeout(() => {
        setMessages(prev => {
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
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.processingSteps) { lastMsg.processingSteps = lastMsg.processingSteps.map(step => ({ ...step, status: "completed" as const })); }
        return [...updated];
      });
      setTimeout(() => { setMessages(prev => [...prev, { role: "agent", content: `"${taskName}" 작업이 완료되었습니다.` }]); }, 500);
    }, steps.length * 800 + 500);
  };

  const handleSendMessage = (message: string) => { setMessages(prev => [...prev, { role: "user", content: message }]); simulateProcessing(message); };
  const handleQuickAction = (action: string) => {
    const labels: Record<string, string> = { status: "현재 상태 확인", logs: "로그 분석", report: "보고서 생성", tickets: "티켓 현황 조회", requests: "요청 처리", stats: "통계 분석", overview: "전체 현황 조회", alerts: "알림 확인", resources: "리소스 분석", "db-status": "DB 상태 확인", query: "쿼리 분석", backup: "백업 현황 확인", tasks: "업무 현황 조회", kpi: "KPI 확인", request: "변경 요청", schedule: "일정 확인", approvals: "승인 현황 조회", list: "보고서 목록 조회", create: "새 보고서 생성" };
    setMessages(prev => [...prev, { role: "user", content: labels[action] || action }]); simulateProcessing(labels[action] || action);
  };
  const handleApprove = (_: string, incident: { title: string }) => { simulateProcessing(`${incident.title} 승인 처리`); };
  const handleReject = () => { setMessages(prev => [...prev, { role: "agent", content: "인시던트가 거부되었습니다." }]); };
  const handleITSRequest = (requestType: string) => {
    const names: Record<string, string> = { account: "계정 발급 신청", firewall: "방화벽 오픈 신청", data: "데이터 추출 요청", access: "접근 권한 신청" };
    simulateProcessing(names[requestType] || requestType);
  };

  const renderDashboard = () => {
    switch (agentType) {
      case "sop": return <SOPAgentDashboard onApprove={handleApprove} onReject={handleReject} />;
      case "its": return <ITSAgentDashboard onRequest={handleITSRequest} />;
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
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Info className="w-4 h-4" />정보</button>
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Settings className="w-4 h-4" />설정</button>
          </div>
        </div>
        {renderDashboard()}
      </div>
      <AgentChatPanel agentName={agentName} messages={messages} onSendMessage={handleSendMessage} onQuickAction={handleQuickAction} quickActions={quickActions} />
    </div>
  );
}
