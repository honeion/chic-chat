import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Bot,
  Eye,
  EyeOff,
  History,
  Rocket,
  MoreHorizontal,
  Wrench,
  BookOpen,
  FileText,
  Check,
  Info,
  Server,
  Store,
  User,
} from "lucide-react";
import { mockSystems } from "@/data/systems";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AgentVersion {
  version: string;
  changes: string;
  publishedAt: string;
  publishedBy: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  type: "RAG" | "Graph";
}

interface Instruction {
  id: string;
  name: string;
  content: string;
}

const mockTools: Tool[] = [
  { id: "t1", name: "Health Check", description: "시스템 상태 체크" },
  { id: "t2", name: "DB Connect", description: "데이터베이스 연결 확인" },
  { id: "t3", name: "Log Analyzer", description: "로그 분석 도구" },
  { id: "t4", name: "Report Gen", description: "보고서 생성 도구" },
  { id: "t5", name: "Alert Detect", description: "알림 감지 도구" },
  { id: "t6", name: "Notify", description: "알림 전송 도구" },
  { id: "t7", name: "Escalate", description: "에스컬레이션 도구" },
  { id: "t8", name: "Backup", description: "백업 도구" },
  { id: "t9", name: "Verify", description: "검증 도구" },
];

const mockKnowledgeBases: KnowledgeBase[] = [
  { id: "kb1", name: "시스템 매뉴얼", type: "RAG" },
  { id: "kb2", name: "장애 대응 가이드", type: "RAG" },
  { id: "kb3", name: "장애 대응 SOP", type: "RAG" },
  { id: "kb4", name: "연락처 목록", type: "Graph" },
  { id: "kb5", name: "백업 정책", type: "RAG" },
  { id: "kb6", name: "운영 절차서", type: "Graph" },
];

const mockInstructions: Instruction[] = [
  { id: "i1", name: "일일 점검 지침", content: "# 일일 점검 지침\n\n## 목적\n매일 아침 시스템 상태를 점검하고 보고서를 생성합니다.\n\n## 절차\n1. Health Check 실행\n2. DB 연결 확인\n3. 보고서 생성\n\n## 주의사항\n- 이상 발견 시 즉시 담당자에게 알림" },
  { id: "i2", name: "장애 대응 지침", content: "# 장애 대응 지침\n\n## 목적\n장애 발생 시 신속하게 대응합니다.\n\n## 절차\n1. 장애 감지 및 분류\n2. 로그 분석\n3. 담당자 알림\n4. 에스컬레이션" },
  { id: "i3", name: "백업 지침", content: "# 백업 지침\n\n## 목적\n데이터베이스를 안전하게 백업합니다.\n\n## 절차\n1. DB 연결\n2. 백업 생성\n3. 무결성 검증\n4. 완료 알림" },
];

