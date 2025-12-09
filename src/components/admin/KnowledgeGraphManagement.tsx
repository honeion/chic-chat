import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  GitBranch,
  Server,
  User,
  Calendar,
  BarChart3,
  Trash2,
  Eye,
  Download,
  Network,
  Layers,
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

interface KnowledgeGraphItem {
  id: string;
  name: string;
  systemId: string;
  systemName: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  entityTypes: string[];
  relationTypes: string[];
  storageSize: string;
  usageCount: number;
  lastUsed: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "building" | "error";
}

const mockKnowledgeGraph: KnowledgeGraphItem[] = [
  {
    id: "kg1",
    name: "시스템 구성도",
    systemId: "s1",
    systemName: "e-총무",
    description: "e-총무 시스템 구성요소 및 의존관계 그래프",
    nodeCount: 245,
    edgeCount: 580,
    entityTypes: ["서버", "서비스", "DB", "API"],
    relationTypes: ["depends_on", "connects_to", "contains"],
    storageSize: "45MB",
    usageCount: 320,
    lastUsed: "2024-12-09 08:30",
    createdBy: "김철수",
    createdAt: "2024-02-15",
    updatedAt: "2024-12-01",
    status: "active",
  },
  {
    id: "kg2",
    name: "장애 연관 그래프",
    systemId: "s1",
    systemName: "e-총무",
    description: "장애 유형 간 연관관계 및 원인-결과 그래프",
    nodeCount: 180,
    edgeCount: 420,
    entityTypes: ["장애유형", "원인", "증상", "해결방법"],
    relationTypes: ["causes", "indicates", "resolves"],
    storageSize: "32MB",
    usageCount: 185,
    lastUsed: "2024-12-08 14:20",
    createdBy: "이영희",
    createdAt: "2024-03-20",
    updatedAt: "2024-11-28",
    status: "active",
  },
  {
    id: "kg3",
    name: "API 의존성 그래프",
    systemId: "s2",
    systemName: "BiOn",
    description: "BiOn API 엔드포인트 간 호출 관계 그래프",
    nodeCount: 520,
    edgeCount: 1450,
    entityTypes: ["API", "모듈", "데이터모델", "인증"],
    relationTypes: ["calls", "returns", "requires"],
    storageSize: "128MB",
    usageCount: 890,
    lastUsed: "2024-12-09 09:45",
    createdBy: "박민수",
    createdAt: "2024-04-10",
    updatedAt: "2024-12-05",
    status: "active",
  },
  {
    id: "kg4",
    name: "데이터 플로우 그래프",
    systemId: "s3",
    systemName: "SATIS",
    description: "SATIS 시스템 데이터 흐름 및 변환 관계",
    nodeCount: 380,
    edgeCount: 920,
    entityTypes: ["데이터소스", "변환", "저장소", "출력"],
    relationTypes: ["flows_to", "transforms", "stores"],
    storageSize: "78MB",
    usageCount: 245,
    lastUsed: "2024-12-07 16:30",
    createdBy: "정다현",
    createdAt: "2024-05-15",
    updatedAt: "2024-11-20",
    status: "building",
  },
];

const systems = [
  { id: "s1", name: "e-총무" },
  { id: "s2", name: "BiOn" },
  { id: "s3", name: "SATIS" },
  { id: "s4", name: "ITS" },
];

export function KnowledgeGraphManagement() {
  const [graphItems, setGraphItems] = useState<KnowledgeGraphItem[]>(mockKnowledgeGraph);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeGraphItem | null>(null);

  const filteredItems = graphItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === "all" || item.systemId === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  // Group by system
  const itemsBySystem = systems.reduce((acc, system) => {
    acc[system.id] = filteredItems.filter((i) => i.systemId === system.id);
    return acc;
  }, {} as Record<string, KnowledgeGraphItem[]>);

  const getStatusBadge = (status: KnowledgeGraphItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-status-online text-white">활성</Badge>;
      case "building":
        return <Badge className="bg-status-busy text-white">구축중</Badge>;
      case "error":
        return <Badge variant="destructive">오류</Badge>;
    }
  };

  const totalStats = {
    nodes: graphItems.reduce((sum, i) => sum + i.nodeCount, 0),
    edges: graphItems.reduce((sum, i) => sum + i.edgeCount, 0),
    usage: graphItems.reduce((sum, i) => sum + i.usageCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="지식 Graph 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm min-w-[120px]"
          >
            <option value="all">전체 시스템</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          그래프 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{graphItems.length}</p>
                <p className="text-xs text-muted-foreground">지식 그래프</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalStats.nodes / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">총 노드</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalStats.edges / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">총 엣지</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-online/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-status-online" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalStats.usage / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">총 사용횟수</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graph List by System */}
      <div className="space-y-4">
        {systems
          .filter((s) => selectedSystem === "all" || s.id === selectedSystem)
          .map((system) => {
            const systemItems = itemsBySystem[system.id] || [];
            if (systemItems.length === 0) return null;

            return (
              <Card key={system.id}>
                <CardHeader className="bg-primary/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      {system.name}
                    </CardTitle>
                    <Badge variant="secondary">{systemItems.length}개 그래프</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {systemItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {getStatusBadge(item.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <div className="grid grid-cols-4 gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <Network className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{item.nodeCount}개 노드</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{item.edgeCount}개 엣지</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{item.usageCount}회 사용</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{item.createdBy}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGraphItems(graphItems.filter((i) => i.id !== item.id));
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                {getStatusBadge(selectedItem.status)}
                <Badge variant="outline">{selectedItem.systemName}</Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                <p className="text-sm p-3 rounded-lg bg-secondary/30">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-medium mb-3">그래프 구조</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">노드 수</span>
                      <span className="font-medium">{selectedItem.nodeCount}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">엣지 수</span>
                      <span className="font-medium">{selectedItem.edgeCount}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">저장 용량</span>
                      <span className="font-medium">{selectedItem.storageSize}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-medium mb-3">사용 현황</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">총 사용 횟수</span>
                      <span className="font-medium">{selectedItem.usageCount}회</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">최근 사용</span>
                      <span className="font-medium">{selectedItem.lastUsed}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="text-sm font-medium mb-3">스키마</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">엔티티 타입</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.entityTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">관계 타입</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.relationTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="text-sm font-medium mb-3">관리 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">생성자:</span>
                    <span>{selectedItem.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">생성일:</span>
                    <span>{selectedItem.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">수정일:</span>
                    <span>{selectedItem.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              닫기
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>지식 Graph 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">이름</label>
              <Input placeholder="그래프 이름 입력" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">시스템</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="">시스템 선택</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea placeholder="그래프 설명 입력" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">엔티티 타입 (쉼표로 구분)</label>
              <Input placeholder="서버, 서비스, DB, API" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">관계 타입 (쉼표로 구분)</label>
              <Input placeholder="depends_on, connects_to, contains" />
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
