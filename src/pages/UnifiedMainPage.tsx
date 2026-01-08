import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Workflow,
  MessageSquare,
  Search,
  Settings,
  LogIn,
  Crown,
  Send,
  Paperclip,
  Mic,
  Sparkles,
  Ticket,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Database,
  FileText,
  Play,
  AlertCircle,
  Shield,
  Cloud,
  ChevronDown,
  ChevronUp,
  Wrench,
  User,
  Info,
  LayoutGrid,
  X,
  Eye,
  EyeOff,
  GripVertical,
  Monitor,
  BarChart3,
  Zap,
  Filter,
  Plus,
  RefreshCw,
  FolderOpen,
  Store,
  Folder,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import ParticleSphere from "@/components/landing/ParticleSphere";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
type ViewType = "worker" | "myagent" | "assistant";
type RequestType = "I" | "C" | "D" | "A" | "S";
interface TodoItem {  id: string;  text: string;  completed: boolean;  category: string;}type ChatHistoryTab = "worker" | "myagent" | "assistant";

interface LayoutSettings {
  aiWelcome: boolean;
  dailyOverview: boolean;
  myAgent: boolean;
  workerAgent: boolean;
  assignedSystems: boolean;
  chatPanel: boolean;
  chatHistory: boolean;
}

const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  aiWelcome: true,
  dailyOverview: true,
  myAgent: true,
  workerAgent: true,
  assignedSystems: true,
  chatPanel: true,
  chatHistory: true,
};

const LAYOUT_STORAGE_KEY = "unified-layout-settings";
const COMPONENT_ORDER_KEY = "unified-component-order";
const PANEL_WIDTHS_KEY = "unified-panel-widths";

interface PanelWidths {
  leftSidebar: number;
  rightPanel: number;
}

const DEFAULT_PANEL_WIDTHS: PanelWidths = {
  leftSidebar: 280,
  rightPanel: 620,
};

const MIN_LEFT_WIDTH = 240;
const MAX_LEFT_WIDTH = 400;
const MIN_RIGHT_WIDTH = 320;
const MAX_RIGHT_WIDTH = 850;

type SectionId = "aiWelcome" | "dailyOverview" | "myAgent" | "workerAgent" | "assignedSystems";

const DEFAULT_COMPONENT_ORDER: SectionId[] = ["dailyOverview", "aiWelcome", "assignedSystems", "workerAgent", "myAgent"];

// Sortable Section Component
function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative group rounded-lg transition-all", isDragging && "shadow-lg bg-card/50 ring-2 ring-primary/30")}>
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-3 p-1.5 rounded-md opacity-30 group-hover:opacity-100 hover:bg-primary/20 cursor-grab active:cursor-grabbing transition-all z-10"
        title="드래그하여 순서 변경"
      >
        <GripVertical className="w-4 h-4 text-primary" />
      </div>
      <div className="pl-8">
        {children}
      </div>
    </div>
  );
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  type: "user" | "agent" | "workflow";
  status?: "online" | "offline" | "busy";
  system?: string;
}

interface WorkerAgent {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
  unread: number;
  description: string;
}

interface MyAgentItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft";
  registeredCount: number;
}

interface ITSRequest {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
  status: "open" | "in-progress" | "resolved";
  system: string;
}

// Mock Data - Worker Chat History (like Assistant style)
const mockWorkerChatRooms: ChatRoom[] = [
  { id: "w1", name: "ITS Agent", lastMessage: "티켓 처리가 완료되었습니다.", timestamp: "10분 전", unread: 2, type: "agent", status: "online", system: "e-총무" },
  { id: "w2", name: "모니터링 Agent", lastMessage: "시스템 정상 작동 중", timestamp: "1시간 전", unread: 0, type: "agent", status: "online", system: "BiOn" },
  { id: "w3", name: "DB Agent", lastMessage: "쿼리 실행 중입니다.", timestamp: "방금", unread: 1, type: "agent", status: "busy", system: "SATIS" },
  { id: "w4", name: "SOP Agent", lastMessage: "관련 SOP를 찾았습니다.", timestamp: "30분 전", unread: 0, type: "agent", status: "online", system: "e-총무" },
];

const mockMyAgentChatRooms: ChatRoom[] = [
  { id: "m1", name: "시스템 점검 Agent", lastMessage: "일일 점검 완료", timestamp: "30분 전", unread: 0, type: "workflow", status: "online", system: "e-총무" },
  { id: "m2", name: "장애 대응 Agent", lastMessage: "이상 감지됨", timestamp: "1시간 전", unread: 1, type: "workflow", status: "busy", system: "BiOn" },
];

const mockAssistantChatRooms: ChatRoom[] = [
  { id: "a1", name: "AI 어시스턴트", lastMessage: "안녕하세요! 무엇을 도와드릴까요?", timestamp: "방금", unread: 0, type: "agent", status: "online" },
  { id: "a2", name: "데이터 분석 Agent", lastMessage: "보고서 생성 완료", timestamp: "2시간 전", unread: 0, type: "workflow", status: "online", system: "BiOn" },
  { id: "a3", name: "SATIS 모니터링", lastMessage: "시스템 정상 작동 중", timestamp: "1시간 전", unread: 1, type: "agent", status: "online", system: "SATIS" },
];

const mockWorkerAgents: WorkerAgent[] = [
  { id: "a1", name: "ITS Agent", status: "online", unread: 2, description: "IT 서비스 요청 처리" },
  { id: "a2", name: "SOP Agent", status: "online", unread: 0, description: "표준운영절차 관리" },
  { id: "a3", name: "변경관리 Agent", status: "online", unread: 0, description: "시스템 변경 관리" },
  { id: "a4", name: "DB Agent", status: "busy", unread: 1, description: "데이터베이스 작업" },
  { id: "a5", name: "모니터링 Agent", status: "online", unread: 0, description: "시스템 모니터링" },
  { id: "a6", name: "보고서 Agent", status: "offline", unread: 0, description: "리포트 생성" },
  { id: "a7", name: "인프라 Agent", status: "online", unread: 0, description: "인프라 관리" },
  { id: "a8", name: "Biz.Support Agent", status: "online", unread: 1, description: "업무 지원" },
];

const mockMyAgents: MyAgentItem[] = [
  { id: "mat1", name: "시스템 점검 Agent", description: "정기적인 시스템 상태 점검", status: "active", registeredCount: 3 },
  { id: "mat2", name: "장애 대응 Agent", description: "장애 감지 및 자동 대응", status: "active", registeredCount: 2 },
];

