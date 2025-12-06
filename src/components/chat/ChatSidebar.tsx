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
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Store,
  Folder
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkflowItem, agentMarketItems, OPERATING_SYSTEMS, OperatingSystem } from "@/pages/Index";

type ViewType = "agent" | "workflow" | "assistant";

interface AgentChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Agent {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
  chatHistory: AgentChatHistory[];
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  type: "user" | "agent" | "workflow";
  status?: "online" | "offline" | "busy";
  system?: OperatingSystem;
}

// Agent list in specified order
const mockAgents: Agent[] = [
  { 
    id: "a1", 
    name: "ITS Agent", 
    status: "online",
    chatHistory: [
      { id: "a1-c1", title: "티켓 #2024-001", lastMessage: "티켓 처리가 완료되었습니다.", timestamp: "10분 전", unread: 2 },
      { id: "a1-c2", title: "시스템 점검 요청", lastMessage: "점검 일정을 확인해주세요.", timestamp: "3시간 전", unread: 0 },
    ]
  },
  { 
    id: "a2", 
    name: "SOP Agent", 
    status: "online",
    chatHistory: [
      { id: "a2-c1", title: "SOP 문서 조회", lastMessage: "관련 SOP를 찾았습니다.", timestamp: "30분 전", unread: 0 },
    ]
  },
  { 
    id: "a3", 
    name: "변경관리 Agent", 
    status: "online",
    chatHistory: []
  },
  { 
    id: "a4", 
    name: "DB Agent", 
    status: "busy",
    chatHistory: [
      { id: "a4-c1", title: "데이터 조회 요청", lastMessage: "쿼리 실행 중입니다.", timestamp: "방금", unread: 1 },
    ]
  },
  { 
    id: "a5", 
    name: "모니터링 Agent", 
    status: "online",
    chatHistory: [
      { id: "a5-c1", title: "시스템 상태 확인", lastMessage: "시스템 상태 정상입니다.", timestamp: "1시간 전", unread: 0 },
      { id: "a5-c2", title: "알림 설정", lastMessage: "알림이 설정되었습니다.", timestamp: "어제", unread: 0 },
    ]
  },
  { 
    id: "a6", 
    name: "보고서 Agent", 
    status: "offline",
    chatHistory: [
      { id: "a6-c1", title: "월간 보고서", lastMessage: "보고서 생성 완료", timestamp: "2시간 전", unread: 0 },
    ]
  },
  { 
    id: "a7", 
    name: "Biz.Support Agent", 
    status: "online",
    chatHistory: [
      { id: "a7-c1", title: "업무 지원 요청", lastMessage: "작업이 완료되었습니다.", timestamp: "5분 전", unread: 1 },
      { id: "a7-c2", title: "보고서 작성 도움", lastMessage: "보고서 초안을 확인해주세요.", timestamp: "1시간 전", unread: 0 },
    ]
  },
];

const mockChatRooms: ChatRoom[] = [
  { id: "1", name: "AI 어시스턴트", lastMessage: "안녕하세요! 무엇을 도와드릴까요?", timestamp: "방금", unread: 2, type: "agent", status: "online", system: "e-총무" },
  { id: "2", name: "데이터 분석 Agent", lastMessage: "보고서 생성 완료", timestamp: "2시간 전", unread: 0, type: "workflow", status: "online", system: "BiOn" },
  { id: "3", name: "SATIS 모니터링", lastMessage: "시스템 정상 작동 중", timestamp: "1시간 전", unread: 1, type: "agent", status: "online", system: "SATIS" },
  { id: "4", name: "ITS 티켓 처리", lastMessage: "티켓이 할당되었습니다", timestamp: "30분 전", unread: 3, type: "workflow", status: "busy", system: "ITS" },
];

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedAgent: string | null;
  onSelectAgent: (id: string) => void;
  myAgents: WorkflowItem[];
  selectedWorkflowAgent: WorkflowItem | null;
  onSelectWorkflowAgent: (agent: WorkflowItem | null) => void;
}

