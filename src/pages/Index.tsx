import { useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat} 
      />
      <ChatArea selectedChatId={selectedChat} />
    </div>
  );
};

export default Index;
