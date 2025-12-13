import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Server,
  Globe,
  Cloud,
  ExternalLink,
  Copy,
  Check,
  X,
  Monitor,
  Database,
  Link,
  FileCode,
  HelpCircle,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { SystemData, mockSystems, systemTypes, SystemType } from "@/data/systems";

export function SystemManagement() {
  const [systems, setSystems] = useState<SystemData[]>(mockSystems);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | SystemType>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<SystemData | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    systemType: "WEB" as SystemType,
    url: "",
    apiEndpoint: "",
    namespace: "",
    mcpServer: "",
    manager: "",
    isActive: true,
  });

  const filteredSystems = systems.filter((system) => {
    const matchesSearch =
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.manager.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && system.isActive) ||
      (activeFilter === "inactive" && !system.isActive);
    
    const matchesType = typeFilter === "all" || system.systemType === typeFilter;
    
    return matchesSearch && matchesActive && matchesType;
  });

  const getStatusBadge = (status: SystemData["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-status-online text-white">운영중</Badge>;
      case "maintenance":
        return <Badge className="bg-status-busy text-white">점검중</Badge>;
      case "inactive":
        return <Badge variant="secondary">비활성</Badge>;
    }
  };

  const getTypeBadge = (type: SystemType) => {
    const colorMap: Record<SystemType, string> = {
      "WEB": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "C/S": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "API": "bg-green-500/20 text-green-400 border-green-500/30",
      "IF": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "기타": "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      <Badge variant="outline" className={colorMap[type]}>
        {type}
      </Badge>
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCreate = () => {
    const newSystem: SystemData = {
      id: `s${Date.now()}`,
      ...createForm,
      svc: `${createForm.name.toLowerCase()}-svc`,
      spec: { cpu: "4 vCPU", memory: "16GB", storage: "500GB" },
      status: createForm.isActive ? "active" : "inactive",
      managers: [createForm.manager],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setSystems([...systems, newSystem]);
    setIsCreateModalOpen(false);
    setCreateForm({
      name: "",
      description: "",
      systemType: "WEB",
      url: "",
      apiEndpoint: "",
      namespace: "",
      mcpServer: "",
      manager: "",
      isActive: true,
    });
  };

  const handleDelete = (id: string) => {
    setSystems(systems.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="시스템 검색 (이름, 설명, 담당자)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          시스템 추가
        </Button>
      </div>

      {/* Filter Stats - 시스템유형 */}
      <div className="grid grid-cols-6 gap-3">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
            typeFilter === "all" && "ring-2 ring-primary"
          )}
          onClick={() => setTypeFilter("all")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.length}</p>
                <p className="text-xs text-muted-foreground">전체</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-blue-500/50",
            typeFilter === "WEB" && "ring-2 ring-blue-500"
          )}
          onClick={() => setTypeFilter("WEB")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => s.systemType === "WEB").length}</p>
                <p className="text-xs text-muted-foreground">WEB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-purple-500/50",
            typeFilter === "C/S" && "ring-2 ring-purple-500"
          )}
          onClick={() => setTypeFilter("C/S")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => s.systemType === "C/S").length}</p>
                <p className="text-xs text-muted-foreground">C/S</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-green-500/50",
            typeFilter === "API" && "ring-2 ring-green-500"
          )}
          onClick={() => setTypeFilter("API")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FileCode className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => s.systemType === "API").length}</p>
                <p className="text-xs text-muted-foreground">API</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-orange-500/50",
            typeFilter === "IF" && "ring-2 ring-orange-500"
          )}
          onClick={() => setTypeFilter("IF")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Link className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => s.systemType === "IF").length}</p>
                <p className="text-xs text-muted-foreground">IF</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-gray-500/50",
            typeFilter === "기타" && "ring-2 ring-gray-500"
          )}
          onClick={() => setTypeFilter("기타")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => s.systemType === "기타").length}</p>
                <p className="text-xs text-muted-foreground">기타</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Stats - 사용여부 */}
      <div className="grid grid-cols-3 gap-3 max-w-md">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
            activeFilter === "all" && "ring-2 ring-primary"
          )}
          onClick={() => setActiveFilter("all")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.length}</p>
                <p className="text-xs text-muted-foreground">전체</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-status-online/50",
            activeFilter === "active" && "ring-2 ring-status-online"
          )}
          onClick={() => setActiveFilter("active")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-status-online/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-status-online" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => s.isActive).length}</p>
                <p className="text-xs text-muted-foreground">사용</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-muted-foreground/50",
            activeFilter === "inactive" && "ring-2 ring-muted-foreground"
          )}
          onClick={() => setActiveFilter("inactive")}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">{systems.filter(s => !s.isActive).length}</p>
                <p className="text-xs text-muted-foreground">미사용</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px]">시스템명</TableHead>
              <TableHead className="w-[100px]">시스템유형</TableHead>
              <TableHead className="w-[200px]">설명</TableHead>
              <TableHead className="w-[100px]">담당자</TableHead>
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead className="w-[80px] text-center">사용여부</TableHead>
              <TableHead className="w-[100px] text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSystems.map((system) => (
              <TableRow
                key={system.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => {
                  setSelectedSystem(system);
                  setIsDetailModalOpen(true);
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    {system.name}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(system.systemType)}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[200px]">
                  {system.description}
                </TableCell>
                <TableCell>{system.manager}</TableCell>
                <TableCell>{getStatusBadge(system.status)}</TableCell>
                <TableCell className="text-center">
                  {system.isActive ? (
                    <Check className="w-4 h-4 text-status-online mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSystem(system);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(system.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              {selectedSystem?.name} 상세 정보
            </DialogTitle>
          </DialogHeader>
          {selectedSystem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    시스템명
                  </label>
                  <Input defaultValue={selectedSystem.name} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    시스템유형
                  </label>
                  <Select defaultValue={selectedSystem.systemType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {systemTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    담당자
                  </label>
                  <Input defaultValue={selectedSystem.manager} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    상태
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    {getStatusBadge(selectedSystem.status)}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">사용여부</span>
                      <Switch defaultChecked={selectedSystem.isActive} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                <Textarea defaultValue={selectedSystem.description} rows={2} />
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  접속 정보
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">URL</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input defaultValue={selectedSystem.url} className="flex-1" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedSystem.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={selectedSystem.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">API Endpoint</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input defaultValue={selectedSystem.apiEndpoint} className="flex-1" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedSystem.apiEndpoint)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  인프라 정보
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Namespace</label>
                    <Input defaultValue={selectedSystem.namespace} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Service</label>
                    <Input defaultValue={selectedSystem.svc} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">MCP Server</label>
                    <Input defaultValue={selectedSystem.mcpServer} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-medium text-sm">시스템 스펙</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">CPU</label>
                    <Input defaultValue={selectedSystem.spec.cpu} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Memory</label>
                    <Input defaultValue={selectedSystem.spec.memory} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Storage</label>
                    <Input defaultValue={selectedSystem.spec.storage} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex justify-between">
                <span>생성일: {selectedSystem.createdAt}</span>
                <span>수정일: {selectedSystem.updatedAt}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsDetailModalOpen(false)}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>시스템 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">시스템명</label>
                <Input
                  placeholder="시스템 이름 입력"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">시스템유형</label>
                <Select
                  value={createForm.systemType}
                  onValueChange={(value: SystemType) =>
                    setCreateForm({ ...createForm, systemType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {systemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea
                placeholder="시스템 설명 입력"
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">담당자</label>
                <Input
                  placeholder="담당자 이름"
                  value={createForm.manager}
                  onChange={(e) => setCreateForm({ ...createForm, manager: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">사용여부</label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={createForm.isActive}
                    onCheckedChange={(checked) =>
                      setCreateForm({ ...createForm, isActive: checked })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {createForm.isActive ? "사용" : "미사용"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">URL</label>
              <Input
                placeholder="https://example.com"
                value={createForm.url}
                onChange={(e) => setCreateForm({ ...createForm, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">API Endpoint</label>
              <Input
                placeholder="https://api.example.com/v1"
                value={createForm.apiEndpoint}
                onChange={(e) => setCreateForm({ ...createForm, apiEndpoint: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Namespace</label>
                <Input
                  placeholder="namespace"
                  value={createForm.namespace}
                  onChange={(e) => setCreateForm({ ...createForm, namespace: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">MCP Server</label>
                <Input
                  placeholder="mcp-server-01"
                  value={createForm.mcpServer}
                  onChange={(e) => setCreateForm({ ...createForm, mcpServer: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
