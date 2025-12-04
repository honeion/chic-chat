import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Plus, 
  Search,
  Bot,
  Workflow,
  LayoutDashboard
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

type ViewType = "agent" | "workflow" | "assistant";

interface Agent {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  type: "user" | "agent" | "workflow";
  status?: "online" | "offline" | "busy";
}

const mockAgents: Agent[] = [
  { id: "a1", name: "ITS Agent", status: "online" },
  { id: "a2", name: "SOP Agent", status: "online" },
  { id: "a3", name: "DB Agent", status: "busy" },
  { id: "a4", name: "RAG Agent", status: "online" },
  { id: "a5", name: "Monitor Agent", status: "offline" },
];

const mockChatRooms: ChatRoom[] = [
  { id: "1", name: "AI 어시스턴트", lastMessage: "안녕하세요! 무엇을 도와드릴까요?", timestamp: "방금", unread: 2, type: "agent", status: "online" },
  { id: "2", name: "Super Agent", lastMessage: "작업이 완료되었습니다.", timestamp: "5분 전", unread: 0, type: "agent", status: "online" },
  { id: "3", name: "데이터 워크플로우", lastMessage: "파이프라인 실행 중...", timestamp: "10분 전", unread: 1, type: "workflow", status: "busy" },
  { id: "4", name: "김철수", lastMessage: "네, 확인했습니다!", timestamp: "1시간 전", unread: 0, type: "user", status: "offline" },
  { id: "5", name: "RAG 에이전트", lastMessage: "문서 검색 완료", timestamp: "2시간 전", unread: 0, type: "agent", status: "online" },
];

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedAgent: string | null;
  onSelectAgent: (id: string) => void;
}

export function ChatSidebar({ 
  selectedChat, 
  onSelectChat, 
  currentView, 
  onViewChange,
  selectedAgent,
  onSelectAgent 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const filteredRooms = mockChatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgents = mockAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status?: "online" | "offline" | "busy") => {
    switch (status) {
      case "online": return "bg-status-online";
      case "busy": return "bg-status-busy";
      default: return "bg-status-offline";
    }
  };

  const isDashboard = location.pathname === "/dashboard";

  return (
    <aside className="w-80 h-full bg-sidebar flex flex-col border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gradient">AI Worker</h1>
          <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex border-b border-border">
        {[
          { view: "agent" as ViewType, icon: Bot, label: "SKI Agent" },
          { view: "workflow" as ViewType, icon: Workflow, label: "My Agent" },
          { view: "assistant" as ViewType, icon: MessageSquare, label: "Assistant" },
        ].map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => {
              onViewChange(view);
              if (location.pathname !== "/") {
                navigate("/");
              }
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2",
              currentView === view
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard Navigation */}
      <div className="p-2 border-b border-border">
        <button
          onClick={() => navigate("/dashboard")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            isDashboard 
              ? "bg-primary/20 text-primary" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">대시보드</span>
        </button>
      </div>

      {/* Content based on view */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {currentView === "agent" && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agent List
            </div>
            {filteredAgents.map((agent, index) => (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent.id);
                  if (location.pathname !== "/") {
                    navigate("/");
                  }
                }}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all duration-200 animate-fade-in flex items-center gap-3",
                  "hover:bg-secondary/80",
                  selectedAgent === agent.id && !isDashboard
                    ? "bg-primary/20 border border-primary/30" 
                    : "bg-transparent"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar",
                    getStatusColor(agent.status)
                  )} />
                </div>
                <span className="font-medium text-sm">{agent.name}</span>
              </button>
            ))}
          </>
        )}

        {currentView === "workflow" && (
          <div className="p-4 text-center text-muted-foreground">
            <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">워크플로우 페이지가 오른쪽에 표시됩니다</p>
          </div>
        )}

        {currentView === "assistant" && (
          <>
            {/* Category Filter */}
            <div className="flex gap-1 p-1 mb-2">
              {[
                { icon: MessageSquare, label: "전체" },
                { icon: Bot, label: "Agent" },
                { icon: Workflow, label: "Workflow" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Chat List */}
            {filteredRooms.map((room, index) => (
              <button
                key={room.id}
                onClick={() => {
                  onSelectChat(room.id);
                  if (location.pathname !== "/") {
                    navigate("/");
                  }
                }}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all duration-200 animate-fade-in",
                  "hover:bg-secondary/80",
                  selectedChat === room.id && !isDashboard && currentView === "assistant"
                    ? "bg-secondary shadow-card border border-primary/20" 
                    : "bg-transparent"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      room.type === "agent" ? "bg-primary/20 text-primary" :
                      room.type === "workflow" ? "bg-accent/20 text-accent" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      {room.type === "agent" ? <Bot className="w-4 h-4" /> :
                       room.type === "workflow" ? <Workflow className="w-4 h-4" /> :
                       <Users className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar",
                      getStatusColor(room.status)
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{room.name}</span>
                      <span className="text-xs text-muted-foreground">{room.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                  </div>

                  {room.unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                      {room.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">사용자</p>
            <p className="text-xs text-muted-foreground">Lv.2 사용자</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
