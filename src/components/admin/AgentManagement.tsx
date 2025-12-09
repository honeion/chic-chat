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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface AgentVersion {
  version: string;
  changes: string;
  publishedAt: string;
  publishedBy: string;
}

interface AgentData {
  id: string;
  name: string;
  description: string;
  steps: string[];
  instructions: string;
  tools: string[];
  knowledgeBases: string[];
  isPublished: boolean;
  currentVersion: string;
  versions: AgentVersion[];
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
    instructions: "매일 09시에 실행하여 시스템 상태를 점검하고 보고서를 생성합니다.",
    tools: ["Health Check", "DB Connect", "Report Gen"],
    knowledgeBases: ["시스템 매뉴얼", "장애 대응 가이드"],
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
    instructions: "장애 발생 시 자동으로 로그를 분석하고 담당자에게 알림을 보냅니다.",
    tools: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"],
    knowledgeBases: ["장애 대응 SOP", "연락처 목록"],
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
    instructions: "매일 자정에 DB 백업을 수행하고 무결성을 검증합니다.",
    tools: ["DB Connect", "Backup", "Verify"],
    knowledgeBases: ["백업 정책"],
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

export function AgentManagement() {
  const [agents, setAgents] = useState<AgentData[]>(mockAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

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

  const togglePublish = (agentId: string) => {
    setAgents(
      agents.map((a) => (a.id === agentId ? { ...a, isPublished: !a.isPublished } : a))
    );
  };

  const handleDelete = (agentId: string) => {
    setAgents(agents.filter((a) => a.id !== agentId));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Agent 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            {(["all", "published", "draft"] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterPublished === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterPublished(filter)}
              >
                {filter === "all" ? "전체" : filter === "published" ? "게시됨" : "초안"}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Agent 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
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
        <Card>
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
        <Card>
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

      {/* Agent List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <Card
            key={agent.id}
            className={cn(
              "cursor-pointer hover:border-primary/50 transition-colors",
              !agent.isPublished && "opacity-70"
            )}
            onClick={() => {
              setSelectedAgent(agent);
              setIsDetailModalOpen(true);
            }}
          >
            <CardHeader className="bg-primary/10 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        v{agent.currentVersion}
                      </Badge>
                      {agent.isPublished ? (
                        <Badge className="bg-status-online text-white text-xs">게시됨</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          초안
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
              <div className="flex flex-wrap gap-1">
                {agent.steps.slice(0, 3).map((step) => (
                  <Badge key={step} variant="secondary" className="text-xs">
                    {step}
                  </Badge>
                ))}
                {agent.steps.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.steps.length - 3}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                <span>생성: {agent.createdBy}</span>
                <span>{agent.versions.length}개 버전</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                {selectedAgent?.name}
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
            <div className="space-y-4 py-4">
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
                <Input defaultValue={selectedAgent.name} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                <Textarea defaultValue={selectedAgent.description} rows={2} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  실행 단계
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-secondary/30">
                  {selectedAgent.steps.map((step, idx) => (
                    <Badge key={step} variant="secondary">
                      {idx + 1}. {step}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  지침
                </label>
                <Textarea defaultValue={selectedAgent.instructions} rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    사용 도구
                  </label>
                  <div className="flex flex-wrap gap-1 p-3 rounded-lg bg-secondary/30">
                    {selectedAgent.tools.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    지식베이스
                  </label>
                  <div className="flex flex-wrap gap-1 p-3 rounded-lg bg-secondary/30">
                    {selectedAgent.knowledgeBases.map((kb) => (
                      <Badge key={kb} variant="outline" className="text-xs">
                        {kb}
                      </Badge>
                    ))}
                  </div>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agent 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Agent 이름</label>
              <Input placeholder="Agent 이름 입력" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea placeholder="Agent 설명 입력" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">실행 단계 (쉼표로 구분)</label>
              <Input placeholder="Health Check, Log Analyzer, Report Gen" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">지침</label>
              <Textarea placeholder="Agent 동작 지침 입력" rows={4} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="publish" />
              <label htmlFor="publish" className="text-sm">
                바로 게시
              </label>
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
    </div>
  );
}
