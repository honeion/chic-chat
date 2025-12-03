import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import Dashboard from "./Dashboard";

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat} 
      />
      {isDashboard ? (
        <Dashboard />
      ) : (
        <ChatArea selectedChatId={selectedChat} />
      )}
    </div>
  );
};

export default Index;
