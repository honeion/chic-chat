import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Database,
  Server,
  User,
  Calendar,
  BarChart3,
  FileText,
  Trash2,
  Eye,
  Download,
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
import { Progress } from "@/components/ui/progress";

interface KnowledgeRAGItem {
  id: string;
  name: string;
  systemId: string;
  systemName: string;
  description: string;
  documentCount: number;
  vectorCount: number;
  storageSize: string;
  usageCount: number;
  lastUsed: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "indexing" | "error";
}

const mockKnowledgeRAG: KnowledgeRAGItem[] = [
  {
    id: "kr1",
    name: "시스템 매뉴얼",
    systemId: "s1",
    systemName: "e-총무",
    description: "e-총무 시스템 사용자 매뉴얼 및 운영 가이드",
    documentCount: 45,
    vectorCount: 12500,
    storageSize: "256MB",
    usageCount: 1520,
    lastUsed: "2024-12-09 09:30",
    createdBy: "김철수",
    createdAt: "2024-01-15",
    updatedAt: "2024-12-01",
    status: "active",
  },
  {
    id: "kr2",
    name: "장애 대응 가이드",
    systemId: "s1",
    systemName: "e-총무",
    description: "장애 상황별 대응 절차 및 체크리스트",
    documentCount: 28,
    vectorCount: 8200,
    storageSize: "128MB",
    usageCount: 890,
    lastUsed: "2024-12-08 15:20",
    createdBy: "이영희",
    createdAt: "2024-02-20",
    updatedAt: "2024-11-28",
    status: "active",
  },
  {
    id: "kr3",
    name: "API 문서",
    systemId: "s2",
    systemName: "BiOn",
    description: "BiOn 시스템 API 명세 및 연동 가이드",
    documentCount: 120,
    vectorCount: 35000,
    storageSize: "512MB",
    usageCount: 2340,
    lastUsed: "2024-12-09 10:15",
    createdBy: "박민수",
    createdAt: "2024-03-10",
    updatedAt: "2024-12-05",
    status: "active",
  },
  {
    id: "kr4",
    name: "운영 로그 분석 패턴",
    systemId: "s3",
    systemName: "SATIS",
    description: "SATIS 시스템 로그 분석을 위한 패턴 라이브러리",
    documentCount: 65,
    vectorCount: 18500,
    storageSize: "320MB",
    usageCount: 450,
    lastUsed: "2024-12-07 11:00",
    createdBy: "정다현",
    createdAt: "2024-05-15",
    updatedAt: "2024-11-20",
    status: "indexing",
  },
  {
    id: "kr5",
    name: "ITS 티켓 템플릿",
    systemId: "s4",
    systemName: "ITS",
    description: "ITS 티켓 유형별 처리 템플릿 및 가이드",
    documentCount: 35,
    vectorCount: 9800,
    storageSize: "180MB",
    usageCount: 1100,
    lastUsed: "2024-12-09 08:45",
    createdBy: "최우진",
    createdAt: "2024-04-01",
    updatedAt: "2024-12-08",
    status: "active",
  },
];

const systems = [
  { id: "s1", name: "e-총무" },
  { id: "s2", name: "BiOn" },
  { id: "s3", name: "SATIS" },
  { id: "s4", name: "ITS" },
];

export function KnowledgeRAGManagement() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeRAGItem[]>(mockKnowledgeRAG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeRAGItem | null>(null);

  const filteredItems = knowledgeItems.filter((item) => {
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
  }, {} as Record<string, KnowledgeRAGItem[]>);

  const getStatusBadge = (status: KnowledgeRAGItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-status-online text-white">활성</Badge>;
      case "indexing":
        return <Badge className="bg-status-busy text-white">인덱싱중</Badge>;
      case "error":
        return <Badge variant="destructive">오류</Badge>;
    }
  };

  const totalStats = {
    documents: knowledgeItems.reduce((sum, i) => sum + i.documentCount, 0),
    vectors: knowledgeItems.reduce((sum, i) => sum + i.vectorCount, 0),
    usage: knowledgeItems.reduce((sum, i) => sum + i.usageCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="지식 RAG 검색"
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
          지식 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{knowledgeItems.length}</p>
                <p className="text-xs text-muted-foreground">지식 베이스</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.documents}</p>
                <p className="text-xs text-muted-foreground">총 문서</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalStats.vectors / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">벡터 수</p>
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

      {/* Knowledge List by System */}
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
                    <Badge variant="secondary">{systemItems.length}개 지식베이스</Badge>
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
                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{item.documentCount}개 문서</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Database className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{(item.vectorCount / 1000).toFixed(1)}K 벡터</span>
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
                                setKnowledgeItems(knowledgeItems.filter((i) => i.id !== item.id));
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
              <Database className="w-5 h-5 text-primary" />
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
                  <h4 className="text-sm font-medium mb-3">저장 현황</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">문서 수</span>
                      <span className="font-medium">{selectedItem.documentCount}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">벡터 수</span>
                      <span className="font-medium">{selectedItem.vectorCount.toLocaleString()}</span>
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
            <DialogTitle>지식 RAG 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">이름</label>
              <Input placeholder="지식베이스 이름 입력" />
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
              <Textarea placeholder="지식베이스 설명 입력" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">문서 업로드</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, TXT, MD 파일 지원
                </p>
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
    </div>
  );
}