export function ChatSidebar({ 
  selectedChat, 
  onSelectChat, 
  currentView, 
  onViewChange,
  selectedAgent,
  onSelectAgent,
  myAgents,
  selectedWorkflowAgent,
  onSelectWorkflowAgent,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSystems, setExpandedSystems] = useState<OperatingSystem[]>([...OPERATING_SYSTEMS]);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [selectedSystem, setSelectedSystem] = useState<OperatingSystem | null>(null);
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
  const [assistantSelectedSystem, setAssistantSelectedSystem] = useState<OperatingSystem | null>(null);
  const [assistantSystemDropdownOpen, setAssistantSystemDropdownOpen] = useState(false);

  const toggleSystem = (system: OperatingSystem) => {
    setExpandedSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const filteredRooms = mockChatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgents = mockAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyAgents = myAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter my agents by selected system
  const filteredMyAgentsBySystem = selectedSystem 
    ? filteredMyAgents.filter(agent => agent.system === selectedSystem)
    : filteredMyAgents;

  const filteredMarketAgents = agentMarketItems.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group my agents by system
  const myAgentsBySystem = OPERATING_SYSTEMS.reduce((acc, system) => {
    acc[system] = filteredMyAgents.filter(agent => agent.system === system);
    return acc;
  }, {} as Record<OperatingSystem, WorkflowItem[]>);

  // Group chat rooms by system
  const chatRoomsBySystem = OPERATING_SYSTEMS.reduce((acc, system) => {
    acc[system] = filteredRooms.filter(room => room.system === system);
    return acc;
  }, {} as Record<OperatingSystem, typeof mockChatRooms>);

  const getStatusColor = (status?: "online" | "offline" | "busy") => {
    switch (status) {
      case "online": return "bg-status-online";
      case "busy": return "bg-status-busy";
      default: return "bg-status-offline";
    }
  };

  const getWorkflowStatusColor = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return "bg-status-online";
      case "draft": return "bg-status-busy";
      case "completed": return "bg-muted-foreground";
    }
  };

  const isDashboard = location.pathname === "/dashboard";

  return (
    <aside className="w-80 h-full bg-sidebar flex flex-col border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gradient">AI Worker</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Dashboard Navigation */}
        <button
          onClick={() => navigate("/dashboard")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-3",
            isDashboard 
              ? "bg-primary/20 text-primary" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">{t("sidebar.dashboard")}</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("sidebar.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex border-b border-border">
        {[
          { view: "agent" as ViewType, icon: Bot, label: t("sidebar.skiAgent") },
          { view: "workflow" as ViewType, icon: Workflow, label: t("sidebar.myAgent") },
          { view: "assistant" as ViewType, icon: MessageSquare, label: t("sidebar.assistant") },
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
              currentView === view && !isDashboard
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content based on view */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {currentView === "agent" && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("sidebar.agentList")}
            </div>
            {filteredAgents.map((agent, index) => {
              const isSelected = selectedAgent === agent.id;
              const totalUnread = agent.chatHistory.reduce((sum, chat) => sum + chat.unread, 0);
              
              return (
                <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <button
                    onClick={() => {
                      onSelectAgent(agent.id);
                      if (location.pathname !== "/") {
                        navigate("/");
                      }
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3",
                      "hover:bg-secondary/80",
                      isSelected && !isDashboard
                        ? "bg-primary/20 border border-primary/30" 
                        : "bg-transparent"
                    )}
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
                    <span className="font-medium text-sm flex-1">{agent.name}</span>
                    {totalUnread > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </>
        )}

        {currentView === "workflow" && (
          <>
            {/* My Agent Section */}
            <div className="px-2 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              {t("sidebar.myAgent")}
            </div>
            
            {/* My Agent List */}
            {filteredMyAgents.map((agent, index) => {
              const isSelected = selectedWorkflowAgent?.id === agent.id;
              
              return (
                <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <button
                    onClick={() => {
                      onSelectWorkflowAgent(agent);
                      if (location.pathname !== "/") {
                        navigate("/");
                      }
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3",
                      "hover:bg-secondary/80",
                      isSelected && !isDashboard
                        ? "bg-primary/30 border border-primary/50 shadow-md" 
                        : "bg-transparent"
                    )}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Workflow className="w-4 h-4 text-accent" />
                      </div>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar",
                        getWorkflowStatusColor(agent.status)
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block truncate">{agent.name}</span>
                      {agent.system && (
                        <span className="text-xs text-muted-foreground">{agent.system}</span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              );
            })}

            {/* Recommended Agent Section (Fixed - from Agent Market) */}
            <div className="px-2 py-1.5 mt-4 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <Store className="w-3 h-3" />
              {t("workflow.agentMarket")}
            </div>
            {filteredMarketAgents.map((agent, index) => (
              <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <button
                  onClick={() => {
                    if (location.pathname !== "/") {
                      navigate("/");
                    }
                  }}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all duration-200",
                    "hover:bg-secondary/80 bg-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Workflow className="w-4 h-4 text-accent" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar bg-status-online" />
                    </div>
                    <span className="font-medium text-sm flex-1 truncate">{agent.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-11">{agent.description}</p>
                </button>
              </div>
            ))}
          </>
        )}

        {currentView === "assistant" && (
          <>
            {/* System Label */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("sidebar.system")}
            </div>
            
            {/* System Selector Dropdown for Assistant */}
            <div className="px-2 mb-2">
              <div className="relative">
                <button
                  onClick={() => setAssistantSystemDropdownOpen(!assistantSystemDropdownOpen)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border flex items-center justify-between hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {assistantSelectedSystem || t("sidebar.allSystems")}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", assistantSystemDropdownOpen && "rotate-180")} />
                </button>
                
                {assistantSystemDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 py-1 bg-popover border border-border rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        setAssistantSelectedSystem(null);
                        setAssistantSystemDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                        !assistantSelectedSystem && "bg-primary/10 text-primary"
                      )}
                    >
                      {t("sidebar.allSystems")}
                    </button>
                    {OPERATING_SYSTEMS.map((system) => (
                      <button
                        key={system}
                        onClick={() => {
                          setAssistantSelectedSystem(system);
                          setAssistantSystemDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                          assistantSelectedSystem === system && "bg-primary/10 text-primary"
                        )}
                      >
                        {system}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat List - Filtered by System */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("sidebar.chatHistory")}
            </div>
            {(assistantSelectedSystem 
              ? filteredRooms.filter(room => room.system === assistantSelectedSystem)
              : filteredRooms
            ).map((room, index) => (
              <div key={room.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <button
                  onClick={() => {
                    onSelectChat(room.id);
                    if (location.pathname !== "/") {
                      navigate("/");
                    }
                  }}
                  className={cn(
                    "w-full p-2.5 rounded-lg text-left transition-all duration-200",
                    "hover:bg-secondary/80",
                    selectedChat === room.id && !isDashboard
                      ? "bg-secondary shadow-card border border-primary/20" 
                      : "bg-transparent"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="relative">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        room.type === "agent" ? "bg-primary/20 text-primary" :
                        room.type === "workflow" ? "bg-accent/20 text-accent" :
                        "bg-secondary text-muted-foreground"
                      )}>
                        {room.type === "agent" ? <Bot className="w-3.5 h-3.5" /> :
                         room.type === "workflow" ? <Workflow className="w-3.5 h-3.5" /> :
                         <Users className="w-3.5 h-3.5" />}
                      </div>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-sidebar",
                        getStatusColor(room.status)
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-xs truncate">{room.name}</span>
                        <span className="text-[10px] text-muted-foreground">{room.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{room.lastMessage}</p>
                    </div>

                    {room.unread > 0 && (
                      <span className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                        {room.unread}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div 
          onClick={() => navigate("/mypage")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t("sidebar.user")}</p>
            <p className="text-xs text-muted-foreground">{t("mypage.userLevel")}</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