interface AgentData {
  id: string;
  name: string;
  description: string;
  steps: string[];
  instructions: string;
  selectedInstructionIds: string[];
  tools: string[];
  knowledgeBases: string[];
  isPublished: boolean;
  currentVersion: string;
  versions: AgentVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// My Agent - 사용자가 Agent 마켓에서 시스템과 매핑하여 등록한 Agent
interface MyAgentData {
  id: string;
  name: string;
  description: string;
  sourceAgentId: string; // 원본 Agent 마켓 Agent ID
  sourceAgentName: string;
  systemId: string;
  systemName: string;
  instructions: string;
  selectedInstructionIds: string[];
  tools: string[];
  knowledgeBases: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const mockAgents: AgentData[] = [
  {
    id: "a1",
    name: "일일 점검 루틴 Agent",
    description: "매일 아침 자동 실행되는 시스템 점검 루틴",
    steps: ["Health Check", "DB Connect", "Report Gen"],
    instructions: "# 일일 점검 지침\n\n## 목적\n매일 아침 시스템 상태를 점검하고 보고서를 생성합니다.\n\n## 절차\n1. Health Check 실행\n2. DB 연결 확인\n3. 보고서 생성\n\n## 주의사항\n- 이상 발견 시 즉시 담당자에게 알림",
    selectedInstructionIds: ["i1"],
    tools: ["t1", "t2", "t4"],
    knowledgeBases: ["kb1", "kb2"],
    isPublished: true,
    currentVersion: "1.2.0",
    versions: [
      { version: "1.2.0", changes: "보고서 형식 개선", publishedAt: "2024-12-01", publishedBy: "김철수" },
      { version: "1.1.0", changes: "DB 점검 로직 추가", publishedAt: "2024-10-15", publishedBy: "김철수" },
      { version: "1.0.0", changes: "초기 버전", publishedAt: "2024-08-01", publishedBy: "김철수" },
    ],
    createdAt: "2024-08-01",
    updatedAt: "2024-12-01",
    createdBy: "김철수",
  },
  {
    id: "a2",
    name: "장애 대응 플로우 Agent",
    description: "장애 감지 시 자동으로 대응하는 플로우",
    steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"],
    instructions: "# 장애 대응 지침\n\n## 목적\n장애 발생 시 신속하게 대응합니다.\n\n## 절차\n1. 장애 감지 및 분류\n2. 로그 분석\n3. 담당자 알림\n4. 에스컬레이션",
    selectedInstructionIds: ["i2"],
    tools: ["t5", "t3", "t6", "t7"],
    knowledgeBases: ["kb3", "kb4"],
    isPublished: true,
    currentVersion: "2.0.0",
    versions: [
      { version: "2.0.0", changes: "에스컬레이션 로직 개선", publishedAt: "2024-11-20", publishedBy: "이영희" },
    ],
    createdAt: "2024-06-15",
    updatedAt: "2024-11-20",
    createdBy: "이영희",
  },
  {
    id: "a3",
    name: "DB 백업 Agent",
    description: "데이터베이스 백업 및 검증 자동화",
    steps: ["DB Connect", "Backup Create", "Verify", "Notify"],
    instructions: "# 백업 지침\n\n## 목적\n데이터베이스를 안전하게 백업합니다.\n\n## 절차\n1. DB 연결\n2. 백업 생성\n3. 무결성 검증\n4. 완료 알림",
    selectedInstructionIds: ["i3"],
    tools: ["t2", "t8", "t9"],
    knowledgeBases: ["kb5"],
    isPublished: false,
    currentVersion: "0.9.0",
    versions: [
      { version: "0.9.0", changes: "베타 버전", publishedAt: "2024-12-05", publishedBy: "박민수" },
    ],
    createdAt: "2024-12-01",
    updatedAt: "2024-12-05",
    createdBy: "박민수",
  },
];

const mockMyAgents: MyAgentData[] = [
  {
    id: "ma1",
    name: "e-총무 일일 점검",
    description: "e-총무 시스템 일일 점검 Agent",
    sourceAgentId: "a1",
    sourceAgentName: "일일 점검 루틴 Agent",
    systemId: "s1",
    systemName: "e-총무",
    instructions: "# e-총무 일일 점검\n\n## 목적\ne-총무 시스템을 매일 점검합니다.",
    selectedInstructionIds: ["i1"],
    tools: ["t1", "t2", "t4"],
    knowledgeBases: ["kb1", "kb2"],
    isActive: true,
    createdAt: "2024-12-01",
    updatedAt: "2024-12-10",
    createdBy: "김철수",
  },
  {
    id: "ma2",
    name: "BiOn 장애 대응",
    description: "BiOn 시스템 장애 대응 Agent",
    sourceAgentId: "a2",
    sourceAgentName: "장애 대응 플로우 Agent",
    systemId: "s2",
    systemName: "BiOn",
    instructions: "# BiOn 장애 대응\n\n## 목적\nBiOn 시스템 장애 발생 시 대응합니다.",
    selectedInstructionIds: ["i2"],
    tools: ["t5", "t3", "t6", "t7"],
    knowledgeBases: ["kb3", "kb4"],
    isActive: true,
    createdAt: "2024-11-15",
    updatedAt: "2024-12-05",
    createdBy: "이영희",
  },
  {
    id: "ma3",
    name: "SATIS DB 백업",
    description: "SATIS 시스템 DB 백업 Agent",
    sourceAgentId: "a3",
    sourceAgentName: "DB 백업 Agent",
    systemId: "s3",
    systemName: "SATIS",
    instructions: "# SATIS DB 백업\n\n## 목적\nSATIS 시스템 DB를 백업합니다.",
    selectedInstructionIds: ["i3"],
    tools: ["t2", "t8", "t9"],
    knowledgeBases: ["kb5"],
    isActive: false,
    createdAt: "2024-12-10",
    updatedAt: "2024-12-12",
    createdBy: "박민수",
  },
];

export function AgentManagement() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"market" | "myagent">("market");

