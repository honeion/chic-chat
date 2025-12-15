import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Server,
  User,
  Calendar,
  History,
  Eye,
  Globe,
  MoreHorizontal,
  Check,
  X,
  Wrench,
  Database,
  BookOpen,
  ChevronsUpDown,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface InstructionVersion {
  version: string;
  content: string;
  updatedAt: string;
  updatedBy: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface Knowledge {
  id: string;
  name: string;
  type: "RAG" | "Graph";
  systemName?: string;
}

interface InstructionData {
  id: string;
  name: string;
  systemId: string | null; // null이면 공용지침
  systemName: string | null;
  description: string;
  content: string;
  author: string;
  authorRole: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  currentVersion: string;
  versions: InstructionVersion[];
  isPublic: boolean; // 공용지침 여부
  selectedTools?: string[];
  selectedKnowledge?: string[];
}

// Worker 지침 인터페이스
interface WorkerInstructionData {
  id: string;
  name: string;
  systemId: string;
  systemName: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

// Mock Tools
const mockTools: Tool[] = [
  { id: "t1", name: "Health Check", description: "시스템 헬스 체크 도구" },
  { id: "t2", name: "DB Connect", description: "데이터베이스 연결 도구" },
  { id: "t3", name: "Log Analyzer", description: "로그 분석 도구" },
  { id: "t4", name: "Alert Send", description: "알림 발송 도구" },
  { id: "t5", name: "Report Gen", description: "보고서 생성 도구" },
  { id: "t6", name: "API Request", description: "API 요청 도구" },
  { id: "t7", name: "File Manager", description: "파일 관리 도구" },
  { id: "t8", name: "Email Sender", description: "이메일 발송 도구" },
];

// Mock Knowledge
const mockKnowledge: Knowledge[] = [
  { id: "k1", name: "e-총무 장애 지식", type: "RAG", systemName: "e-총무" },
  { id: "k2", name: "e-총무 운영 매뉴얼", type: "RAG", systemName: "e-총무" },
  { id: "k3", name: "BiOn 시스템 구조", type: "Graph", systemName: "BiOn" },
  { id: "k4", name: "SATIS 데이터 모델", type: "Graph", systemName: "SATIS" },
  { id: "k5", name: "공통 보안 가이드", type: "RAG" },
  { id: "k6", name: "인프라 토폴로지", type: "Graph" },
];

// 공용지침 mock 데이터
const mockPublicInstructions: InstructionData[] = [
  {
    id: "pub1",
    name: "표준 장애대응 가이드",
    systemId: null,
    systemName: null,
    description: "모든 시스템에 적용되는 표준 장애대응 절차",
    content: `# 표준 장애대응 가이드

## 1. 장애 등급 분류
- Critical: 서비스 전체 불가
- Major: 주요 기능 장애
- Minor: 일부 기능 제한

## 2. 대응 절차
1. 장애 인지 및 보고
2. 영향도 분석
3. 긴급 조치
4. 원인 분석
5. 재발 방지`,
    author: "관리자",
    authorRole: "admin",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01",
    currentVersion: "2.0.0",
    versions: [
      { version: "2.0.0", content: "최신 버전", updatedAt: "2024-12-01", updatedBy: "관리자" },
      { version: "1.0.0", content: "초기 버전", updatedAt: "2024-01-01", updatedBy: "관리자" },
    ],
    isPublic: true,
  },
  {
    id: "pub2",
    name: "배포 승인 절차",
    systemId: null,
    systemName: null,
    description: "모든 시스템 배포 시 필수 승인 절차",
    content: `# 배포 승인 절차

## 승인 단계
1. 개발팀 검토
2. QA 승인
3. 운영팀 승인
4. 최종 배포 승인`,
    author: "관리자",
    authorRole: "admin",
    createdAt: "2024-02-01",
    updatedAt: "2024-11-15",
    currentVersion: "1.1.0",
    versions: [
      { version: "1.1.0", content: "현재", updatedAt: "2024-11-15", updatedBy: "관리자" },
    ],
    isPublic: true,
  },
  {
    id: "pub3",
    name: "보안 점검 체크리스트",
    systemId: null,
    systemName: null,
    description: "시스템 보안 점검 시 확인해야 할 항목",
    content: `# 보안 점검 체크리스트

## 접근 제어
- [ ] 권한 설정 확인
- [ ] 계정 관리 상태

## 네트워크 보안
- [ ] 방화벽 규칙
- [ ] SSL 인증서`,
    author: "관리자",
    authorRole: "admin",
    createdAt: "2024-03-01",
    updatedAt: "2024-10-20",
    currentVersion: "1.0.0",
    versions: [
      { version: "1.0.0", content: "초기", updatedAt: "2024-10-20", updatedBy: "관리자" },
    ],
    isPublic: true,
  },
];

// 시스템별 지침 mock 데이터
const mockSystemInstructions: InstructionData[] = [
  {
    id: "sys1",
    name: "e-총무 장애대응 지침",
    systemId: "s1",
    systemName: "e-총무",
    description: "e-총무 시스템 장애 발생 시 대응 절차",
    content: `# e-총무 장애대응 지침

## 1. 장애 감지
- 모니터링 시스템을 통한 자동 감지
- 사용자 신고를 통한 감지

## 2. 초기 대응
1. 장애 영향도 파악
2. 담당자 알림 발송
3. 장애 등급 분류`,
    author: "김철수",
    authorRole: "user",
    createdAt: "2024-01-15",
    updatedAt: "2024-12-01",
    currentVersion: "1.2.0",
    versions: [
      { version: "1.2.0", content: "최신 버전", updatedAt: "2024-12-01", updatedBy: "김철수" },
      { version: "1.0.0", content: "초기 버전", updatedAt: "2024-01-15", updatedBy: "김철수" },
    ],
    isPublic: false,
  },
  {
    id: "sys2",
    name: "e-총무 배포 절차서",
    systemId: "s1",
    systemName: "e-총무",
    description: "e-총무 시스템 배포 시 준수해야 할 절차",
    content: `# e-총무 배포 절차서

## 배포 전 체크리스트
- 코드 리뷰 완료
- 테스트 통과 확인`,
    author: "관리자",
    authorRole: "admin",
    createdAt: "2024-02-20",
    updatedAt: "2024-11-28",
    currentVersion: "2.0.1",
    versions: [
      { version: "2.0.1", content: "패치", updatedAt: "2024-11-28", updatedBy: "관리자" },
    ],
    isPublic: false,
  },
  {
    id: "sys3",
    name: "BiOn 배포 절차서",
    systemId: "s2",
    systemName: "BiOn",
    description: "BiOn 시스템 배포 시 준수해야 할 절차",
    content: `# BiOn 배포 절차서

## 배포 단계
1. 스테이징 환경 테스트
2. 운영 환경 배포
3. 헬스체크 확인`,
    author: "박민수",
    authorRole: "user",
    createdAt: "2024-02-20",
    updatedAt: "2024-11-28",
    currentVersion: "2.0.1",
    versions: [
      { version: "2.0.1", content: "패치", updatedAt: "2024-11-28", updatedBy: "박민수" },
    ],
    isPublic: false,
  },
  {
    id: "sys4",
    name: "SATIS 데이터 백업 지침",
    systemId: "s3",
    systemName: "SATIS",
    description: "SATIS 시스템 데이터 백업 및 복구 절차",
    content: `# SATIS 데이터 백업 지침

## 백업 스케줄
- 일간: 증분 백업
- 주간: 전체 백업`,
    author: "이영희",
    authorRole: "user",
    createdAt: "2024-03-10",
    updatedAt: "2024-10-15",
    currentVersion: "1.1.0",
    versions: [
      { version: "1.1.0", content: "현재", updatedAt: "2024-10-15", updatedBy: "이영희" },
    ],
    isPublic: false,
  },
  {
    id: "sys5",
    name: "SATIS 모니터링 가이드",
    systemId: "s3",
    systemName: "SATIS",
    description: "SATIS 시스템 모니터링 설정 및 운영 가이드",
    content: `# SATIS 모니터링 가이드

## 모니터링 항목
- API 응답시간
- DB 연결 상태`,
    author: "관리자",
    authorRole: "admin",
    createdAt: "2024-04-01",
    updatedAt: "2024-09-20",
    currentVersion: "1.0.0",
    versions: [
      { version: "1.0.0", content: "초기", updatedAt: "2024-09-20", updatedBy: "관리자" },
    ],
    isPublic: false,
  },
];

const systems = [
  { id: "s1", name: "e-총무" },
  { id: "s2", name: "BiOn" },
  { id: "s3", name: "SATIS" },
  { id: "s4", name: "ITS" },
];

// Worker 지침 mock 데이터
const mockWorkerInstructions: WorkerInstructionData[] = [
  {
    id: "worker1",
    name: "e-총무 장애처리 Worker 지침",
    systemId: "s1",
    systemName: "e-총무",
    content: `# e-총무 장애처리 Worker 지침

## 1. 장애 감지 시 행동
- 모니터링 알림 확인
- 서비스 상태 점검
- 영향도 분석 수행

## 2. 초기 대응 단계
1. 장애 유형 분류
2. 담당자 알림
3. 긴급 조치 실행

## 3. 보고서 작성
- 장애 발생 시간
- 영향 범위
- 조치 내용`,
    author: "관리자",
    createdAt: "2024-06-01",
    updatedAt: "2024-12-01",
  },
  {
    id: "worker2",
    name: "BiOn 데이터 처리 Worker 지침",
    systemId: "s2",
    systemName: "BiOn",
    content: `# BiOn 데이터 처리 Worker 지침

## 데이터 검증
- 입력 데이터 유효성 확인
- 형식 검증

## 처리 절차
1. 데이터 수집
2. 변환 및 정제
3. 저장 및 로깅`,
    author: "관리자",
    createdAt: "2024-07-15",
    updatedAt: "2024-11-20",
  },
  {
    id: "worker3",
    name: "SATIS 배치 실행 Worker 지침",
    systemId: "s3",
    systemName: "SATIS",
    content: `# SATIS 배치 실행 Worker 지침

## 배치 실행 전 확인사항
- 선행 작업 완료 확인
- 리소스 가용성 점검

## 실행 및 모니터링
- 배치 시작 로그 기록
- 진행 상태 모니터링
- 오류 발생 시 알림`,
    author: "관리자",
    createdAt: "2024-08-01",
    updatedAt: "2024-10-15",
  },
];

export function InstructionManagement() {
  const [publicInstructions, setPublicInstructions] = useState<InstructionData[]>(mockPublicInstructions);
  const [systemInstructions, setSystemInstructions] = useState<InstructionData[]>(mockSystemInstructions);
  const [workerInstructions, setWorkerInstructions] = useState<WorkerInstructionData[]>(mockWorkerInstructions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [selectedAuthorRole, setSelectedAuthorRole] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<InstructionData | null>(null);
  const [isEditMode, setIsEditMode] = useState(true); // 기본값 수정모드
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"public" | "system" | "worker">("public");
  const [createType, setCreateType] = useState<"public" | "system" | "worker">("public");
  const [editSelectedTools, setEditSelectedTools] = useState<string[]>([]);
  const [editSelectedKnowledge, setEditSelectedKnowledge] = useState<string[]>([]);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showCreateMarkdownPreview, setShowCreateMarkdownPreview] = useState(false);
  const [createContent, setCreateContent] = useState("");
  const [editSelectedSystem, setEditSelectedSystem] = useState<string>("");
  const [createSelectedSystem, setCreateSelectedSystem] = useState<string>("");
  const [editSystemOpen, setEditSystemOpen] = useState(false);
  const [createSystemOpen, setCreateSystemOpen] = useState(false);
  const [filterSystemOpen, setFilterSystemOpen] = useState(false);
  
  // Worker 지침 관련 state
  const [selectedWorkerInstruction, setSelectedWorkerInstruction] = useState<WorkerInstructionData | null>(null);
  const [isWorkerDetailModalOpen, setIsWorkerDetailModalOpen] = useState(false);
  const [isWorkerCreateModalOpen, setIsWorkerCreateModalOpen] = useState(false);
  const [workerEditContent, setWorkerEditContent] = useState("");
  const [workerEditName, setWorkerEditName] = useState("");
  const [workerEditSystem, setWorkerEditSystem] = useState("");
  const [workerEditSystemOpen, setWorkerEditSystemOpen] = useState(false);
  const [showWorkerMarkdownPreview, setShowWorkerMarkdownPreview] = useState(false);
  const [workerCreateName, setWorkerCreateName] = useState("");
  const [workerCreateSystem, setWorkerCreateSystem] = useState("");
  const [workerCreateSystemOpen, setWorkerCreateSystemOpen] = useState(false);
  const [workerCreateContent, setWorkerCreateContent] = useState("");
  const [showWorkerCreateMarkdownPreview, setShowWorkerCreateMarkdownPreview] = useState(false);
  const [workerFilterSystemOpen, setWorkerFilterSystemOpen] = useState(false);
  const [workerSelectedSystem, setWorkerSelectedSystem] = useState<string>("all");

  // 공용지침 필터링
  const filteredPublicInstructions = publicInstructions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // 시스템별 지침 필터링
  const filteredSystemInstructions = systemInstructions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === "all" || inst.systemId === selectedSystem;
    const matchesAuthor = selectedAuthorRole === "all" || inst.authorRole === selectedAuthorRole;
    return matchesSearch && matchesSystem && matchesAuthor;
  });

  // Worker 지침 필터링
  const filteredWorkerInstructions = workerInstructions.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = workerSelectedSystem === "all" || inst.systemId === workerSelectedSystem;
    return matchesSearch && matchesSystem;
  });

  const handleDelete = (id: string, isPublic: boolean) => {
    if (isPublic) {
      setPublicInstructions(publicInstructions.filter((i) => i.id !== id));
    } else {
      setSystemInstructions(systemInstructions.filter((i) => i.id !== id));
    }
  };

  const handleDeleteWorkerInstruction = (id: string) => {
    setWorkerInstructions(workerInstructions.filter((i) => i.id !== id));
  };

  const openCreateModal = (type: "public" | "system" | "worker") => {
    if (type === "worker") {
      setWorkerCreateName("");
      setWorkerCreateSystem("");
      setWorkerCreateContent("");
      setShowWorkerCreateMarkdownPreview(false);
      setIsWorkerCreateModalOpen(true);
    } else {
      setCreateType(type);
      setIsCreateModalOpen(true);
    }
  };

  const openWorkerDetailModal = (inst: WorkerInstructionData) => {
    setSelectedWorkerInstruction(inst);
    setWorkerEditName(inst.name);
    setWorkerEditSystem(inst.systemId);
    setWorkerEditContent(inst.content);
    setShowWorkerMarkdownPreview(false);
    setIsWorkerDetailModalOpen(true);
  };

  const handleSaveWorkerInstruction = () => {
    if (selectedWorkerInstruction) {
      setWorkerInstructions(workerInstructions.map((i) => 
        i.id === selectedWorkerInstruction.id 
          ? {
              ...i,
              name: workerEditName,
              systemId: workerEditSystem,
              systemName: systems.find(s => s.id === workerEditSystem)?.name || i.systemName,
              content: workerEditContent,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : i
      ));
      setIsWorkerDetailModalOpen(false);
    }
  };

  const handleCreateWorkerInstruction = () => {
    const newInstruction: WorkerInstructionData = {
      id: `worker${Date.now()}`,
      name: workerCreateName,
      systemId: workerCreateSystem,
      systemName: systems.find(s => s.id === workerCreateSystem)?.name || "",
      content: workerCreateContent,
      author: "관리자",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setWorkerInstructions([...workerInstructions, newInstruction]);
    setIsWorkerCreateModalOpen(false);
  };

  const getAuthorBadge = (role: "admin" | "user") => {
    return role === "admin" ? (
      <Badge variant="default" className="text-xs">관리자</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">사용자</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats with Tab Navigation */}
      <div className="grid grid-cols-4 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeTab === "public" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setActiveTab("public")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publicInstructions.length}</p>
                <p className="text-xs text-muted-foreground">공용 지침</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeTab === "system" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setActiveTab("system")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemInstructions.length}</p>
                <p className="text-xs text-muted-foreground">시스템별 지침</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeTab === "worker" && "ring-2 ring-primary border-primary"
          )}
          onClick={() => setActiveTab("worker")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workerInstructions.length}</p>
                <p className="text-xs text-muted-foreground">Worker 지침</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {systemInstructions.filter(i => i.authorRole === "user").length}
                </p>
                <p className="text-xs text-muted-foreground">사용자 작성</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="지침 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => openCreateModal(activeTab)} className="gap-2">
          <Plus className="w-4 h-4" />
          지침 추가
        </Button>
      </div>

      {/* Tabs (hidden, controlled by cards) */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "public" | "system" | "worker")}>

        {/* 공용 지침 탭 */}
        <TabsContent value="public" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">지침명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-[100px]">버전</TableHead>
                  <TableHead className="w-[100px]">작성자</TableHead>
                  <TableHead className="w-[120px]">수정일</TableHead>
                  <TableHead className="w-[80px] text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPublicInstructions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      등록된 공용 지침이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPublicInstructions.map((inst) => (
                    <TableRow
                      key={inst.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => {
                        setSelectedInstruction(inst);
                        setEditSelectedTools(inst.selectedTools || []);
                        setEditSelectedKnowledge(inst.selectedKnowledge || []);
                        setEditContent(inst.content);
                        setShowMarkdownPreview(false);
                        setIsDetailModalOpen(true);
                        setIsEditMode(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{inst.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {inst.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{inst.currentVersion}</Badge>
                      </TableCell>
                      <TableCell>
                        {getAuthorBadge(inst.authorRole)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inst.updatedAt}
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
                                setSelectedInstruction(inst);
                                setEditSelectedTools(inst.selectedTools || []);
                                setEditSelectedKnowledge(inst.selectedKnowledge || []);
                                setEditContent(inst.content);
                                setShowMarkdownPreview(false);
                                setIsDetailModalOpen(true);
                                setIsEditMode(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              편집
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(inst.id, true);
                              }}
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

        {/* 시스템별 지침 탭 */}
        <TabsContent value="system" className="space-y-4">
          <div className="flex items-center gap-4">
            <Popover open={filterSystemOpen} onOpenChange={setFilterSystemOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={filterSystemOpen}
                  className="min-w-[150px] justify-between"
                >
                  {selectedSystem === "all"
                    ? "전체 시스템"
                    : systems.find((s) => s.id === selectedSystem)?.name}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 z-50">
                <Command>
                  <CommandInput placeholder="시스템 검색..." />
                  <CommandList>
                    <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedSystem("all");
                          setFilterSystemOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSystem === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        전체 시스템
                      </CommandItem>
                      {systems.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => {
                            setSelectedSystem(s.id);
                            setFilterSystemOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSystem === s.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <select
              value={selectedAuthorRole}
              onChange={(e) => setSelectedAuthorRole(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm min-w-[120px]"
            >
              <option value="all">전체 작성자</option>
              <option value="admin">관리자</option>
              <option value="user">사용자</option>
            </select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">지침명</TableHead>
                  <TableHead className="w-[100px]">시스템</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-[80px]">버전</TableHead>
                  <TableHead className="w-[100px]">작성자</TableHead>
                  <TableHead className="w-[100px]">수정일</TableHead>
                  <TableHead className="w-[80px] text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSystemInstructions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      등록된 시스템별 지침이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSystemInstructions.map((inst) => (
                    <TableRow
                      key={inst.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => {
                        setSelectedInstruction(inst);
                        setEditSelectedTools(inst.selectedTools || []);
                        setEditSelectedKnowledge(inst.selectedKnowledge || []);
                        setEditContent(inst.content);
                        setShowMarkdownPreview(false);
                        setIsDetailModalOpen(true);
                        setIsEditMode(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{inst.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10">
                          {inst.systemName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                        {inst.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{inst.currentVersion}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getAuthorBadge(inst.authorRole)}
                          <span className="text-xs text-muted-foreground">{inst.author}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inst.updatedAt}
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
                                setSelectedInstruction(inst);
                                setEditSelectedTools(inst.selectedTools || []);
                                setEditSelectedKnowledge(inst.selectedKnowledge || []);
                                setEditContent(inst.content);
                                setShowMarkdownPreview(false);
                                setIsDetailModalOpen(true);
                                setIsEditMode(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              편집
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(inst.id, false);
                              }}
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

        {/* Worker 지침 탭 */}
        <TabsContent value="worker" className="space-y-4">
          <div className="flex items-center gap-4">
            <Popover open={workerFilterSystemOpen} onOpenChange={setWorkerFilterSystemOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={workerFilterSystemOpen}
                  className="min-w-[150px] justify-between"
                >
                  {workerSelectedSystem === "all"
                    ? "전체 시스템"
                    : systems.find((s) => s.id === workerSelectedSystem)?.name}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 z-50">
                <Command>
                  <CommandInput placeholder="시스템 검색..." />
                  <CommandList>
                    <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setWorkerSelectedSystem("all");
                          setWorkerFilterSystemOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            workerSelectedSystem === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        전체 시스템
                      </CommandItem>
                      {systems.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => {
                            setWorkerSelectedSystem(s.id);
                            setWorkerFilterSystemOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              workerSelectedSystem === s.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">지침명</TableHead>
                  <TableHead className="w-[120px]">시스템</TableHead>
                  <TableHead className="w-[100px]">작성자</TableHead>
                  <TableHead className="w-[120px]">수정일</TableHead>
                  <TableHead className="w-[80px] text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkerInstructions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      등록된 Worker 지침이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkerInstructions.map((inst) => (
                    <TableRow
                      key={inst.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => openWorkerDetailModal(inst)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{inst.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-500/10">
                          {inst.systemName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inst.author}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inst.updatedAt}
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
                                openWorkerDetailModal(inst);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              편집
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkerInstruction(inst.id);
                              }}
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

      {/* Detail/Edit Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedInstruction?.isPublic ? (
                  <Globe className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-primary" />
                )}
                {selectedInstruction?.name}
                {selectedInstruction?.isPublic && (
                  <Badge className="ml-2">공용</Badge>
                )}
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
              </div>
            </div>
          </DialogHeader>

          {selectedInstruction && (
            <div className="flex gap-6 py-4 h-[calc(90vh-180px)]">
              {/* 좌측: 기본 정보 및 Tool/지식 선택 */}
              <div className="w-[400px] flex-shrink-0 space-y-4 overflow-y-auto pr-2">
                {showVersionHistory && (
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <h4 className="font-medium text-sm">버전 이력</h4>
                    <div className="space-y-2">
                      {selectedInstruction.versions.map((v, idx) => (
                        <div
                          key={v.version}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-sm",
                            idx === 0 ? "bg-primary/10 border border-primary/30" : "bg-background"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={idx === 0 ? "default" : "secondary"}>v{v.version}</Badge>
                            <span>{v.updatedBy}</span>
                          </div>
                          <span className="text-muted-foreground">{v.updatedAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    지침명
                  </label>
                  <Input defaultValue={selectedInstruction.name} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    {selectedInstruction.isPublic ? "유형" : "시스템"}
                  </label>
                  {!selectedInstruction.isPublic ? (
                    <Popover open={editSystemOpen} onOpenChange={setEditSystemOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={editSystemOpen}
                          className="w-full justify-between"
                        >
                          {editSelectedSystem
                            ? systems.find((s) => s.id === editSelectedSystem)?.name
                            : selectedInstruction.systemName || "시스템 선택"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0 z-50">
                        <Command>
                          <CommandInput placeholder="시스템 검색..." />
                          <CommandList>
                            <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                            <CommandGroup>
                              {systems.map((s) => (
                                <CommandItem
                                  key={s.id}
                                  value={s.name}
                                  onSelect={() => {
                                    setEditSelectedSystem(s.id);
                                    setEditSystemOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (editSelectedSystem === s.id || (!editSelectedSystem && selectedInstruction.systemId === s.id))
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {s.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm p-2 bg-secondary/30 rounded-lg">공용 지침</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    설명
                  </label>
                  <Textarea defaultValue={selectedInstruction.description} rows={2} />
                </div>

                {/* Tool 선택 */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Tool 선택
                    <span className="text-xs text-primary">({editSelectedTools.length}개)</span>
                  </label>
                  <div className="p-2 rounded-lg border border-border bg-secondary/20 max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1">
                      {mockTools.map((tool) => (
                        <label
                          key={tool.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                            editSelectedTools.includes(tool.id)
                              ? "bg-primary/10 border border-primary/30"
                              : "bg-background hover:bg-secondary/50"
                          )}
                        >
                          <Checkbox
                            checked={editSelectedTools.includes(tool.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEditSelectedTools([...editSelectedTools, tool.id]);
                              } else {
                                setEditSelectedTools(editSelectedTools.filter((id) => id !== tool.id));
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tool.name}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 지식 선택 */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    지식 선택
                    <span className="text-xs text-primary">({editSelectedKnowledge.length}개)</span>
                  </label>
                  <div className="p-2 rounded-lg border border-border bg-secondary/20 max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1">
                      {mockKnowledge.map((knowledge) => (
                        <label
                          key={knowledge.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                            editSelectedKnowledge.includes(knowledge.id)
                              ? "bg-primary/10 border border-primary/30"
                              : "bg-background hover:bg-secondary/50"
                          )}
                        >
                          <Checkbox
                            checked={editSelectedKnowledge.includes(knowledge.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEditSelectedKnowledge([...editSelectedKnowledge, knowledge.id]);
                              } else {
                                setEditSelectedKnowledge(editSelectedKnowledge.filter((id) => id !== knowledge.id));
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              {knowledge.type === "RAG" ? (
                                <Database className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              ) : (
                                <BookOpen className="w-3 h-3 text-green-500 flex-shrink-0" />
                              )}
                              <p className="text-sm font-medium truncate">{knowledge.name}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: Markdown 편집 영역 */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    지침 내용 (Markdown)
                  </label>
                  <Button
                    variant={showMarkdownPreview ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showMarkdownPreview ? "편집" : "MD 보기"}
                  </Button>
                </div>
                {showMarkdownPreview ? (
                  <div className="flex-1 p-4 bg-secondary/30 rounded-lg overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{editContent}</ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 font-mono text-sm resize-none"
                  />
                )}
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
              {createType === "public" ? (
                <>
                  <Globe className="w-5 h-5 text-blue-500" />
                  공용 지침 추가
                </>
              ) : (
                <>
                  <Server className="w-5 h-5 text-green-500" />
                  시스템별 지침 추가
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-6 py-4 h-[calc(90vh-180px)]">
            {/* 좌측: 기본 정보 및 Tool/지식 선택 */}
            <div className="w-[400px] flex-shrink-0 space-y-4 overflow-y-auto pr-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">지침명</label>
                <Input placeholder="지침 이름 입력" />
              </div>

              {createType === "system" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">시스템</label>
                  <Popover open={createSystemOpen} onOpenChange={setCreateSystemOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={createSystemOpen}
                        className="w-full justify-between"
                      >
                        {createSelectedSystem
                          ? systems.find((s) => s.id === createSelectedSystem)?.name
                          : "시스템 선택"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 z-50">
                      <Command>
                        <CommandInput placeholder="시스템 검색..." />
                        <CommandList>
                          <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                          <CommandGroup>
                            {systems.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={s.name}
                                onSelect={() => {
                                  setCreateSelectedSystem(s.id);
                                  setCreateSystemOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    createSelectedSystem === s.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {s.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">설명</label>
                <Textarea placeholder="지침 설명 입력" rows={2} />
              </div>

              {/* Tool 선택 */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tool 선택
                </label>
                <div className="p-2 rounded-lg border border-border bg-secondary/20 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1">
                    {mockTools.map((tool) => (
                      <label
                        key={tool.id}
                        className="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors bg-background hover:bg-secondary/50"
                      >
                        <Checkbox />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tool.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 지식 선택 */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  지식 선택
                </label>
                <div className="p-2 rounded-lg border border-border bg-secondary/20 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1">
                    {mockKnowledge.map((knowledge) => (
                      <label
                        key={knowledge.id}
                        className="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors bg-background hover:bg-secondary/50"
                      >
                        <Checkbox />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {knowledge.type === "RAG" ? (
                              <Database className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            ) : (
                              <BookOpen className="w-3 h-3 text-green-500 flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium truncate">{knowledge.name}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: Markdown 편집 영역 */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  지침 내용 (Markdown)
                </label>
                <Button
                  variant={showCreateMarkdownPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowCreateMarkdownPreview(!showCreateMarkdownPreview)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showCreateMarkdownPreview ? "편집" : "MD 보기"}
                </Button>
              </div>
              {showCreateMarkdownPreview ? (
                <div className="flex-1 p-4 bg-secondary/30 rounded-lg overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{createContent}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  placeholder="지침 내용을 Markdown 형식으로 입력하세요..."
                  className="flex-1 font-mono text-sm resize-none"
                />
              )}
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

      {/* Worker 지침 상세/편집 Modal */}
      <Dialog open={isWorkerDetailModalOpen} onOpenChange={setIsWorkerDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              Worker 지침 편집
            </DialogTitle>
          </DialogHeader>

          {selectedWorkerInstruction && (
            <div className="flex gap-6 py-4 h-[calc(90vh-200px)]">
              {/* 좌측: 기본 정보 */}
              <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pr-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    지침명
                  </label>
                  <Input 
                    value={workerEditName}
                    onChange={(e) => setWorkerEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    시스템
                  </label>
                  <Popover open={workerEditSystemOpen} onOpenChange={setWorkerEditSystemOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={workerEditSystemOpen}
                        className="w-full justify-between"
                      >
                        {workerEditSystem
                          ? systems.find((s) => s.id === workerEditSystem)?.name
                          : "시스템 선택"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0 z-50">
                      <Command>
                        <CommandInput placeholder="시스템 검색..." />
                        <CommandList>
                          <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                          <CommandGroup>
                            {systems.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={s.name}
                                onSelect={() => {
                                  setWorkerEditSystem(s.id);
                                  setWorkerEditSystemOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    workerEditSystem === s.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {s.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <p className="text-xs text-muted-foreground">
                    작성자: {selectedWorkerInstruction.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    생성일: {selectedWorkerInstruction.createdAt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    수정일: {selectedWorkerInstruction.updatedAt}
                  </p>
                </div>
              </div>

              {/* 우측: Markdown 편집 영역 */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    지침 내용 (Markdown)
                  </label>
                  <Button
                    variant={showWorkerMarkdownPreview ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowWorkerMarkdownPreview(!showWorkerMarkdownPreview)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showWorkerMarkdownPreview ? "편집" : "MD 보기"}
                  </Button>
                </div>
                {showWorkerMarkdownPreview ? (
                  <div className="flex-1 p-4 bg-secondary/30 rounded-lg overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{workerEditContent}</ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    value={workerEditContent}
                    onChange={(e) => setWorkerEditContent(e.target.value)}
                    className="flex-1 font-mono text-sm resize-none"
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkerDetailModalOpen(false)}>
              닫기
            </Button>
            <Button onClick={handleSaveWorkerInstruction}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Worker 지침 생성 Modal */}
      <Dialog open={isWorkerCreateModalOpen} onOpenChange={setIsWorkerCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              Worker 지침 추가
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-6 py-4 h-[calc(90vh-200px)]">
            {/* 좌측: 기본 정보 */}
            <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pr-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">지침명</label>
                <Input 
                  placeholder="Worker 지침명 입력"
                  value={workerCreateName}
                  onChange={(e) => setWorkerCreateName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">시스템</label>
                <Popover open={workerCreateSystemOpen} onOpenChange={setWorkerCreateSystemOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={workerCreateSystemOpen}
                      className="w-full justify-between"
                    >
                      {workerCreateSystem
                        ? systems.find((s) => s.id === workerCreateSystem)?.name
                        : "시스템 선택"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0 z-50">
                    <Command>
                      <CommandInput placeholder="시스템 검색..." />
                      <CommandList>
                        <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                        <CommandGroup>
                          {systems.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.name}
                              onSelect={() => {
                                setWorkerCreateSystem(s.id);
                                setWorkerCreateSystemOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  workerCreateSystem === s.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {s.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 우측: Markdown 편집 영역 */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  지침 내용 (Markdown)
                </label>
                <Button
                  variant={showWorkerCreateMarkdownPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowWorkerCreateMarkdownPreview(!showWorkerCreateMarkdownPreview)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showWorkerCreateMarkdownPreview ? "편집" : "MD 보기"}
                </Button>
              </div>
              {showWorkerCreateMarkdownPreview ? (
                <div className="flex-1 p-4 bg-secondary/30 rounded-lg overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{workerCreateContent}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={workerCreateContent}
                  onChange={(e) => setWorkerCreateContent(e.target.value)}
                  placeholder="Worker 지침 내용을 Markdown 형식으로 입력하세요..."
                  className="flex-1 font-mono text-sm resize-none"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkerCreateModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleCreateWorkerInstruction}
              disabled={!workerCreateName || !workerCreateSystem || !workerCreateContent}
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
