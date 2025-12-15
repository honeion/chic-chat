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
  Edit,
  MoreHorizontal,
  Check,
  ChevronsUpDown,
  Upload,
} from "lucide-react";
import { mockSystems } from "@/data/systems";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    systemId: "s1",
    systemName: "e-총무",
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
  {
    id: "kr6",
    name: "BiOn 운영 매뉴얼",
    systemId: "s2",
    systemName: "BiOn",
    description: "BiOn 시스템 운영자 매뉴얼",
    documentCount: 55,
    vectorCount: 15000,
    storageSize: "280MB",
    usageCount: 780,
    lastUsed: "2024-12-08 14:30",
    createdBy: "김철수",
    createdAt: "2024-06-01",
    updatedAt: "2024-11-15",
    status: "active",
  },
];

export function KnowledgeRAGManagement() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeRAGItem[]>(mockKnowledgeRAG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [isSystemSelectOpen, setIsSystemSelectOpen] = useState(false);
  const [systemSearchQuery, setSystemSearchQuery] = useState("");
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeRAGItem | null>(null);
  
  // Create modal state
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [isCreateSystemSelectOpen, setIsCreateSystemSelectOpen] = useState(false);
  const [createSystemId, setCreateSystemId] = useState("");
  const [createSystemName, setCreateSystemName] = useState("");
  const [createSystemSearchQuery, setCreateSystemSearchQuery] = useState("");

  const activeSystemsList = mockSystems.filter(s => s.isActive);
  const filteredSystemsList = activeSystemsList.filter(s =>
    s.name.toLowerCase().includes(systemSearchQuery.toLowerCase()) ||
    s.shortName.toLowerCase().includes(systemSearchQuery.toLowerCase())
  );
  const filteredCreateSystemsList = activeSystemsList.filter(s =>
    s.name.toLowerCase().includes(createSystemSearchQuery.toLowerCase()) ||
    s.shortName.toLowerCase().includes(createSystemSearchQuery.toLowerCase())
  );

  const selectedSystem = activeSystemsList.find(s => s.id === selectedSystemId);

  const filteredItems = knowledgeItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = !selectedSystemId || item.systemId === selectedSystemId;
    return matchesSearch && matchesSystem;
  });

  const getStatusBadge = (status: KnowledgeRAGItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-status-online text-white text-xs">활성</Badge>;
      case "indexing":
        return <Badge className="bg-status-busy text-white text-xs">인덱싱중</Badge>;
      case "error":
        return <Badge variant="destructive" className="text-xs">오류</Badge>;
    }
  };

  const handleDelete = (id: string) => {
    setKnowledgeItems(knowledgeItems.filter((i) => i.id !== id));
  };

  const openDetailModal = (item: KnowledgeRAGItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const openCreateModal = () => {
    setCreateName("");
    setCreateDescription("");
    setCreateSystemId(selectedSystemId);
    setCreateSystemName(selectedSystem?.shortName || "");
    setCreateSystemSearchQuery("");
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    if (!createName.trim() || !createSystemId) return;
    
    const newItem: KnowledgeRAGItem = {
      id: `kr${Date.now()}`,
      name: createName.trim(),
      systemId: createSystemId,
      systemName: createSystemName,
      description: createDescription.trim(),
      documentCount: 0,
      vectorCount: 0,
      storageSize: "0MB",
      usageCount: 0,
      lastUsed: "-",
      createdBy: "현재 사용자",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: "active",
    };
    
    setKnowledgeItems([...knowledgeItems, newItem]);
    setIsCreateModalOpen(false);
  };

  // Get system stats
  const getSystemStats = (systemId: string) => {
    const systemItems = knowledgeItems.filter(i => i.systemId === systemId);
    return {
      count: systemItems.length,
      documents: systemItems.reduce((sum, i) => sum + i.documentCount, 0),
      vectors: systemItems.reduce((sum, i) => sum + i.vectorCount, 0),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* System Selector */}
          <Popover open={isSystemSelectOpen} onOpenChange={setIsSystemSelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isSystemSelectOpen}
                className="w-[240px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span>{selectedSystem?.shortName || "시스템 선택"}</span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-popover border z-50" align="start">
              <Command>
                <CommandInput 
                  placeholder="시스템 검색..." 
                  value={systemSearchQuery}
                  onValueChange={setSystemSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
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
                      <span>전체 시스템</span>
                    </CommandItem>
                    {filteredSystemsList.map((system) => {
                      const stats = getSystemStats(system.id);
                      return (
                        <CommandItem
                          key={system.id}
                          value={system.name}
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
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">{system.shortName}</span>
                            <span className="text-xs text-muted-foreground">{system.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {stats.count}개
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="지식 RAG 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          지식 추가
        </Button>
      </div>

      {/* System Info Card (when system selected) */}
      {selectedSystem && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedSystem.shortName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSystem.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{getSystemStats(selectedSystemId).count}</p>
                  <p className="text-xs text-muted-foreground">지식 베이스</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{getSystemStats(selectedSystemId).documents}</p>
                  <p className="text-xs text-muted-foreground">문서 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{(getSystemStats(selectedSystemId).vectors / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">벡터 수</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge List Table */}
      {!selectedSystemId ? (
        <p className="text-center py-8 text-muted-foreground">
          시스템을 선택하면 해당 시스템의 지식 RAG 목록이 표시됩니다.
        </p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">지식명</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="w-[80px]">문서</TableHead>
                <TableHead className="w-[80px]">벡터</TableHead>
                <TableHead className="w-[80px]">용량</TableHead>
                <TableHead className="w-[80px]">사용횟수</TableHead>
                <TableHead className="w-[80px]">상태</TableHead>
                <TableHead className="w-[100px]">수정일</TableHead>
                <TableHead className="w-[80px] text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    등록된 지식 RAG가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => openDetailModal(item)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Database className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-sm">{item.documentCount}개</TableCell>
                    <TableCell className="text-sm">{(item.vectorCount / 1000).toFixed(1)}K</TableCell>
                    <TableCell className="text-sm">{item.storageSize}</TableCell>
                    <TableCell className="text-sm">{item.usageCount}회</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.updatedAt}</TableCell>
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
                              openDetailModal(item);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            상세보기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            문서 업로드
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            내보내기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
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
      )}

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
                <Badge variant="outline">
                  <Server className="w-3 h-3 mr-1" />
                  {selectedItem.systemName}
                </Badge>
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
              <Upload className="w-4 h-4" />
              문서 업로드
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
              <label className="text-sm font-medium mb-1.5 block">
                시스템 <span className="text-destructive">*</span>
              </label>
              <Popover open={isCreateSystemSelectOpen} onOpenChange={setIsCreateSystemSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCreateSystemSelectOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-primary" />
                      <span>{createSystemName || "시스템 선택"}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover border z-50" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="시스템 검색..." 
                      value={createSystemSearchQuery}
                      onValueChange={setCreateSystemSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                      <CommandGroup>
                        {filteredCreateSystemsList.map((system) => (
                          <CommandItem
                            key={system.id}
                            value={system.name}
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
                            <div className="flex flex-col">
                              <span className="font-medium">{system.shortName}</span>
                              <span className="text-xs text-muted-foreground">{system.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                이름 <span className="text-destructive">*</span>
              </label>
              <Input 
                placeholder="지식베이스 이름 입력" 
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea 
                placeholder="지식베이스 설명 입력" 
                rows={3}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!createName.trim() || !createSystemId}
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