  // Agent 마켓 관리 state
  const [agents, setAgents] = useState<AgentData[]>(mockAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // My Agent 관리 state
  const [myAgents, setMyAgents] = useState<MyAgentData[]>(mockMyAgents);
  const [myAgentSearchQuery, setMyAgentSearchQuery] = useState("");
  const [myAgentFilterSystem, setMyAgentFilterSystem] = useState<string>("all");
  const [myAgentFilterActive, setMyAgentFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [isMyAgentDetailModalOpen, setIsMyAgentDetailModalOpen] = useState(false);
  const [selectedMyAgent, setSelectedMyAgent] = useState<MyAgentData | null>(null);
  
  // Instruction preview modal state
  const [isInstructionPreviewOpen, setIsInstructionPreviewOpen] = useState(false);
  const [previewInstruction, setPreviewInstruction] = useState<Instruction | null>(null);

  const openInstructionPreview = (instruction: Instruction, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewInstruction(instruction);
    setIsInstructionPreviewOpen(true);
  };

  // Detail modal state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editSelectedInstructionIds, setEditSelectedInstructionIds] = useState<string[]>([]);
  const [editSelectedTools, setEditSelectedTools] = useState<string[]>([]);
  const [editSelectedKnowledgeBases, setEditSelectedKnowledgeBases] = useState<string[]>([]);
  const [editInstructionMode, setEditInstructionMode] = useState<"edit" | "preview">("edit");

  // Create modal state
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createInstructions, setCreateInstructions] = useState("");
  const [createSelectedInstructionIds, setCreateSelectedInstructionIds] = useState<string[]>([]);
  const [createSelectedTools, setCreateSelectedTools] = useState<string[]>([]);
  const [createSelectedKnowledgeBases, setCreateSelectedKnowledgeBases] = useState<string[]>([]);
  const [createInstructionMode, setCreateInstructionMode] = useState<"edit" | "preview">("edit");
  const [createPublish, setCreatePublish] = useState(false);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterPublished === "all" ||
      (filterPublished === "published" && agent.isPublished) ||
      (filterPublished === "draft" && !agent.isPublished);
    return matchesSearch && matchesFilter;
  });

