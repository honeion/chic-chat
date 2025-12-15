import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  GitBranch,
  User,
  Calendar,
  BarChart3,
  Trash2,
  Eye,
  Upload,
  Download,
  Network,
  Layers,
  MoreHorizontal,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { mockSystems } from "@/data/systems";

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

export function KnowledgeGraphManagement() {
  const [graphItems, setGraphItems] = useState<KnowledgeGraphItem[]>(mockKnowledgeGraph);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [isSystemSelectOpen, setIsSystemSelectOpen] = useState(false);
  const [systemSearchQuery, setSystemSearchQuery] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeGraphItem | null>(null);

  // Create modal state
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSystemId, setCreateSystemId] = useState("");
  const [createSystemName, setCreateSystemName] = useState("");
  const [isCreateSystemSelectOpen, setIsCreateSystemSelectOpen] = useState(false);
  const [createSystemSearchQuery, setCreateSystemSearchQuery] = useState("");

  // Get active systems list
  const activeSystemsList = useMemo(() => {
    return mockSystems.filter((s) => s.isActive);
  }, []);

  const filteredSystemsList = useMemo(() => {
    return activeSystemsList.filter((s) =>
      s.name.toLowerCase().includes(systemSearchQuery.toLowerCase()) ||
      s.shortName.toLowerCase().includes(systemSearchQuery.toLowerCase())
    );
  }, [activeSystemsList, systemSearchQuery]);

  const filteredCreateSystemsList = useMemo(() => {
    return activeSystemsList.filter((s) =>
      s.name.toLowerCase().includes(createSystemSearchQuery.toLowerCase()) ||
      s.shortName.toLowerCase().includes(createSystemSearchQuery.toLowerCase())
    );
  }, [activeSystemsList, createSystemSearchQuery]);

  const selectedSystem = useMemo(() => {
    return activeSystemsList.find((s) => s.id === selectedSystemId);
  }, [activeSystemsList, selectedSystemId]);

  const filteredItems = useMemo(() => {
    return graphItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSystem = !selectedSystemId || item.systemId === selectedSystemId;
      return matchesSearch && matchesSystem;
    });
  }, [graphItems, searchQuery, selectedSystemId]);

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

  const handleDelete = (id: string) => {
    setGraphItems(graphItems.filter((i) => i.id !== id));
  };

  const openDetailModal = (item: KnowledgeGraphItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const openCreateModal = () => {
    setCreateName("");
    setCreateDescription("");
    setCreateSystemId("");
    setCreateSystemName("");
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    if (!createName || !createSystemId) return;
    
    const newItem: KnowledgeGraphItem = {
      id: `kg${Date.now()}`,
      name: createName,
      systemId: createSystemId,
      systemName: createSystemName,
      description: createDescription,
      nodeCount: 0,
      edgeCount: 0,
      entityTypes: [],
      relationTypes: [],
      storageSize: "0MB",
      usageCount: 0,
      lastUsed: "-",
      createdBy: "현재 사용자",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      status: "building",
    };
    
    setGraphItems([...graphItems, newItem]);
    setIsCreateModalOpen(false);
  };

  const getSystemStats = () => {
    const items = selectedSystemId 
      ? graphItems.filter((i) => i.systemId === selectedSystemId)
      : graphItems;
    
    return {
      total: items.length,
      active: items.filter((i) => i.status === "active").length,
      building: items.filter((i) => i.status === "building").length,
      nodes: items.reduce((sum, i) => sum + i.nodeCount, 0),
      edges: items.reduce((sum, i) => sum + i.edgeCount, 0),
      usage: items.reduce((sum, i) => sum + i.usageCount, 0),
    };
  };

  const stats = getSystemStats();

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* System Selector */}
          <Popover open={isSystemSelectOpen} onOpenChange={setIsSystemSelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isSystemSelectOpen}
                className="w-[200px] justify-between"
              >
                {selectedSystem ? selectedSystem.shortName : "시스템 선택"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 z-50 bg-background border border-border">
              <Command>
                <CommandInput
                  placeholder="시스템 검색..."
                  value={systemSearchQuery}
                  onValueChange={setSystemSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedSystemId("");
                        setIsSystemSelectOpen(false);
                        setSystemSearchQuery("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !selectedSystemId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      전체 시스템
                    </CommandItem>
                    {filteredSystemsList.map((system) => (
                      <CommandItem
                        key={system.id}
                        onSelect={() => {
                          setSelectedSystemId(system.id);
                          setIsSystemSelectOpen(false);
                          setSystemSearchQuery("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSystemId === system.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {system.shortName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="지식 그래프 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          그래프 추가
        </Button>
      </div>

      {/* Stats for Selected System */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {selectedSystem ? selectedSystem.shortName : "전체"} 지식 그래프
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">전체:</span>
                <span className="font-medium">{stats.total}개</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">활성:</span>
                <span className="font-medium text-status-online">{stats.active}개</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">구축중:</span>
                <span className="font-medium text-status-busy">{stats.building}개</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">노드:</span>
                <span className="font-medium">{stats.nodes.toLocaleString()}개</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">엣지:</span>
                <span className="font-medium">{stats.edges.toLocaleString()}개</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">사용:</span>
                <span className="font-medium">{stats.usage.toLocaleString()}회</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">그래프명</TableHead>
                <TableHead className="w-[100px]">시스템</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="w-[80px] text-right">노드</TableHead>
                <TableHead className="w-[80px] text-right">엣지</TableHead>
                <TableHead className="w-[80px] text-right">용량</TableHead>
                <TableHead className="w-[80px] text-right">사용횟수</TableHead>
                <TableHead className="w-[80px] text-center">상태</TableHead>
                <TableHead className="w-[100px]">수정일</TableHead>
                <TableHead className="w-[80px] text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {selectedSystemId
                      ? "선택한 시스템에 등록된 지식 그래프가 없습니다."
                      : "등록된 지식 그래프가 없습니다."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-secondary/30">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.systemName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">{item.nodeCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.edgeCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.storageSize}</TableCell>
                    <TableCell className="text-right">{item.usageCount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.updatedAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border border-border z-50">
                          <DropdownMenuItem onClick={() => openDetailModal(item)}>
                            <Eye className="w-4 h-4 mr-2" />
                            상세보기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Upload className="w-4 h-4 mr-2" />
                            데이터 업로드
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            내보내기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive focus:text-destructive"
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
        </CardContent>
      </Card>

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
                      <span className="font-medium">{selectedItem.nodeCount.toLocaleString()}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">엣지 수</span>
                      <span className="font-medium">{selectedItem.edgeCount.toLocaleString()}개</span>
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
                      <span className="font-medium">{selectedItem.usageCount.toLocaleString()}회</span>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              지식 그래프 추가
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">시스템 선택</label>
              <Popover open={isCreateSystemSelectOpen} onOpenChange={setIsCreateSystemSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCreateSystemSelectOpen}
                    className="w-full justify-between"
                  >
                    {createSystemName || "시스템 선택"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 z-50 bg-background border border-border">
                  <Command>
                    <CommandInput
                      placeholder="시스템 검색..."
                      value={createSystemSearchQuery}
                      onValueChange={setCreateSystemSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                      <CommandGroup>
                        {filteredCreateSystemsList.map((system) => (
                          <CommandItem
                            key={system.id}
                            onSelect={() => {
                              setCreateSystemId(system.id);
                              setCreateSystemName(system.shortName);
                              setIsCreateSystemSelectOpen(false);
                              setCreateSystemSearchQuery("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                createSystemId === system.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {system.shortName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">그래프명</label>
              <Input
                placeholder="지식 그래프 이름 입력"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea
                placeholder="지식 그래프 설명 입력"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={!createName || !createSystemId}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