// Systems and Instructions for chat panel
const mockSystems = ["전체 시스템", "e-총무시스템", "BiOn", "SATIS", "MCP Gateway"];
const mockInstructions = ["기본 지침", "개발 지침", "운영 지침", "보안 지침", "긴급 대응"];

// Assigned Systems Data
interface AssignedSystem {
  id: string;
  name: string;
  group: string;
  manager: string;
  status: "정상" | "점검" | "장애";
  users: number;
  uptime: string;
  lastUpdate: string;
  tickets: number;
}

const mockAssignedSystems: AssignedSystem[] = [
  { id: "sys1", name: "e-총무시스템", group: "총무팀", manager: "김철수", status: "정상", users: 1250, uptime: "99.9%", lastUpdate: "2024-12-06", tickets: 3 },
  { id: "sys2", name: "BiOn", group: "구매팀", manager: "이영희", status: "정상", users: 890, uptime: "99.7%", lastUpdate: "2024-12-05", tickets: 5 },
  { id: "sys3", name: "SATIS", group: "영업팀", manager: "박민수", status: "점검", users: 2100, uptime: "98.5%", lastUpdate: "2024-12-06", tickets: 8 },
  { id: "sys4", name: "MCP Gateway", group: "IT인프라팀", manager: "정구헌", status: "정상", users: 45, uptime: "100%", lastUpdate: "2024-12-06", tickets: 0 },
  { id: "sys5", name: "HR Portal", group: "인사팀", manager: "최지원", status: "정상", users: 3200, uptime: "99.8%", lastUpdate: "2024-12-04", tickets: 2 },
];

// ITS Mock Data
const mockITSRequests: ITSRequest[] = [
  { id: "r1", requestNo: "ITS-2024-0152", type: "I", title: "서버 응답 지연 현상", date: "2024-12-05", status: "open", system: "e-총무" },
  { id: "r2", requestNo: "ITS-2024-0149", type: "A", title: "신규 입사자 계정 발급", date: "2024-12-04", status: "open", system: "BiOn" },
  { id: "r3", requestNo: "ITS-2024-0153", type: "D", title: "고객별 주문 현황 추출", date: "2024-12-06", status: "open", system: "SATIS" },
  { id: "r4", requestNo: "ITS-2024-0151", type: "C", title: "대시보드 UI 개선 요청", date: "2024-12-05", status: "in-progress", system: "e-총무" },
  { id: "r5", requestNo: "ITS-2024-0150", type: "D", title: "월간 매출 데이터 추출", date: "2024-12-04", status: "in-progress", system: "BiOn" },
];

const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-3.5 h-3.5" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-3.5 h-3.5" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-3.5 h-3.5" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-3.5 h-3.5" />, label: "단순", color: "text-muted-foreground" },
};

export default function UnifiedMainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("worker");
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedWorkerAgent, setSelectedWorkerAgent] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>("전체 시스템");
  const [selectedInstruction, setSelectedInstruction] = useState<string>("기본 지침");
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);
  const [showInstructionDropdown, setShowInstructionDropdown] = useState(false);
  const [chatHistorySystemFilter, setChatHistorySystemFilter] = useState<string>("전체");
  const [showChatHistoryFilterDropdown, setShowChatHistoryFilterDropdown] = useState(false);