  // My Agent 필터링
  const filteredMyAgents = myAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(myAgentSearchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(myAgentSearchQuery.toLowerCase()) ||
      agent.systemName.toLowerCase().includes(myAgentSearchQuery.toLowerCase());
    const matchesSystem = myAgentFilterSystem === "all" || agent.systemId === myAgentFilterSystem;
    const matchesActive =
      myAgentFilterActive === "all" ||
      (myAgentFilterActive === "active" && agent.isActive) ||
      (myAgentFilterActive === "inactive" && !agent.isActive);
    return matchesSearch && matchesSystem && matchesActive;
  });

  const togglePublish = (agentId: string) => {
    setAgents(
      agents.map((a) => (a.id === agentId ? { ...a, isPublished: !a.isPublished } : a))
    );
  };

  const handleDelete = (agentId: string) => {
    setAgents(agents.filter((a) => a.id !== agentId));
  };

  const toggleMyAgentActive = (agentId: string) => {
    setMyAgents(
      myAgents.map((a) => (a.id === agentId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleMyAgentDelete = (agentId: string) => {
    setMyAgents(myAgents.filter((a) => a.id !== agentId));
  };

  const openDetailModal = (agent: AgentData) => {
    setSelectedAgent(agent);
    setEditName(agent.name);
    setEditDescription(agent.description);
    setEditInstructions(agent.instructions);
    setEditSelectedInstructionIds(agent.selectedInstructionIds || []);
    setEditSelectedTools(agent.tools);
    setEditSelectedKnowledgeBases(agent.knowledgeBases);
    setEditInstructionMode("edit");
    setShowVersionHistory(false);
    setIsDetailModalOpen(true);
  };

  const openMyAgentDetailModal = (agent: MyAgentData) => {
    setSelectedMyAgent(agent);
    setIsMyAgentDetailModalOpen(true);
  };

  const openCreateModal = () => {
    setCreateName("");
    setCreateDescription("");
    setCreateInstructions("");
    setCreateSelectedInstructionIds([]);
    setCreateSelectedTools([]);
    setCreateSelectedKnowledgeBases([]);
    setCreateInstructionMode("edit");
    setCreatePublish(false);
    setIsCreateModalOpen(true);
  };

  const toggleInstruction = (instructionId: string, isCreate: boolean) => {
    if (isCreate) {
      setCreateSelectedInstructionIds(prev =>
        prev.includes(instructionId) ? prev.filter(i => i !== instructionId) : [...prev, instructionId]
      );
    } else {
      setEditSelectedInstructionIds(prev =>
        prev.includes(instructionId) ? prev.filter(i => i !== instructionId) : [...prev, instructionId]
      );
    }
  };

  const toggleTool = (toolId: string, isCreate: boolean) => {
    if (isCreate) {
      setCreateSelectedTools(prev =>
        prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
      );
    } else {
      setEditSelectedTools(prev =>
        prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
      );
    }
  };

  const toggleKnowledgeBase = (kbId: string, isCreate: boolean) => {
    if (isCreate) {
      setCreateSelectedKnowledgeBases(prev =>
        prev.includes(kbId) ? prev.filter(k => k !== kbId) : [...prev, kbId]
      );
    } else {
      setEditSelectedKnowledgeBases(prev =>
        prev.includes(kbId) ? prev.filter(k => k !== kbId) : [...prev, kbId]
      );
    }
  };

  // 시스템 목록 추출
  const uniqueSystems = mockSystems.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      {/* Tab Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeTab === "market" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setActiveTab("market")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-xs text-muted-foreground">Agent 마켓 관리</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeTab === "myagent" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setActiveTab("myagent")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myAgents.length}</p>
                <p className="text-xs text-muted-foreground">My Agent 마켓 관리</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "market" | "myagent")}>
        <TabsList className="w-fit">
          <TabsTrigger value="market" className="gap-2">
            <Store className="w-4 h-4" />
            Agent 마켓 관리
          </TabsTrigger>
          <TabsTrigger value="myagent" className="gap-2">
            <User className="w-4 h-4" />
            My Agent 마켓 관리
          </TabsTrigger>
        </TabsList>

        {/* Agent 마켓 관리 탭 */}
        <TabsContent value="market" className="space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Agent 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Agent 추가
            </Button>
          </div>

          {/* Stats with Filter */}
          <div className="grid grid-cols-3 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            filterPublished === "all" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setFilterPublished("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-xs text-muted-foreground">전체 Agent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            filterPublished === "published" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setFilterPublished("published")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-online/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-status-online" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.filter((a) => a.isPublished).length}</p>
                <p className="text-xs text-muted-foreground">게시됨</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            filterPublished === "draft" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setFilterPublished("draft")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.filter((a) => !a.isPublished).length}</p>
                <p className="text-xs text-muted-foreground">초안</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent List Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Agent명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="w-[100px]">지침</TableHead>
              <TableHead className="w-[100px]">도구</TableHead>
              <TableHead className="w-[100px]">지식</TableHead>
              <TableHead className="w-[80px]">버전</TableHead>
              <TableHead className="w-[80px]">상태</TableHead>
              <TableHead className="w-[100px]">수정일</TableHead>
              <TableHead className="w-[80px] text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  등록된 Agent가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents.map((agent) => (
                <TableRow
                  key={agent.id}
                  className={cn(
                    "cursor-pointer hover:bg-secondary/50",
                    !agent.isPublished && "opacity-70"
                  )}
                  onClick={() => openDetailModal(agent)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                    {agent.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{agent.selectedInstructionIds?.length || 0}개</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{agent.tools?.length || 0}개</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{agent.knowledgeBases?.length || 0}개</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{agent.currentVersion}</Badge>
                  </TableCell>
                  <TableCell>
                    {agent.isPublished ? (
                      <Badge className="bg-status-online text-white text-xs">게시됨</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">초안</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {agent.updatedAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailModal(agent);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublish(agent.id);
                          }}
                        >
                          {agent.isPublished ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              게시 취소
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              게시
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(agent.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
        </TabsContent>

        {/* My Agent 마켓 관리 탭 */}
        <TabsContent value="myagent" className="space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="My Agent 검색"
                value={myAgentSearchQuery}
                onChange={(e) => setMyAgentSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4">
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                myAgentFilterActive === "all" && "ring-2 ring-primary border-primary"
              )}
              onClick={() => setMyAgentFilterActive("all")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{myAgents.length}</p>
                    <p className="text-xs text-muted-foreground">전체 My Agent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                myAgentFilterActive === "active" && "ring-2 ring-primary border-primary"
              )}
              onClick={() => setMyAgentFilterActive("active")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-status-online/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-status-online" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{myAgents.filter((a) => a.isActive).length}</p>
                    <p className="text-xs text-muted-foreground">활성</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                myAgentFilterActive === "inactive" && "ring-2 ring-primary border-primary"
              )}
              onClick={() => setMyAgentFilterActive("inactive")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{myAgents.filter((a) => !a.isActive).length}</p>
                    <p className="text-xs text-muted-foreground">비활성</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Agent List Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">My Agent명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-[120px]">원본 Agent</TableHead>
                  <TableHead className="w-[100px]">시스템</TableHead>
                  <TableHead className="w-[80px]">상태</TableHead>
                  <TableHead className="w-[100px]">생성자</TableHead>
                  <TableHead className="w-[100px]">수정일</TableHead>
                  <TableHead className="w-[80px] text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMyAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      등록된 My Agent가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMyAgents.map((agent) => (
                    <TableRow
                      key={agent.id}
                      className={cn(
                        "cursor-pointer hover:bg-secondary/50",
                        !agent.isActive && "opacity-70"
                      )}
                      onClick={() => openMyAgentDetailModal(agent)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-500" />
                          </div>
                          <span className="font-medium">{agent.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                        {agent.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {agent.sourceAgentName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary text-xs">
                          <Server className="w-3 h-3 mr-1" />
                          {agent.systemName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {agent.isActive ? (
                          <Badge className="bg-status-online text-white text-xs">활성</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">비활성</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {agent.createdBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {agent.updatedAt}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openMyAgentDetailModal(agent);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              상세보기
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMyAgentActive(agent.id);
                              }}
                            >
                              {agent.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  비활성화
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  활성화
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMyAgentDelete(agent.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Agent 상세 정보
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  버전 이력
                </Button>
                {selectedAgent && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">게시</span>
                    <Switch
                      checked={selectedAgent.isPublished}
                      onCheckedChange={() => togglePublish(selectedAgent.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedAgent && (
            <div className="flex gap-6 h-[calc(90vh-180px)]">
              {/* Left Side - Basic Info & Selections */}
              <div className="w-1/2 space-y-4 overflow-y-auto pr-4">
                {showVersionHistory && (
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2 mb-4">
                    <h4 className="font-medium text-sm">버전 이력</h4>
                    <div className="space-y-2">
                      {selectedAgent.versions.map((v, idx) => (
                        <div
                          key={v.version}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-sm",
                            idx === 0 ? "bg-primary/10 border border-primary/30" : "bg-background"
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={idx === 0 ? "default" : "secondary"}>v{v.version}</Badge>
                              <span className="text-muted-foreground">{v.publishedBy}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{v.changes}</p>
                          </div>
                          <span className="text-muted-foreground">{v.publishedAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    Agent 이름
                  </label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    설명
                  </label>
                  <Textarea 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2} 
                  />
                </div>

                {/* Instruction Selection */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    지침 선택 ({editSelectedInstructionIds.length}개 선택)
                  </label>
                  <ScrollArea className="h-32 border rounded-lg p-2">
                    <div className="space-y-1">
                      {mockInstructions.map((instruction) => (
                        <div
                          key={instruction.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                            editSelectedInstructionIds.includes(instruction.id) && "bg-primary/10"
                          )}
                          onClick={() => toggleInstruction(instruction.id, false)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={editSelectedInstructionIds.includes(instruction.id)}
                              className="pointer-events-none"
                            />
                            <span className="text-sm">{instruction.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => openInstructionPreview(instruction, e)}
                          >
                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Tool Selection */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Tool 선택 ({editSelectedTools.length}개 선택)
                  </label>
                  <ScrollArea className="h-40 border rounded-lg p-2">
                    <div className="space-y-1">
                      {mockTools.map((tool) => (
                        <div
                          key={tool.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                            editSelectedTools.includes(tool.id) && "bg-primary/10"
                          )}
                          onClick={() => toggleTool(tool.id, false)}
                        >
                          <Checkbox
                            checked={editSelectedTools.includes(tool.id)}
                            className="pointer-events-none"
                          />
                          <div>
                            <span className="text-sm font-medium">{tool.name}</span>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Knowledge Base Selection */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    지식 선택 ({editSelectedKnowledgeBases.length}개 선택)
                  </label>
                  <ScrollArea className="h-40 border rounded-lg p-2">
                    <div className="space-y-1">
                      {mockKnowledgeBases.map((kb) => (
                        <div
                          key={kb.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                            editSelectedKnowledgeBases.includes(kb.id) && "bg-primary/10"
                          )}
                          onClick={() => toggleKnowledgeBase(kb.id, false)}
                        >
                          <Checkbox
                            checked={editSelectedKnowledgeBases.includes(kb.id)}
                            className="pointer-events-none"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{kb.name}</span>
                            <Badge variant="outline" className="text-xs">{kb.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Right Side - Instructions MD Editor */}
              <div className="w-1/2 flex flex-col border-l pl-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Agent 프롬프트 (Markdown)
                  </label>
                  <div className="flex gap-1">
                    <Button
                      variant={editInstructionMode === "edit" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditInstructionMode("edit")}
                    >
                      편집
                    </Button>
                    <Button
                      variant={editInstructionMode === "preview" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditInstructionMode("preview")}
                    >
                      미리보기
                    </Button>
                  </div>
                </div>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  {editInstructionMode === "edit" ? (
                    <Textarea
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      className="w-full h-full min-h-full resize-none border-0 font-mono text-sm"
                      placeholder="Markdown 형식으로 Agent 프롬프트를 입력하세요..."
                    />
                  ) : (
                    <ScrollArea className="h-full p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{editInstructions}</pre>
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              닫기
            </Button>
            <Button onClick={() => setIsDetailModalOpen(false)}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Agent 추가
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-6 h-[calc(90vh-180px)]">
            {/* Left Side - Basic Info & Selections */}
            <div className="w-1/2 space-y-4 overflow-y-auto pr-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  Agent 이름
                </label>
                <Input 
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Agent 이름 입력" 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                <Textarea 
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Agent 설명 입력" 
                  rows={2} 
                />
              </div>

              {/* Instruction Selection */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  지침 선택 ({createSelectedInstructionIds.length}개 선택)
                </label>
                <ScrollArea className="h-32 border rounded-lg p-2">
                  <div className="space-y-1">
                    {mockInstructions.map((instruction) => (
                      <div
                        key={instruction.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                          createSelectedInstructionIds.includes(instruction.id) && "bg-primary/10"
                        )}
                        onClick={() => toggleInstruction(instruction.id, true)}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={createSelectedInstructionIds.includes(instruction.id)}
                            className="pointer-events-none"
                          />
                          <span className="text-sm">{instruction.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => openInstructionPreview(instruction, e)}
                        >
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Tool Selection */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tool 선택 ({createSelectedTools.length}개 선택)
                </label>
                <ScrollArea className="h-40 border rounded-lg p-2">
                  <div className="space-y-1">
                    {mockTools.map((tool) => (
                      <div
                        key={tool.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                          createSelectedTools.includes(tool.id) && "bg-primary/10"
                        )}
                        onClick={() => toggleTool(tool.id, true)}
                      >
                        <Checkbox
                          checked={createSelectedTools.includes(tool.id)}
                          className="pointer-events-none"
                        />
                        <div>
                          <span className="text-sm font-medium">{tool.name}</span>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Knowledge Base Selection */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  지식 선택 ({createSelectedKnowledgeBases.length}개 선택)
                </label>
                <ScrollArea className="h-40 border rounded-lg p-2">
                  <div className="space-y-1">
                    {mockKnowledgeBases.map((kb) => (
                      <div
                        key={kb.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
                          createSelectedKnowledgeBases.includes(kb.id) && "bg-primary/10"
                        )}
                        onClick={() => toggleKnowledgeBase(kb.id, true)}
                      >
                        <Checkbox
                          checked={createSelectedKnowledgeBases.includes(kb.id)}
                          className="pointer-events-none"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{kb.name}</span>
                          <Badge variant="outline" className="text-xs">{kb.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch 
                  id="create-publish" 
                  checked={createPublish}
                  onCheckedChange={setCreatePublish}
                />
                <label htmlFor="create-publish" className="text-sm">
                  바로 게시
                </label>
              </div>
            </div>

            {/* Right Side - Instructions MD Editor */}
            <div className="w-1/2 flex flex-col border-l pl-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Agent 프롬프트 (Markdown)
                </label>
                <div className="flex gap-1">
                  <Button
                    variant={createInstructionMode === "edit" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateInstructionMode("edit")}
                  >
                    편집
                  </Button>
                  <Button
                    variant={createInstructionMode === "preview" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateInstructionMode("preview")}
                  >
                    미리보기
                  </Button>
                </div>
              </div>
              <div className="flex-1 border rounded-lg overflow-hidden">
                {createInstructionMode === "edit" ? (
                  <Textarea
                    value={createInstructions}
                    onChange={(e) => setCreateInstructions(e.target.value)}
                    className="w-full h-full min-h-full resize-none border-0 font-mono text-sm"
                    placeholder="Markdown 형식으로 Agent 프롬프트를 입력하세요..."
                  />
                ) : (
                  <ScrollArea className="h-full p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{createInstructions}</pre>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instruction Preview Modal */}
      <Dialog open={isInstructionPreviewOpen} onOpenChange={setIsInstructionPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {previewInstruction?.name || "지침 내용"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] border rounded-lg p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{previewInstruction?.content || ""}</ReactMarkdown>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstructionPreviewOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Agent Detail Modal */}
      <Dialog open={isMyAgentDetailModalOpen} onOpenChange={setIsMyAgentDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" />
              My Agent 상세 정보
            </DialogTitle>
          </DialogHeader>
          {selectedMyAgent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">My Agent명</label>
                    <p className="text-sm font-medium">{selectedMyAgent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">상태</label>
                    <div className="mt-1">
                      {selectedMyAgent.isActive ? (
                        <Badge className="bg-status-online text-white">활성</Badge>
                      ) : (
                        <Badge variant="secondary">비활성</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">설명</label>
                  <p className="text-sm">{selectedMyAgent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">원본 Agent</label>
                    <Badge variant="outline" className="mt-1">{selectedMyAgent.sourceAgentName}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">매핑 시스템</label>
                    <Badge className="bg-primary/20 text-primary mt-1">
                      <Server className="w-3 h-3 mr-1" />
                      {selectedMyAgent.systemName}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" /> 지침
                    </label>
                    <p className="text-sm">{selectedMyAgent.selectedInstructionIds.length}개</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> 도구
                    </label>
                    <p className="text-sm">{selectedMyAgent.tools.length}개</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> 지식
                    </label>
                    <p className="text-sm">{selectedMyAgent.knowledgeBases.length}개</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">생성자</label>
                    <p className="text-sm">{selectedMyAgent.createdBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">생성일</label>
                    <p className="text-sm">{selectedMyAgent.createdAt}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Agent 프롬프트</label>
                  <div className="mt-2 p-3 rounded-lg bg-secondary/50 border">
                    <pre className="whitespace-pre-wrap text-sm">{selectedMyAgent.instructions}</pre>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMyAgentDetailModalOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
