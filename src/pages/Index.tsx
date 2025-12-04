import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { AgentDetail } from "./AgentDetail";
import { WorkflowPage } from "./WorkflowPage";
import Dashboard from "./Dashboard";

type ViewType = "agent" | "workflow" | "assistant";

const agentNames: Record<string, string> = {
  "a1": "Biz.Support Agent",
  "a2": "ITS Agent",
  "a3": "SOP Agent",
  "a4": "DB Agent",
  "a5": "모니터링 Agent",
  "a6": "변경관리 Agent",
  "a7": "보고서 Agent",
};

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [currentView, setCurrentView] = useState<ViewType>("assistant");
  const [selectedAgent, setSelectedAgent] = useState<string | null>("a1");
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

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
            Agent를 선택하세요
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