const [todoItems, setTodoItems] = useState<TodoItem[]>([    { id: "1", text: "ITS-0152 서버 점검", completed: false, category: "업무" },    { id: "2", text: "주간 보고서 작성", completed: true, category: "업무" },    { id: "3", text: "DB 백업 확인", completed: false, category: "시스템" },    { id: "4", text: "신규 계정 발급", completed: false, category: "요청" },  ]);  const [showTodoModal, setShowTodoModal] = useState(false);  const [newTodoText, setNewTodoText] = useState("");  const [newTodoCategory, setNewTodoCategory] = useState("업무");  const [selectedTodoCategory, setSelectedTodoCategory] = useState("전체");  const [connectionTime] = useState(new Date());  const [chatHistoryTab, setChatHistoryTab] = useState<ChatHistoryTab>("worker");
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [componentOrder, setComponentOrder] = useState<SectionId[]>(DEFAULT_COMPONENT_ORDER);
  const [panelWidths, setPanelWidths] = useState<PanelWidths>(DEFAULT_PANEL_WIDTHS);
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Panel resize handlers
  const handleMouseDown = useCallback((panel: "left" | "right") => {
    setIsResizing(panel);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    if (isResizing === "left") {
      const newWidth = e.clientX - containerRect.left;
      const clampedWidth = Math.min(Math.max(newWidth, MIN_LEFT_WIDTH), MAX_LEFT_WIDTH);
      setPanelWidths(prev => ({ ...prev, leftSidebar: clampedWidth }));
    } else if (isResizing === "right") {
      const newWidth = containerRect.right - e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, MIN_RIGHT_WIDTH), MAX_RIGHT_WIDTH);
      setPanelWidths(prev => ({ ...prev, rightPanel: clampedWidth }));
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      localStorage.setItem(PANEL_WIDTHS_KEY, JSON.stringify(panelWidths));
      setIsResizing(null);
    }
  }, [isResizing, panelWidths]);

  // Add mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load layout settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      try {
        setLayoutSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse layout settings:", e);
      }
    }

    const savedOrder = localStorage.getItem(COMPONENT_ORDER_KEY);
    if (savedOrder) {
      try {
        setComponentOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to parse component order:", e);
      }
    }

    const savedWidths = localStorage.getItem(PANEL_WIDTHS_KEY);
    if (savedWidths) {
      try {
        setPanelWidths(JSON.parse(savedWidths));
      } catch (e) {
        console.error("Failed to parse panel widths:", e);
      }
    }
  }, []);

  // Save layout settings to localStorage
  const updateLayoutSettings = (key: keyof LayoutSettings, value: boolean) => {
    const newSettings = { ...layoutSettings, [key]: value };
    setLayoutSettings(newSettings);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newSettings));
  };

  const resetLayoutSettings = () => {
    setLayoutSettings(DEFAULT_LAYOUT_SETTINGS);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUT_SETTINGS));
    setComponentOrder(DEFAULT_COMPONENT_ORDER);
    localStorage.setItem(COMPONENT_ORDER_KEY, JSON.stringify(DEFAULT_COMPONENT_ORDER));
    setPanelWidths(DEFAULT_PANEL_WIDTHS);
    localStorage.setItem(PANEL_WIDTHS_KEY, JSON.stringify(DEFAULT_PANEL_WIDTHS));
  };

  // Handle drag end for component reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setComponentOrder((items) => {
        const oldIndex = items.indexOf(active.id as SectionId);
        const newIndex = items.indexOf(over.id as SectionId);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(COMPONENT_ORDER_KEY, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const getStatusColor = (status?: "online" | "offline" | "busy") => {
    switch (status) {
      case "online": return "bg-status-online";
      case "busy": return "bg-status-busy";
      default: return "bg-status-offline";
    }
  };

  const getCurrentChatRooms = () => {
    switch (currentView) {
      case "worker": return mockWorkerChatRooms;
      case "myagent": return mockMyAgentChatRooms;
      case "assistant": return mockAssistantChatRooms;
    }
  };

  const chatHistoryFilterSystems = ["전체", "e-총무", "BiOn", "SATIS", "MCP Gateway"];

  const filteredRooms = getCurrentChatRooms().filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = chatHistorySystemFilter === "전체" || room.system === chatHistorySystemFilter;
    return matchesSearch && matchesSystem;
  });

  const handleSend = () => {
    if (message.trim()) {
      console.log("Send message:", message);
      setMessage("");
    }
  };

  // Daily Overview
  const dailyOverviewCards = [
    { title: "미처리 요청", value: "12", change: "+3", icon: <Ticket className="w-5 h-5" />, color: "text-destructive", bgColor: "bg-destructive/10" },
    { title: "처리 완료", value: "28", change: "+8", icon: <CheckCircle className="w-5 h-5" />, color: "text-status-online", bgColor: "bg-status-online/10" },
    { title: "시스템 상태", value: "정상", change: "", icon: <Activity className="w-5 h-5" />, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "활성 Agent", value: "6/8", change: "", icon: <Users className="w-5 h-5" />, color: "text-accent", bgColor: "bg-accent/10" },
  ];

  const openRequests = mockITSRequests.filter(r => r.status === "open");
  const inProgressRequests = mockITSRequests.filter(r => r.status === "in-progress");

  const selectedAgentInfo = mockWorkerAgents.find(a => a.id === selectedWorkerAgent);

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <aside
        style={{ width: panelWidths.leftSidebar }}
        className="h-full bg-sidebar flex flex-col border-r border-border shrink-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gradient">AI Worker</h1>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => navigate("/login")}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <LogIn className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-border">
          {[
            { view: "worker" as ViewType, icon: Bot, label: "Worker" },
            { view: "myagent" as ViewType, icon: Workflow, label: "My Agent" },
            { view: "assistant" as ViewType, icon: MessageSquare, label: "Assistant" },
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2",
                currentView === view
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Chat History - Grouped by Worker/Agent */}
        <ScrollArea className="flex-1 p-2">
          {layoutSettings.chatHistory ? (
            <>
              {/* System filter for Assistant view */}
              {currentView === "assistant" && (
                <div className="px-2 py-1 mb-2">
                  <select
                    value={chatHistorySystemFilter}
                    onChange={(e) => setChatHistorySystemFilter(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-secondary border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {chatHistoryFilterSystems.map((sys) => (
                      <option key={sys} value={sys}>{sys}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Grouped Chat History */}
              <div className="space-y-3">
                {/* Worker View - Grouped by Worker Agent */}
                {currentView === "worker" && mockWorkerAgents.map((agent) => (
                  <div key={agent.id} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted/50 rounded" onClick={() => setSelectedWorkerAgent(agent.id)}>
                      <Bot className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">{agent.name}</span>
                      {agent.unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">{agent.unread}</span>
                      )}
                    </div>
                    <div className="pl-5 space-y-0.5">
                      {[`${agent.name} 문의`, `${agent.name} 작업`].map((chatName, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedWorkerAgent(agent.id)}
                          className="w-full px-2 py-1.5 rounded text-left text-[10px] text-muted-foreground hover:bg-secondary/50 truncate"
                        >
                          {chatName}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* My Agent View - Grouped by My Agent */}
                {currentView === "myagent" && mockMyAgents.map((agent) => (
                  <div key={agent.id} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted/50 rounded" onClick={() => setSelectedAgent(agent.id)}>
                      <Workflow className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">{agent.name}</span>
                    </div>
                    <div className="pl-5 space-y-0.5">
                      {[`${agent.name} 대화 1`, `${agent.name} 대화 2`].map((chatName, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedAgent(agent.id)}
                          className="w-full px-2 py-1.5 rounded text-left text-[10px] text-muted-foreground hover:bg-secondary/50 truncate"
                        >
                          {chatName}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Assistant View - Filtered by System */}
                {currentView === "assistant" && filteredRooms.map((room, index) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedChat(room.id)}
                    className={cn(
                      "w-full p-2 rounded-lg text-left transition-all",
                      "hover:bg-secondary/80",
                      selectedChat === room.id
                        ? "bg-secondary border border-primary/20"
                        : "bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center shrink-0",
                        room.type === "agent" ? "bg-primary/20 text-primary" :
                        room.type === "workflow" ? "bg-accent/20 text-accent" :
                        "bg-secondary text-muted-foreground"
                      )}>
                        {room.type === "agent" ? <Bot className="w-3 h-3" /> :
                         room.type === "workflow" ? <Workflow className="w-3 h-3" /> :
                         <Users className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-xs truncate block">{room.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate block">{room.lastMessage}</span>
                      </div>
                      {room.unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">{room.unread}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              채팅 이력 숨김
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={() => {
              setSelectedAgent(null);
              setSelectedWorkerId(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">새 채팅</span>
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">관리자 페이지</span>
          </button>
          <div
            onClick={() => navigate("/mypage")}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
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

      {/* Left Resize Handle */}
      <div
        onMouseDown={() => handleMouseDown("left")}
        className={cn(
          "w-1.5 h-full bg-transparent hover:bg-primary/50 cursor-col-resize transition-colors shrink-0 group relative",
          isResizing === "left" && "bg-primary/50"
        )}
      >
        <div className={cn(
          "absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-border group-hover:bg-primary transition-colors",
          isResizing === "left" && "bg-primary"
        )} />
      </div>

      {/* Center Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ScrollArea className="flex-1 p-6">
          {/* Greeting with Layout Settings */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">안녕하세요, 홍길동님 👋</h1>
              <p className="text-muted-foreground">오늘도 좋은 하루 되세요!</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                접속: {connectionTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowLayoutModal(true)}
                className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">레이아웃</span>
              </button>
            </div>
          </div>

          {/* Draggable Sections */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={componentOrder} strategy={verticalListSortingStrategy}>
              {componentOrder.map((sectionId) => {
                {/* AI Welcome Component */}
                if (sectionId === "aiWelcome" && layoutSettings.aiWelcome) {
                  // Calculate current situation summary
                  const totalPending = openRequests.length;
                  const totalInProgress = inProgressRequests.length;

                  return (
                    <SortableSection key={sectionId} id={sectionId}>
                      <section className="mb-6">
                        <div className="p-4 rounded-xl border border-border/50 bg-card/30">
                          <div className="grid grid-cols-5 gap-4" style={{ minHeight: '220px' }}>
                            {/* Col 1-2: AI Assistant with ParticleSphere Animation (2열 차지) */}
                            <div className="col-span-2 flex flex-col">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Bot className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-2">지능형 운영 어시스턴트</p>
                              <Suspense
                                fallback={
                                  <div className="flex-1 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                  </div>
                                }
                              >
                                <div className="flex-1 relative">
                                  <ParticleSphere />
                                  {/* SK Logo Overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <span className="text-white/50 text-xs font-semibold tracking-wider" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.4)' }}>SK</span>
                                  </div>
                                </div>
                              </Suspense>
                            </div>

                            {/* Col 3: 현재 상황 요약 + 도움말 (합쳐짐) */}
                            <div className="bg-background/50 rounded-lg p-3 flex flex-col">
                              <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-2">
                                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                                현재 상황
                              </h4>
                              <div className="space-y-1.5 mb-3">
                                <div className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                                  <span className="text-[10px] text-muted-foreground">대기 중</span>
                                  <span className="text-xs text-destructive font-bold">{totalPending}건</span>
                                </div>
                                <div className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                                  <span className="text-[10px] text-muted-foreground">처리 중</span>
                                  <span className="text-xs text-amber-500 font-bold">{totalInProgress}건</span>
                                </div>
                              </div>
                              <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-2">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                                도움말
                              </h4>
                              <div className="flex-1 flex flex-col space-y-1 text-[10px]">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MessageSquare className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                  "ITS 요청 처리해줘"
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <AlertTriangle className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                                  "장애 분석해줘"
                                </div>
                              </div>
                            </div>

                            {/* Col 4-5: 오늘 할 일 (2열 차지) - 유형별 섹션 리스트 */}
                            <div className="col-span-2 bg-background/50 rounded-lg p-3 flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                  오늘 할 일
                                </h4>
                                <button
                                  onClick={() => setShowTodoModal(true)}
                                  className="p-1 rounded bg-primary/20 hover:bg-primary/30 text-primary"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-2 text-[11px]">
                                {/* 업무 섹션 */}
                                {todoItems.filter(item => item.category === "업무").length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Folder className="w-2.5 h-2.5 text-blue-400" />
                                      <span className="text-[9px] font-semibold text-blue-400 uppercase">업무</span>
                                    </div>
                                    {todoItems.filter(item => item.category === "업무").map(item => (
                                      <div key={item.id} className="flex items-center gap-2 py-1 pl-3">
                                        <input
                                          type="checkbox"
                                          checked={item.completed}
                                          onChange={() => setTodoItems(prev =>
                                            prev.map(t => t.id === item.id ? { ...t, completed: !t.completed } : t)
                                          )}
                                          className="w-3 h-3 rounded border-border"
                                        />
                                        <span className={cn("text-muted-foreground flex-1", item.completed && "line-through")}>
                                          {item.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* 시스템 섹션 */}
                                {todoItems.filter(item => item.category === "시스템").length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Folder className="w-2.5 h-2.5 text-green-400" />
                                      <span className="text-[9px] font-semibold text-green-400 uppercase">시스템</span>
                                    </div>
                                    {todoItems.filter(item => item.category === "시스템").map(item => (
                                      <div key={item.id} className="flex items-center gap-2 py-1 pl-3">
                                        <input
                                          type="checkbox"
                                          checked={item.completed}
                                          onChange={() => setTodoItems(prev =>
                                            prev.map(t => t.id === item.id ? { ...t, completed: !t.completed } : t)
                                          )}
                                          className="w-3 h-3 rounded border-border"
                                        />
                                        <span className={cn("text-muted-foreground flex-1", item.completed && "line-through")}>
                                          {item.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* 요청 섹션 */}
                                {todoItems.filter(item => item.category === "요청").length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Folder className="w-2.5 h-2.5 text-orange-400" />
                                      <span className="text-[9px] font-semibold text-orange-400 uppercase">요청</span>
                                    </div>
                                    {todoItems.filter(item => item.category === "요청").map(item => (
                                      <div key={item.id} className="flex items-center gap-2 py-1 pl-3">
                                        <input
                                          type="checkbox"
                                          checked={item.completed}
                                          onChange={() => setTodoItems(prev =>
                                            prev.map(t => t.id === item.id ? { ...t, completed: !t.completed } : t)
                                          )}
                                          className="w-3 h-3 rounded border-border"
                                        />
                                        <span className={cn("text-muted-foreground flex-1", item.completed && "line-through")}>
                                          {item.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </SortableSection>
                  );
                }

                if (sectionId === "dailyOverview" && layoutSettings.dailyOverview) {
                  return (
                    <SortableSection key={sectionId} id={sectionId}>
                      <section className="mb-6">
                        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Daily Overview
                        </h2>
                        <div className="grid grid-cols-4 gap-3">
                          {dailyOverviewCards.map((card, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-border/50 bg-card/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className={cn("p-2 rounded-lg", card.bgColor)}>
                                  <span className={card.color}>{card.icon}</span>
                                </div>
                                {card.change && (
                                  <span className="text-xs text-status-online font-medium">{card.change}</span>
                                )}
                              </div>
                              <p className="text-xl font-bold">{card.value}</p>
                              <p className="text-xs text-muted-foreground">{card.title}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </SortableSection>
                  );
                }

                if (sectionId === "assignedSystems" && layoutSettings.assignedSystems) {
                  return (
                    <SortableSection key={sectionId} id={sectionId}>
                      <section className="mb-6">
                        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-cyan-500" />
                          담당 시스템
                          <span className="text-xs font-normal text-muted-foreground">({mockAssignedSystems.length})</span>
                        </h2>
                        <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
                          {/* Table Header */}
                          <div className="grid grid-cols-8 gap-2 px-3 py-2 bg-muted/30 border-b border-border/50 text-[10px] font-semibold text-muted-foreground">
                            <div>시스템명</div>
                            <div>담당그룹</div>
                            <div>담당자</div>
                            <div className="text-center">상태</div>
                            <div className="text-right">사용자</div>
                            <div className="text-right">가용률</div>
                            <div className="text-center">최종수정</div>
                            <div className="text-center">티켓</div>
                          </div>
                          {/* Table Body */}
                          <div className="divide-y divide-border/30">
                            {mockAssignedSystems.map((sys) => (
                              <div
                                key={sys.id}
                                className="grid grid-cols-8 gap-2 px-3 py-2.5 text-xs hover:bg-muted/20 cursor-pointer transition-colors items-center"
                              >
                                <div className="font-medium flex items-center gap-1.5">
                                  <Database className="w-3.5 h-3.5 text-primary" />
                                  <span className="truncate">{sys.name}</span>
                                </div>
                                <div className="text-muted-foreground truncate">{sys.group}</div>
                                <div className="truncate">{sys.manager}</div>
                                <div className="text-center">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[10px]",
                                    sys.status === "정상" ? "bg-status-online/20 text-status-online" :
                                    sys.status === "점검" ? "bg-amber-500/20 text-amber-500" :
                                    "bg-destructive/20 text-destructive"
                                  )}>
                                    {sys.status}
                                  </span>
                                </div>
                                <div className="text-right text-muted-foreground">{sys.users.toLocaleString()}</div>
                                <div className="text-right">
                                  <span className={cn(
                                    parseFloat(sys.uptime) >= 99.5 ? "text-status-online" :
                                    parseFloat(sys.uptime) >= 98 ? "text-amber-500" : "text-destructive"
                                  )}>
                                    {sys.uptime}
                                  </span>
                                </div>
                                <div className="text-center text-muted-foreground">{sys.lastUpdate}</div>
                                <div className="text-center">
                                  {sys.tickets > 0 ? (
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-medium">
                                      {sys.tickets}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    </SortableSection>
                  );
                }

                if (sectionId === "myAgent" && layoutSettings.myAgent) {
                  return (
                    <SortableSection key={sectionId} id={sectionId}>
                      <section className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-base font-semibold flex items-center gap-2">
                            <Workflow className="w-4 h-4 text-accent" />
                            My Agent
                            <span className="text-xs font-normal text-muted-foreground">({mockMyAgents.length})</span>
                          </h2>
                          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-xs transition-colors">
                            <Store className="w-3 h-3" />
                            Market
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {mockMyAgents.map((agent) => (
                            <div
                              key={agent.id}
                              className="p-3 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-md bg-accent/20 flex items-center justify-center">
                                  <Workflow className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium truncate">{agent.name}</h3>
                                </div>
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full",
                                  agent.status === "active" ? "bg-status-online/20 text-status-online" : "bg-muted text-muted-foreground"
                                )}>
                                  {agent.status === "active" ? "활성" : "초안"}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">{agent.description}</p>
                            </div>
                          ))}
                          <button className="p-3 rounded-lg border border-dashed border-border/50 bg-card/30 hover:border-primary/50 hover:bg-card/50 cursor-pointer transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                            <span className="text-lg">+</span>
                            <span className="text-xs">Agent 추가</span>
                          </button>
                        </div>
                      </section>
                    </SortableSection>
                  );
                }

                if (sectionId === "workerAgent" && layoutSettings.workerAgent) {
                  return (
                    <SortableSection key={sectionId} id={sectionId}>
                      <section className="mb-6">
                        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          Worker Agent
                          <span className="text-xs font-normal text-muted-foreground">({mockWorkerAgents.length})</span>
                        </h2>
                        <div className="grid grid-cols-4 gap-2">
                          {mockWorkerAgents.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => setSelectedWorkerAgent(selectedWorkerAgent === agent.id ? null : agent.id)}
                              className={cn(
                                "p-2.5 rounded-lg border text-left transition-all",
                                selectedWorkerAgent === agent.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border/50 bg-card/50 hover:border-primary/50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
                                    <Bot className="w-3.5 h-3.5 text-primary" />
                                  </div>
                                  <span className={cn(
                                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card",
                                    getStatusColor(agent.status)
                                  )} />
                                </div>
                                <span className="text-xs font-medium truncate flex-1">{agent.name}</span>
                                {agent.unread > 0 && (
                                  <span className="px-1 py-0.5 text-[9px] rounded-full bg-primary text-primary-foreground">
                                    {agent.unread}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Worker Agent Dashboard Panel - Attached to Worker Agent section */}
                        {selectedWorkerAgent && (
                          <div className="mt-4 rounded-xl border border-border bg-card p-5 animate-fade-in">
                            {/* ITS Agent Dashboard */}
                            {selectedWorkerAgent === "a1" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                      <Bot className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">ITS Agent</h3>
                                      <p className="text-xs text-muted-foreground">Agent ID: a1</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Info className="w-3 h-3" /> 정보
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                {/* 담당시스템 */}
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-xs text-muted-foreground">담당시스템</span>
                                  <div className="flex gap-1">
                                    {["전체", "e-총무시스템", "BiOn", "SATIS"].map((sys, idx) => (
                                      <button
                                        key={sys}
                                        className={cn(
                                          "px-2 py-1 rounded text-xs transition-colors",
                                          idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                        )}
                                      >
                                        {sys}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* ITS 접수현황 */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                      <Ticket className="w-4 h-4 text-primary" />
                                      ITS 접수현황
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px]">
                                      {Object.entries(requestTypeConfig).map(([type, config]) => (
                                        <div key={type} className="flex items-center gap-1">
                                          <span className={config.color}>{config.icon}</span>
                                          <span className="text-muted-foreground">{config.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* 미접수 */}
                                    <div className="rounded-lg overflow-hidden border border-destructive/30">
                                      <div className="px-3 py-1.5 bg-destructive/20 flex items-center justify-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                                        <span className="text-xs font-medium">미접수</span>
                                      </div>
                                      <div className="p-2 bg-background flex items-center justify-center border-b border-border/50">
                                        <p className="text-xl font-bold">{openRequests.length}</p>
                                      </div>
                                      <div className="p-1.5 bg-background/50 space-y-1 max-h-[140px] overflow-y-auto">
                                        {openRequests.map(request => {
                                          const config = requestTypeConfig[request.type];
                                          return (
                                            <div key={request.id} className="flex items-center gap-1.5 p-1.5 rounded bg-background/50 hover:bg-background/80 transition-colors text-xs">
                                              <span className={config.color}>{config.icon}</span>
                                              <div className="flex-1 min-w-0">
                                                <p className="truncate">{request.title}</p>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[10px] text-primary/80 font-mono">{request.requestNo}</span>
                                                  <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground">{request.system}</span>
                                                </div>
                                              </div>
                                              <span className="text-[10px] text-muted-foreground">{request.date}</span>
                                              <button className="p-1 rounded bg-primary/10 hover:bg-primary/20 text-primary">
                                                <Play className="w-3 h-3" />
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* 접수/처리중 */}
                                    <div className="rounded-lg overflow-hidden border border-status-busy/30">
                                      <div className="px-3 py-1.5 bg-status-busy/20 flex items-center justify-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-status-busy" />
                                        <span className="text-xs font-medium">접수/처리중</span>
                                      </div>
                                      <div className="p-2 bg-background flex items-center justify-center border-b border-border/50">
                                        <p className="text-xl font-bold">{inProgressRequests.length}</p>
                                      </div>
                                      <div className="p-1.5 bg-background/50 space-y-1 max-h-[140px] overflow-y-auto">
                                        {inProgressRequests.map(request => {
                                          const config = requestTypeConfig[request.type];
                                          return (
                                            <div key={request.id} className="flex items-center gap-1.5 p-1.5 rounded bg-background/50 hover:bg-background/80 transition-colors text-xs cursor-pointer">
                                              <span className={config.color}>{config.icon}</span>
                                              <div className="flex-1 min-w-0">
                                                <p className="truncate">{request.title}</p>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[10px] text-primary/80 font-mono">{request.requestNo}</span>
                                                  <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground">{request.system}</span>
                                                </div>
                                              </div>
                                              <span className="text-[10px] text-muted-foreground">{request.date}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 완료 - Collapsible */}
                                  <div className="mt-2 rounded-lg overflow-hidden border border-status-online/30">
                                    <button
                                      onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                                      className="w-full px-3 py-1.5 bg-status-online/20 flex items-center justify-between hover:bg-status-online/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-status-online" />
                                        <span className="text-xs font-medium">완료</span>
                                        <span className="text-xs text-muted-foreground">1</span>
                                      </div>
                                      {isCompletedCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                {/* ITS로 요청하기 */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-primary" />
                                    ITS로 요청하기
                                  </h4>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[
                                      { title: "업무량 등록하기", icon: <FileText className="w-4 h-4" />, color: "bg-amber-100 dark:bg-amber-900/30" },
                                      { title: "방화벽 신청하기", icon: <Shield className="w-4 h-4" />, color: "bg-orange-100 dark:bg-orange-900/30" },
                                      { title: "DB Safer 신청하기", icon: <Database className="w-4 h-4" />, color: "bg-emerald-100 dark:bg-emerald-900/30" },
                                      { title: "Cloud 신청하기", icon: <Cloud className="w-4 h-4" />, color: "bg-blue-100 dark:bg-blue-900/30" },
                                    ].map((item, idx) => (
                                      <button key={idx} className={cn("p-3 rounded-lg text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity", item.color)}>
                                        {item.icon}
                                        {item.title}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* SOP Agent Dashboard */}
                            {selectedWorkerAgent === "a2" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">SOP Agent</h3>
                                      <p className="text-xs text-muted-foreground">표준운영절차 관리</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Info className="w-3 h-3" /> 정보
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-2xl font-bold text-emerald-500">156</p>
                                    <p className="text-xs text-muted-foreground">등록된 SOP</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-2xl font-bold text-amber-500">12</p>
                                    <p className="text-xs text-muted-foreground">검토 대기</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <p className="text-2xl font-bold text-blue-500">28</p>
                                    <p className="text-xs text-muted-foreground">이번달 조회</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">최근 SOP 문서</h4>
                                  <div className="space-y-2">
                                    {["서버 장애 대응 절차", "DB 백업 및 복구 가이드", "보안 사고 대응 매뉴얼", "신규 시스템 배포 절차"].map((doc, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                                        <FileText className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm flex-1">{doc}</span>
                                        <span className="text-xs text-muted-foreground">v{(Math.random() * 2 + 1).toFixed(1)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Search className="w-4 h-4" /> SOP 검색
                                  </button>
                                  <button className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <FileText className="w-4 h-4" /> 새 SOP 작성
                                  </button>
                                </div>
                              </>
                            )}

                            {/* 변경관리 Agent Dashboard */}
                            {selectedWorkerAgent === "a3" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                      <Wrench className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">변경관리 Agent</h3>
                                      <p className="text-xs text-muted-foreground">시스템 변경 관리</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Info className="w-3 h-3" /> 정보
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                  <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
                                    <p className="text-xl font-bold text-destructive">3</p>
                                    <p className="text-[10px] text-muted-foreground">승인 대기</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                                    <p className="text-xl font-bold text-amber-500">5</p>
                                    <p className="text-[10px] text-muted-foreground">진행 중</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                                    <p className="text-xl font-bold text-blue-500">2</p>
                                    <p className="text-[10px] text-muted-foreground">예정됨</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-status-online/10 border border-status-online/30 text-center">
                                    <p className="text-xl font-bold text-status-online">18</p>
                                    <p className="text-[10px] text-muted-foreground">완료</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">진행 중인 변경</h4>
                                  <div className="space-y-2">
                                    {[
                                      { title: "DB 스키마 변경", system: "BiOn", status: "진행중", priority: "높음" },
                                      { title: "API 버전 업그레이드", system: "SATIS", status: "테스트", priority: "중간" },
                                      { title: "보안 패치 적용", system: "e-총무", status: "승인대기", priority: "긴급" },
                                    ].map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                                        <Wrench className="w-4 h-4 text-amber-500" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm truncate">{item.title}</p>
                                          <div className="flex items-center gap-1">
                                            <span className="text-[10px] px-1 rounded bg-muted text-muted-foreground">{item.system}</span>
                                            <span className={cn("text-[10px] px-1 rounded", item.priority === "긴급" ? "bg-destructive/20 text-destructive" : item.priority === "높음" ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500")}>{item.priority}</span>
                                          </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{item.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Wrench className="w-4 h-4" /> 변경 요청
                                  </button>
                                  <button className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Clock className="w-4 h-4" /> 변경 이력
                                  </button>
                                </div>
                              </>
                            )}

                            {/* DB Agent Dashboard */}
                            {selectedWorkerAgent === "a4" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                      <Database className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">DB Agent</h3>
                                      <p className="text-xs text-muted-foreground">데이터베이스 작업</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-status-busy/20 text-status-busy">작업 중</span>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                    <p className="text-2xl font-bold text-purple-500">3</p>
                                    <p className="text-xs text-muted-foreground">연결된 DB</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/30">
                                    <p className="text-2xl font-bold text-status-online">98%</p>
                                    <p className="text-xs text-muted-foreground">가용성</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-2xl font-bold text-amber-500">5</p>
                                    <p className="text-xs text-muted-foreground">대기 작업</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">데이터베이스 상태</h4>
                                  <div className="space-y-2">
                                    {[
                                      { name: "MySQL (e-총무)", status: "정상", cpu: "23%", memory: "4.2GB" },
                                      { name: "SQL Server (BiOn)", status: "정상", cpu: "45%", memory: "8.1GB" },
                                      { name: "Oracle XE (SATIS)", status: "주의", cpu: "78%", memory: "12.3GB" },
                                    ].map((db, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <Database className="w-4 h-4 text-purple-500" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm">{db.name}</p>
                                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span>CPU: {db.cpu}</span>
                                            <span>MEM: {db.memory}</span>
                                          </div>
                                        </div>
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full", db.status === "정상" ? "bg-status-online/20 text-status-online" : "bg-amber-500/20 text-amber-500")}>{db.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <button className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Database className="w-4 h-4" /> 쿼리 실행
                                  </button>
                                  <button className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <FileText className="w-4 h-4" /> 데이터 추출
                                  </button>
                                  <button className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Shield className="w-4 h-4" /> 백업
                                  </button>
                                </div>
                              </>
                            )}

                            {/* 모니터링 Agent Dashboard */}
                            {selectedWorkerAgent === "a5" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                      <Activity className="w-5 h-5 text-cyan-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">모니터링 Agent</h3>
                                      <p className="text-xs text-muted-foreground">시스템 모니터링</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-status-online/20 text-status-online flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-status-online animate-pulse"></span> 실시간
                                    </span>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                  <div className="p-2 rounded-lg bg-status-online/10 border border-status-online/30 text-center">
                                    <p className="text-xl font-bold text-status-online">12</p>
                                    <p className="text-[10px] text-muted-foreground">정상</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                                    <p className="text-xl font-bold text-amber-500">2</p>
                                    <p className="text-[10px] text-muted-foreground">경고</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
                                    <p className="text-xl font-bold text-destructive">0</p>
                                    <p className="text-[10px] text-muted-foreground">위험</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-muted border border-border text-center">
                                    <p className="text-xl font-bold text-muted-foreground">1</p>
                                    <p className="text-[10px] text-muted-foreground">오프라인</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">시스템 현황</h4>
                                  <div className="space-y-2">
                                    {[
                                      { name: "e-총무시스템", status: "정상", uptime: "99.9%", response: "45ms" },
                                      { name: "BiOn", status: "경고", uptime: "98.5%", response: "320ms" },
                                      { name: "SATIS", status: "정상", uptime: "99.7%", response: "89ms" },
                                      { name: "MCP Gateway", status: "정상", uptime: "100%", response: "12ms" },
                                    ].map((sys, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <span className={cn("w-2 h-2 rounded-full", sys.status === "정상" ? "bg-status-online" : sys.status === "경고" ? "bg-amber-500" : "bg-destructive")}></span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm">{sys.name}</p>
                                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span>가용: {sys.uptime}</span>
                                            <span>응답: {sys.response}</span>
                                          </div>
                                        </div>
                                        <Activity className={cn("w-4 h-4", sys.status === "정상" ? "text-status-online" : "text-amber-500")} />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Activity className="w-4 h-4" /> 대시보드
                                  </button>
                                  <button className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <AlertTriangle className="w-4 h-4" /> 알림 설정
                                  </button>
                                </div>
                              </>
                            )}

                            {/* 보고서 Agent Dashboard */}
                            {selectedWorkerAgent === "a6" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">보고서 Agent</h3>
                                      <p className="text-xs text-muted-foreground">리포트 생성</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">오프라인</span>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                                    <p className="text-2xl font-bold text-indigo-500">24</p>
                                    <p className="text-xs text-muted-foreground">생성된 보고서</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-2xl font-bold text-amber-500">3</p>
                                    <p className="text-xs text-muted-foreground">예약됨</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/30">
                                    <p className="text-2xl font-bold text-status-online">5</p>
                                    <p className="text-xs text-muted-foreground">자동화</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">최근 보고서</h4>
                                  <div className="space-y-2">
                                    {[
                                      { name: "월간 시스템 현황 리포트", date: "2024-12-01", type: "자동" },
                                      { name: "ITS 처리 현황 분석", date: "2024-12-03", type: "수동" },
                                      { name: "주간 장애 요약", date: "2024-12-06", type: "자동" },
                                    ].map((report, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm truncate">{report.name}</p>
                                          <span className="text-[10px] text-muted-foreground">{report.date}</span>
                                        </div>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", report.type === "자동" ? "bg-status-online/20 text-status-online" : "bg-blue-500/20 text-blue-500")}>{report.type}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <FileText className="w-4 h-4" /> 보고서 생성
                                  </button>
                                  <button className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Clock className="w-4 h-4" /> 예약 설정
                                  </button>
                                </div>
                              </>
                            )}

                            {/* 인프라 Agent Dashboard */}
                            {selectedWorkerAgent === "a7" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                      <Cloud className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">인프라 Agent</h3>
                                      <p className="text-xs text-muted-foreground">인프라 관리</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Info className="w-3 h-3" /> 정보
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                                    <p className="text-xl font-bold text-orange-500">8</p>
                                    <p className="text-[10px] text-muted-foreground">서버</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                                    <p className="text-xl font-bold text-blue-500">3</p>
                                    <p className="text-[10px] text-muted-foreground">클러스터</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
                                    <p className="text-xl font-bold text-purple-500">12</p>
                                    <p className="text-[10px] text-muted-foreground">컨테이너</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-status-online/10 border border-status-online/30 text-center">
                                    <p className="text-xl font-bold text-status-online">99%</p>
                                    <p className="text-[10px] text-muted-foreground">가용성</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">리소스 현황</h4>
                                  <div className="space-y-2">
                                    {[
                                      { name: "AKS Cluster", type: "Kubernetes", status: "정상", nodes: "3/3" },
                                      { name: "Azure VM (minimal-vm)", type: "Virtual Machine", status: "정상", nodes: "1/1" },
                                      { name: "Container Registry", type: "ACR", status: "정상", nodes: "-" },
                                    ].map((infra, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <Cloud className="w-4 h-4 text-orange-500" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm">{infra.name}</p>
                                          <span className="text-[10px] text-muted-foreground">{infra.type}</span>
                                        </div>
                                        {infra.nodes !== "-" && <span className="text-xs text-muted-foreground">{infra.nodes}</span>}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-status-online/20 text-status-online">{infra.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <button className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Cloud className="w-4 h-4" /> 배포
                                  </button>
                                  <button className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Activity className="w-4 h-4" /> 스케일링
                                  </button>
                                  <button className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Shield className="w-4 h-4" /> 보안
                                  </button>
                                </div>
                              </>
                            )}

                            {/* Biz.Support Agent Dashboard */}
                            {selectedWorkerAgent === "a8" && (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                      <Users className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">Biz.Support Agent</h3>
                                      <p className="text-xs text-muted-foreground">업무 지원</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-destructive/20 text-destructive">1 알림</span>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> 설정
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                                    <p className="text-2xl font-bold text-pink-500">15</p>
                                    <p className="text-xs text-muted-foreground">지원 요청</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/30">
                                    <p className="text-2xl font-bold text-status-online">42</p>
                                    <p className="text-xs text-muted-foreground">완료</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-2xl font-bold text-amber-500">4.8</p>
                                    <p className="text-xs text-muted-foreground">만족도</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-2">최근 지원 요청</h4>
                                  <div className="space-y-2">
                                    {[
                                      { title: "Excel 데이터 변환 요청", requester: "김영희", status: "진행중", priority: "보통" },
                                      { title: "회의실 예약 시스템 문의", requester: "이철수", status: "대기", priority: "낮음" },
                                      { title: "출장비 정산 도움 요청", requester: "박민수", status: "완료", priority: "보통" },
                                    ].map((req, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                                        <Users className="w-4 h-4 text-pink-500" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm truncate">{req.title}</p>
                                          <span className="text-[10px] text-muted-foreground">{req.requester}</span>
                                        </div>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", req.status === "완료" ? "bg-status-online/20 text-status-online" : req.status === "진행중" ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground")}>{req.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Users className="w-4 h-4" /> 지원 요청
                                  </button>
                                  <button className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <FileText className="w-4 h-4" /> FAQ 보기
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </section>
                    </SortableSection>
                  );
                }

                return null;
              })}
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </main>

      {/* Right Resize Handle */}
      {layoutSettings.chatPanel && (
        <div
          onMouseDown={() => handleMouseDown("right")}
          className={cn(
            "w-1.5 h-full bg-transparent hover:bg-primary/50 cursor-col-resize transition-colors shrink-0 group relative",
            isResizing === "right" && "bg-primary/50"
          )}
        >
          <div className={cn(
            "absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-border group-hover:bg-primary transition-colors",
            isResizing === "right" && "bg-primary"
          )} />
        </div>
      )}

      {/* Right Chat Panel */}
      {layoutSettings.chatPanel && (
        <aside
          style={{ width: panelWidths.rightPanel }}
          className="h-full bg-sidebar flex flex-col border-l border-border shrink-0"
        >
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">AI Worker 대화</h2>
              <p className="text-xs text-muted-foreground">{selectedWorkerAgent ? selectedAgentInfo?.name : selectedAgent ? "My Agent" : "Assistant"}</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="p-3 rounded-xl bg-card border border-border/50 text-sm">
                  안녕하세요! AI Worker입니다. 무엇을 도와드릴까요?
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">방금</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                미처리 요청 확인
              </button>
              <button className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                새 요청 등록
              </button>
              <button className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                처리 현황
              </button>
            </div>
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          {/* System & Instruction Selection */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* System Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSystemDropdown(!showSystemDropdown);
                  setShowInstructionDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs hover:bg-muted transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-primary" />
                <span>{selectedSystem}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
              {showSystemDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-40 py-1 rounded-lg bg-card border border-border shadow-lg z-20">
                  {mockSystems.map((sys) => (
                    <button
                      key={sys}
                      onClick={() => {
                        setSelectedSystem(sys);
                        setShowSystemDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors",
                        selectedSystem === sys && "bg-primary/10 text-primary"
                      )}
                    >
                      {sys}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Instruction Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowInstructionDropdown(!showInstructionDropdown);
                  setShowSystemDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs hover:bg-muted transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span>{selectedInstruction}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
              {showInstructionDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-36 py-1 rounded-lg bg-card border border-border shadow-lg z-20">
                  {mockInstructions.map((inst) => (
                    <button
                      key={inst}
                      onClick={() => {
                        setSelectedInstruction(inst);
                        setShowInstructionDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors",
                        selectedInstruction === inst && "bg-primary/10 text-primary"
                      )}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="relative flex items-end gap-2 p-2 bg-secondary rounded-xl border border-border focus-within:border-primary/50 transition-all">
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5"
            />
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                message.trim()
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>AI가 도움을 드릴 준비가 되었습니다</span>
          </div>
        </div>
      </aside>
      )}

      {/* Layout Settings Modal */}
      {showLayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">레이아웃 설정</h2>
                  <p className="text-xs text-muted-foreground">표시할 컴포넌트를 선택하세요</p>
                </div>
              </div>
              <button
                onClick={() => setShowLayoutModal(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: "aiWelcome" as keyof LayoutSettings, label: "AI Welcome", description: "AI 어시스턴트 및 현재 상황 요약", icon: <Sparkles className="w-4 h-4" /> },
                { key: "dailyOverview" as keyof LayoutSettings, label: "Daily Overview", description: "미처리 요청, 처리 완료 등 통계 카드", icon: <TrendingUp className="w-4 h-4" /> },
                { key: "assignedSystems" as keyof LayoutSettings, label: "담당 시스템", description: "담당 시스템 목록 및 현황", icon: <Monitor className="w-4 h-4" /> },
                { key: "myAgent" as keyof LayoutSettings, label: "My Agent", description: "나만의 Agent 목록", icon: <Workflow className="w-4 h-4" /> },
                { key: "workerAgent" as keyof LayoutSettings, label: "Worker Agent", description: "Worker Agent 목록 및 대시보드", icon: <Bot className="w-4 h-4" /> },
                { key: "chatHistory" as keyof LayoutSettings, label: "채팅 이력", description: "좌측 사이드바 채팅 이력", icon: <MessageSquare className="w-4 h-4" /> },
                { key: "chatPanel" as keyof LayoutSettings, label: "채팅 패널", description: "우측 대화 패널", icon: <Send className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => updateLayoutSettings(item.key, !layoutSettings[item.key])}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                    layoutSettings[item.key]
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center",
                    layoutSettings[item.key] ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    layoutSettings[item.key] ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {layoutSettings[item.key] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <button
                onClick={resetLayoutSettings}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                기본값으로 초기화
              </button>
              <button
                onClick={() => setShowLayoutModal(false)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Todo Add Modal */}
      {showTodoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">할 일 추가</h3>
              <button
                onClick={() => setShowTodoModal(false)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">할 일 내용</label>
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="할 일을 입력하세요"
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">카테고리</label>
                <select
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary"
                >
                  <option value="업무">업무</option>
                  <option value="시스템">시스템</option>
                  <option value="요청">요청</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowTodoModal(false)}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (newTodoText.trim()) {
                    setTodoItems(prev => [...prev, {
                      id: Date.now().toString(),
                      text: newTodoText.trim(),
                      completed: false,
                      category: newTodoCategory
                    }]);
                    setNewTodoText("");
                    setShowTodoModal(false);
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
