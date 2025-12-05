import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { AgentDetail } from "./AgentDetail";
import { WorkflowPage } from "./WorkflowPage";
import Dashboard from "./Dashboard";

type ViewType = "agent" | "workflow" | "assistant";

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [currentView, setCurrentView] = useState<ViewType>("assistant");
  const [selectedAgent, setSelectedAgent] = useState<string | null>("a1");
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const { t } = useTranslation();

  const agentNames: Record<string, string> = {
    "a1": t("agent.bizSupport"),
    "a2": t("agent.its"),
    "a3": t("agent.sop"),
    "a4": t("agent.db"),
    "a5": t("agent.monitoring"),
    "a6": t("agent.changeManagement"),
    "a7": t("agent.report"),
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
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {t("common.selectAgent")}
          </div>
        );
      case "workflow":
        return <WorkflowPage />;
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
      />
      {renderContent()}
    </div>
  );
};

export default Index;
