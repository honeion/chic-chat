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
  CheckCircle,
  XCircle,
  Monitor,
  Database,
  Link,
  FileCode,
  HelpCircle,
  MoreHorizontal,
  Activity,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SystemData, mockSystems, systemTypes, SystemType } from "@/data/systems";

// 환경별 세부정보 타입
type EnvType = "PROD" | "DEV" | "STG" | "DR";

interface EnvDetail {
  isEnabled: boolean;
  // 접속정보
  url: string;
  apiEndpoint: string;
  // 인프라정보
  namespace: string;
  svc: string;
  mcpServer: string;
  cpu: string;
  memory: string;
  storage: string;
  // DB 정보
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  // 모니터링 정보
  monitoringUrl: string;
  logPath: string;
  alertEmail: string;
}

const defaultEnvDetail: EnvDetail = {
  isEnabled: false,
  url: "",
  apiEndpoint: "",
  namespace: "",
  svc: "",
  mcpServer: "",
  cpu: "",
  memory: "",
  storage: "",
  dbHost: "",
  dbPort: "",
  dbName: "",
  dbUser: "",
  monitoringUrl: "",
  logPath: "",
  alertEmail: "",
};

export function SystemManagement() {
  const [systems, setSystems] = useState<SystemData[]>(mockSystems);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | SystemType>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<SystemData | null>(null);
  const [activeEnvTab, setActiveEnvTab] = useState<EnvType>("PROD");

  // 환경별 세부정보 상태
  const [envDetails, setEnvDetails] = useState<Record<EnvType, EnvDetail>>({
    PROD: { ...defaultEnvDetail, isEnabled: true },
    DEV: { ...defaultEnvDetail },
    STG: { ...defaultEnvDetail },
    DR: { ...defaultEnvDetail },
  });

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: "",
    shortName: "",
    description: "",
    systemType: "WEB" as SystemType,
    url: "",
    apiEndpoint: "",
    namespace: "",
    mcpServer: "",
    manager: "",
    isActive: true,
  });

  // 시스템 선택 시 환경 세부정보 초기화
  const handleSelectSystem = (system: SystemData) => {
    setSelectedSystem(system);
    setActiveEnvTab("PROD");
    // 선택된 시스템의 기존 데이터로 PROD 환경 초기화
    setEnvDetails({
      PROD: {
        isEnabled: true,
        url: system.url,
        apiEndpoint: system.apiEndpoint,
        namespace: system.namespace,
        svc: system.svc,
        mcpServer: system.mcpServer,
        cpu: system.spec.cpu,
        memory: system.spec.memory,
        storage: system.spec.storage,
        dbHost: "db-prod.example.com",
        dbPort: "5432",
        dbName: system.shortName.toLowerCase() + "_db",
        dbUser: system.shortName.toLowerCase() + "_user",
        monitoringUrl: "https://monitor.example.com/" + system.shortName.toLowerCase(),
        logPath: "/var/log/" + system.shortName.toLowerCase(),
        alertEmail: system.manager + "@example.com",
      },
      DEV: { ...defaultEnvDetail },
      STG: { ...defaultEnvDetail },
      DR: { ...defaultEnvDetail },
    });
    setIsDetailModalOpen(true);
  };

  const updateEnvDetail = (env: EnvType, field: keyof EnvDetail, value: string | boolean) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        [field]: value,
      },
    }));
  };

  const filteredSystems = systems.filter((system) => {
    const matchesSearch =
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      shortName: "",
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
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="시스템 검색 (이름, 설명, 담당자)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={activeFilter} onValueChange={(value: "all" | "active" | "inactive") => setActiveFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="사용여부" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="active">사용</SelectItem>
              <SelectItem value="inactive">미사용</SelectItem>
            </SelectContent>
          </Select>
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

      {/* System Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-sm">
              <tr>
                <th className="text-left px-4 py-3 font-medium">시스템명</th>
                <th className="text-left px-4 py-3 font-medium">시스템유형</th>
                <th className="text-left px-4 py-3 font-medium">설명</th>
                <th className="text-left px-4 py-3 font-medium">담당자</th>
                <th className="text-left px-4 py-3 font-medium">사용여부</th>
                <th className="text-right px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSystems.map((system) => (
                <tr 
                  key={system.id} 
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => handleSelectSystem(system)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <Server className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{system.shortName}</p>
                        <p className="text-xs text-muted-foreground">{system.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getTypeBadge(system.systemType)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {system.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm">{system.manager}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {system.isActive ? (
                        <CheckCircle className="w-4 h-4 text-status-online" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className={cn("text-xs", system.isActive ? "text-status-online" : "text-destructive")}>
                        {system.isActive ? "사용" : "미사용"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSystem(system);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(system.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              {selectedSystem?.name} 상세 정보
            </DialogTitle>
          </DialogHeader>
          {selectedSystem && (
            <div className="space-y-6 py-4">
              {/* Overview Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Server className="w-4 h-4" />
                  Overview
                </h3>
                <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        시스템약어명
                      </label>
                      <Input defaultValue={selectedSystem.shortName} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        시스템명
                      </label>
                      <Input defaultValue={selectedSystem.name} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        시스템유형
                      </label>
                      <Select defaultValue={selectedSystem.systemType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {systemTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        사용여부
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch defaultChecked={selectedSystem.isActive} />
                        <span className="text-sm text-muted-foreground">
                          {selectedSystem.isActive ? "사용" : "미사용"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                      설명
                    </label>
                    <Textarea defaultValue={selectedSystem.description} rows={2} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        담당자
                      </label>
                      <Input 
                        defaultValue={selectedSystem.manager} 
                        disabled 
                        className="bg-muted/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        * 담당자는 사용자관리에서 수정할 수 있습니다.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        등록/수정일
                      </label>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p>생성: {selectedSystem.createdAt}</p>
                        <p>수정: {selectedSystem.updatedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Detail Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Cloud className="w-4 h-4" />
                  세부정보 (환경별)
                </h3>
                
                <Tabs value={activeEnvTab} onValueChange={(v) => setActiveEnvTab(v as EnvType)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="PROD" className="gap-1">
                      PROD
                      {envDetails.PROD.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
                    </TabsTrigger>
                    <TabsTrigger value="DEV" className="gap-1">
                      DEV
                      {envDetails.DEV.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
                    </TabsTrigger>
                    <TabsTrigger value="STG" className="gap-1">
                      STG
                      {envDetails.STG.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
                    </TabsTrigger>
                    <TabsTrigger value="DR" className="gap-1">
                      DR
                      {envDetails.DR.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
                    </TabsTrigger>
                  </TabsList>

                  {(["PROD", "DEV", "STG", "DR"] as EnvType[]).map((env) => (
                    <TabsContent key={env} value={env} className="space-y-4 mt-4">
                      {/* Environment Enable Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{env} 환경 사용</span>
                          {envDetails[env].isEnabled ? (
                            <Badge className="bg-status-online text-white text-xs">활성</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">비활성</Badge>
                          )}
                        </div>
                        <Switch
                          checked={envDetails[env].isEnabled}
                          onCheckedChange={(checked) => updateEnvDetail(env, "isEnabled", checked)}
                        />
                      </div>

                      {/* Environment Details (disabled when not enabled) */}
                      <div className={cn(
                        "space-y-4 transition-opacity",
                        !envDetails[env].isEnabled && "opacity-50 pointer-events-none"
                      )}>
                        {/* 접속정보 */}
                        <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            접속정보
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">URL</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input 
                                  value={envDetails[env].url}
                                  onChange={(e) => updateEnvDetail(env, "url", e.target.value)}
                                  placeholder="https://example.com"
                                  className="flex-1" 
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCopy(envDetails[env].url)}
                                  disabled={!envDetails[env].url}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" asChild>
                                  <a href={envDetails[env].url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">API Endpoint</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input 
                                  value={envDetails[env].apiEndpoint}
                                  onChange={(e) => updateEnvDetail(env, "apiEndpoint", e.target.value)}
                                  placeholder="https://api.example.com/v1"
                                  className="flex-1" 
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCopy(envDetails[env].apiEndpoint)}
                                  disabled={!envDetails[env].apiEndpoint}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 인프라정보 */}
                        <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Cloud className="w-4 h-4" />
                            인프라정보
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">Namespace</label>
                              <Input 
                                value={envDetails[env].namespace}
                                onChange={(e) => updateEnvDetail(env, "namespace", e.target.value)}
                                placeholder="namespace"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Service</label>
                              <Input 
                                value={envDetails[env].svc}
                                onChange={(e) => updateEnvDetail(env, "svc", e.target.value)}
                                placeholder="service-name"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">MCP Server</label>
                              <Input 
                                value={envDetails[env].mcpServer}
                                onChange={(e) => updateEnvDetail(env, "mcpServer", e.target.value)}
                                placeholder="mcp-server"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">CPU</label>
                              <Input 
                                value={envDetails[env].cpu}
                                onChange={(e) => updateEnvDetail(env, "cpu", e.target.value)}
                                placeholder="4 vCPU"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Memory</label>
                              <Input 
                                value={envDetails[env].memory}
                                onChange={(e) => updateEnvDetail(env, "memory", e.target.value)}
                                placeholder="16GB"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Storage</label>
                              <Input 
                                value={envDetails[env].storage}
                                onChange={(e) => updateEnvDetail(env, "storage", e.target.value)}
                                placeholder="500GB"
                                className="mt-1" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* DB 정보 */}
                        <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            DB 정보
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">DB Host</label>
                              <Input 
                                value={envDetails[env].dbHost}
                                onChange={(e) => updateEnvDetail(env, "dbHost", e.target.value)}
                                placeholder="db.example.com"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Port</label>
                              <Input 
                                value={envDetails[env].dbPort}
                                onChange={(e) => updateEnvDetail(env, "dbPort", e.target.value)}
                                placeholder="5432"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Database Name</label>
                              <Input 
                                value={envDetails[env].dbName}
                                onChange={(e) => updateEnvDetail(env, "dbName", e.target.value)}
                                placeholder="database_name"
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">DB User</label>
                              <Input 
                                value={envDetails[env].dbUser}
                                onChange={(e) => updateEnvDetail(env, "dbUser", e.target.value)}
                                placeholder="db_user"
                                className="mt-1" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* 모니터링 정보 */}
                        <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            모니터링 정보
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">모니터링 URL</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input 
                                  value={envDetails[env].monitoringUrl}
                                  onChange={(e) => updateEnvDetail(env, "monitoringUrl", e.target.value)}
                                  placeholder="https://monitor.example.com"
                                  className="flex-1" 
                                />
                                <Button variant="outline" size="icon" asChild>
                                  <a href={envDetails[env].monitoringUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-muted-foreground">Log Path</label>
                                <Input 
                                  value={envDetails[env].logPath}
                                  onChange={(e) => updateEnvDetail(env, "logPath", e.target.value)}
                                  placeholder="/var/log/app"
                                  className="mt-1" 
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Alert Email</label>
                                <Input 
                                  value={envDetails[env].alertEmail}
                                  onChange={(e) => updateEnvDetail(env, "alertEmail", e.target.value)}
                                  placeholder="alert@example.com"
                                  className="mt-1" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
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
                <label className="text-sm font-medium mb-1.5 block">시스템약어명</label>
                <Input
                  placeholder="약어명 입력 (예: ITS)"
                  value={createForm.shortName}
                  onChange={(e) => setCreateForm({ ...createForm, shortName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">시스템명</label>
                <Input
                  placeholder="시스템 전체 이름 입력"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
