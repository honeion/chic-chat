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
  const [messages, setMessages] = useState<Message[]>([{ role: "agent", content: t("agentDetail.hello", { agentName }) }]);

  const simulateProcessing = (taskName: string) => {
    const steps: ProcessingStep[] = [
      { id: "1", step: t("agentDetail.processing.analyzing"), status: "pending" },
      { id: "2", step: t("agentDetail.processing.collecting"), status: "pending" },
      { id: "3", step: t("agentDetail.processing.executing"), status: "pending" },
      { id: "4", step: t("agentDetail.processing.generating"), status: "pending" },
    ];
    setMessages(prev => [...prev, { role: "agent", content: t("agentDetail.taskStart", { task: taskName }), processingSteps: steps }]);
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
      setTimeout(() => { setMessages(prev => [...prev, { role: "agent", content: t("agentDetail.taskComplete", { task: taskName }) }]); }, 500);
    }, steps.length * 800 + 500);
  };

  const handleSendMessage = (message: string) => { setMessages(prev => [...prev, { role: "user", content: message }]); simulateProcessing(message); };
  const handleQuickAction = (action: string) => {
    const label = t(`agentDetail.actionLabels.${action}`) || action;
    setMessages(prev => [...prev, { role: "user", content: label }]); 
    simulateProcessing(label);
  };
  const handleApprove = (_: string, incident: { title: string }) => { simulateProcessing(`${incident.title} ${t("common.confirm")}`); };
  const handleReject = () => { setMessages(prev => [...prev, { role: "agent", content: t("agentDetail.rejected") }]); };
  const handleITSRequest = (requestType: string) => {
    const label = t(`agentDetail.requestTypes.${requestType}`) || requestType;
    simulateProcessing(label);
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
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Info className="w-4 h-4" />{t("common.info")}</button>
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Settings className="w-4 h-4" />{t("common.settings")}</button>
          </div>
        </div>
        {renderDashboard()}
      </div>
      <AgentChatPanel agentName={agentName} messages={messages} onSendMessage={handleSendMessage} onQuickAction={handleQuickAction} quickActions={quickActions} />
    </div>
  );
}
