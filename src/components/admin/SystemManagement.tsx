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
  Code,
  List,
  FileText,
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

// URL 정보 타입
interface UrlInfo {
  id: string;
  url: string;
  accessType: "internal" | "external"; // 내부/외부 구분
  isPrimary: boolean; // 대표URL 여부
  hostsRequired: boolean; // hosts 필요여부
  hostsIp: string; // hosts 필요시 IP 정보
  description: string; // 설명정보
}

const defaultUrlInfo: UrlInfo = {
  id: "",
  url: "",
  accessType: "internal",
  isPrimary: false,
  hostsRequired: false,
  hostsIp: "",
  description: "",
};

// 서버 정보 타입
type InfraType = "CLOUD" | "ONPREM";
type ProviderType = "AWS" | "AZURE" | "PRIVATE";
type HostType = "K8S" | "VM";

interface ServerInfo {
  id: string;
  serverName: string; // 서버명
  infraType: InfraType; // 유형 (CLOUD/ONPREM)
  provider: ProviderType; // 프로바이더 (AWS/AZURE/PRIVATE)
  hostType: HostType; // host 유형 (K8S/VM)
  description: string; // 설명
  // K8S 전용 필드
  subscription: string; // 구독정보
  clusterName: string; // 클러스터명
  namespace: string; // Namespace명
  k8sAuth: string; // 인증정보
  // VM 전용 필드
  vmIp: string; // IP
  vmOs: string; // OS
  vmAuth: string; // 인증정보
}

const defaultServerInfo: ServerInfo = {
  id: "",
  serverName: "",
  infraType: "CLOUD",
  provider: "AWS",
  hostType: "K8S",
  description: "",
  subscription: "",
  clusterName: "",
  namespace: "",
  k8sAuth: "",
  vmIp: "",
  vmOs: "",
  vmAuth: "",
};

// DB 정보 타입
type DBType = "Postgres" | "MSSQL" | "MySQL" | "Oracle";

interface DBInfo {
  id: string;
  dbType: DBType; // DB Type
  dbIp: string; // DB IP
  dbPort: string; // Port
  dbName: string; // DB Name
  dbUser: string; // DB User (key vault)
  dbPassword: string; // DB Passwd (Key vault)
  keyVaultKey: string; // Key Vault Key
}

const defaultDBInfo: DBInfo = {
  id: "",
  dbType: "Postgres",
  dbIp: "",
  dbPort: "",
  dbName: "",
  dbUser: "",
  dbPassword: "",
  keyVaultKey: "",
};

interface EnvDetail {
  isEnabled: boolean;
  // 접속정보 (URL 목록)
  urls: UrlInfo[];
  // 인프라정보 (서버 목록)
  servers: ServerInfo[];
  // DB 정보 (DB 목록)
  databases: DBInfo[];
  // 모니터링 정보
  monitoringUrl: string;
  logPath: string;
  alertEmail: string;
}

const defaultEnvDetail: EnvDetail = {
  isEnabled: false,
  urls: [],
  servers: [],
  databases: [],
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
  const [jsonViewSystemId, setJsonViewSystemId] = useState<string | null>(null);
  const [viewFormat, setViewFormat] = useState<"json" | "md">("json");
  const [detailViewFormat, setDetailViewFormat] = useState<"json" | "md" | null>(null);

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
    const initialUrls: UrlInfo[] = [
      {
        id: crypto.randomUUID(),
        url: system.url,
        accessType: "external",
        isPrimary: true,
        hostsRequired: false,
        hostsIp: "",
        description: "서비스 대표 URL",
      },
      {
        id: crypto.randomUUID(),
        url: system.apiEndpoint,
        accessType: "internal",
        isPrimary: false,
        hostsRequired: true,
        hostsIp: "10.0.0.100",
        description: "API 엔드포인트",
      },
    ];
    const initialServers: ServerInfo[] = [
      {
        id: crypto.randomUUID(),
        serverName: system.shortName + "-PROD-01",
        infraType: "CLOUD",
        provider: "AWS",
        hostType: "K8S",
        description: "운영 K8S 클러스터",
        subscription: "prod-subscription",
        clusterName: system.shortName.toLowerCase() + "-cluster",
        namespace: system.namespace,
        k8sAuth: "kubeconfig",
        vmIp: "",
        vmOs: "",
        vmAuth: "",
      },
    ];
    const initialDatabases: DBInfo[] = [
      {
        id: crypto.randomUUID(),
        dbType: "Postgres",
        dbIp: "db-prod.example.com",
        dbPort: "5432",
        dbName: system.shortName.toLowerCase() + "_db",
        dbUser: system.shortName.toLowerCase() + "_user",
        dbPassword: "",
        keyVaultKey: "kv-" + system.shortName.toLowerCase() + "-db",
      },
    ];
    setEnvDetails({
      PROD: {
        isEnabled: true,
        urls: initialUrls,
        servers: initialServers,
        databases: initialDatabases,
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

  // URL 추가
  const addUrl = (env: EnvType) => {
    const newUrl: UrlInfo = {
      ...defaultUrlInfo,
      id: crypto.randomUUID(),
    };
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        urls: [...prev[env].urls, newUrl],
      },
    }));
  };

  // URL 삭제
  const removeUrl = (env: EnvType, urlId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        urls: prev[env].urls.filter(u => u.id !== urlId),
      },
    }));
  };

  // URL 정보 업데이트
  const updateUrlInfo = (env: EnvType, urlId: string, field: keyof UrlInfo, value: string | boolean) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        urls: prev[env].urls.map(u => 
          u.id === urlId ? { ...u, [field]: value } : u
        ),
      },
    }));
  };

  // 서버 추가
  const addServer = (env: EnvType) => {
    const newServer: ServerInfo = {
      ...defaultServerInfo,
      id: crypto.randomUUID(),
    };
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        servers: [...prev[env].servers, newServer],
      },
    }));
  };

  // 서버 삭제
  const removeServer = (env: EnvType, serverId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        servers: prev[env].servers.filter(s => s.id !== serverId),
      },
    }));
  };

  // 서버 정보 업데이트
  const updateServerInfo = (env: EnvType, serverId: string, field: keyof ServerInfo, value: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        servers: prev[env].servers.map(s => 
          s.id === serverId ? { ...s, [field]: value } : s
        ),
      },
    }));
  };

  // DB 추가
  const addDatabase = (env: EnvType) => {
    const newDB: DBInfo = {
      ...defaultDBInfo,
      id: crypto.randomUUID(),
    };
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        databases: [...prev[env].databases, newDB],
      },
    }));
  };

  // DB 삭제
  const removeDatabase = (env: EnvType, dbId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        databases: prev[env].databases.filter(d => d.id !== dbId),
      },
    }));
  };

  // DB 정보 업데이트
  const updateDatabaseInfo = (env: EnvType, dbId: string, field: keyof DBInfo, value: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        databases: prev[env].databases.map(d => 
          d.id === dbId ? { ...d, [field]: value } : d
        ),
      },
    }));
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

  // 시스템 정보를 Markdown 형식으로 변환 (상세정보 포함)
  const systemToMarkdown = (system: SystemData, details: Record<EnvType, EnvDetail>): string => {
    const lines: string[] = [
      `# ${system.name} (${system.shortName})`,
      "",
      "## 기본 정보",
      "",
      `| 항목 | 값 |`,
      `|------|-----|`,
      `| 시스템 ID | ${system.id} |`,
      `| 시스템 유형 | ${system.systemType} |`,
      `| 담당자 | ${system.manager} |`,
      `| 사용여부 | ${system.isActive ? "사용" : "미사용"} |`,
      `| 상태 | ${system.status} |`,
      `| 생성일 | ${system.createdAt} |`,
      `| 수정일 | ${system.updatedAt} |`,
      "",
      "## 설명",
      "",
      system.description,
      "",
    ];

    // 환경별 상세정보 추가
    (["PROD", "DEV", "STG", "DR"] as EnvType[]).forEach((env) => {
      const envDetail = details[env];
      if (!envDetail.isEnabled) return;
      
      lines.push(`## ${env} 환경`);
      lines.push("");
      
      // 접속정보
      if (envDetail.urls.length > 0) {
        lines.push("### 접속정보");
        lines.push("");
        envDetail.urls.forEach((url, idx) => {
          lines.push(`**URL ${idx + 1}**${url.isPrimary ? " (대표)" : ""}`);
          lines.push(`- URL: ${url.url || "-"}`);
          lines.push(`- 접속유형: ${url.accessType === "external" ? "외부" : "내부"}`);
          lines.push(`- hosts 필요: ${url.hostsRequired ? `예 (${url.hostsIp})` : "아니오"}`);
          lines.push(`- 설명: ${url.description || "-"}`);
          lines.push("");
        });
      }
      
      // 인프라정보
      if (envDetail.servers.length > 0) {
        lines.push("### 인프라정보");
        lines.push("");
        envDetail.servers.forEach((server, idx) => {
          lines.push(`**${server.serverName || `서버 ${idx + 1}`}** (${server.infraType}/${server.provider}/${server.hostType})`);
          if (server.hostType === "K8S") {
            lines.push(`- 구독정보: ${server.subscription || "-"}`);
            lines.push(`- 클러스터명: ${server.clusterName || "-"}`);
            lines.push(`- Namespace: ${server.namespace || "-"}`);
            lines.push(`- 인증정보: ${server.k8sAuth || "-"}`);
          } else {
            lines.push(`- VM IP: ${server.vmIp || "-"}`);
            lines.push(`- VM OS: ${server.vmOs || "-"}`);
            lines.push(`- 인증정보: ${server.vmAuth || "-"}`);
          }
          lines.push(`- 설명: ${server.description || "-"}`);
          lines.push("");
        });
      }
      
      // DB정보
      if (envDetail.databases.length > 0) {
        lines.push("### DB정보");
        lines.push("");
        envDetail.databases.forEach((db, idx) => {
          lines.push(`**DB ${idx + 1}** (${db.dbType})`);
          lines.push(`- IP: ${db.dbIp || "-"}`);
          lines.push(`- Port: ${db.dbPort || "-"}`);
          lines.push(`- DB Name: ${db.dbName || "-"}`);
          lines.push(`- DB User: ${db.dbUser || "-"}`);
          lines.push(`- Key Vault Key: ${db.keyVaultKey || "-"}`);
          lines.push("");
        });
      }
    });

    return lines.join("\n");
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
                          // 상세정보 초기화 후 JSON 보기
                          handleSelectSystem(system);
                          setIsDetailModalOpen(false);
                          setViewFormat("json");
                          setJsonViewSystemId(system.id);
                        }}>
                          <Code className="w-4 h-4 mr-2" />
                          JSON 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // 상세정보 초기화 후 MD 보기
                          handleSelectSystem(system);
                          setIsDetailModalOpen(false);
                          setViewFormat("md");
                          setJsonViewSystemId(system.id);
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          MD 보기
                        </DropdownMenuItem>
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

      {/* JSON/MD View Modal for individual system */}
      <Dialog open={jsonViewSystemId !== null} onOpenChange={(open) => {
        if (!open) {
          setJsonViewSystemId(null);
          setViewFormat("json");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {viewFormat === "json" ? <Code className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
              {filteredSystems.find(s => s.id === jsonViewSystemId)?.name} - {viewFormat === "json" ? "JSON" : "MD"} 보기
            </DialogTitle>
          </DialogHeader>
          {jsonViewSystemId && (() => {
            const system = filteredSystems.find(s => s.id === jsonViewSystemId);
            if (!system) return null;
            const fullData = { system, envDetails };
            const content = viewFormat === "json" 
              ? JSON.stringify(fullData, null, 2) 
              : systemToMarkdown(system, envDetails);
            return (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 z-10"
                  onClick={() => handleCopy(content)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <pre className="p-4 rounded-lg bg-secondary/50 text-xs overflow-auto max-h-[60vh] font-mono whitespace-pre-wrap">
                  {content}
                </pre>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

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
              {/* JSON/MD 보기 버튼 */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailViewFormat("json")}
                  className="h-7 gap-1.5 text-xs"
                >
                  <Code className="w-3.5 h-3.5" />
                  JSON 보기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailViewFormat("md")}
                  className="h-7 gap-1.5 text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  MD 보기
                </Button>
              </div>

              
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
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              접속정보
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addUrl(env)}
                              className="h-7 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              URL 추가
                            </Button>
                          </div>
                          
                          {envDetails[env].urls.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              등록된 URL이 없습니다. URL을 추가해주세요.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {envDetails[env].urls.map((urlInfo, index) => (
                                <div key={urlInfo.id} className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                                      {urlInfo.isPrimary && (
                                        <Badge className="bg-primary text-primary-foreground text-xs">대표</Badge>
                                      )}
                                      <Badge variant={urlInfo.accessType === "external" ? "default" : "secondary"} className="text-xs">
                                        {urlInfo.accessType === "external" ? "외부" : "내부"}
                                      </Badge>
                                      {urlInfo.hostsRequired && (
                                        <Badge variant="outline" className="text-xs">hosts 필요</Badge>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => removeUrl(env, urlInfo.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-2">
                                    <div>
                                      <label className="text-xs text-muted-foreground">URL</label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Input 
                                          value={urlInfo.url}
                                          onChange={(e) => updateUrlInfo(env, urlInfo.id, "url", e.target.value)}
                                          placeholder="https://example.com"
                                          className="flex-1 h-8 text-sm" 
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleCopy(urlInfo.url)}
                                          disabled={!urlInfo.url}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                          <a href={urlInfo.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                      <div>
                                        <label className="text-xs text-muted-foreground">내부/외부</label>
                                        <Select
                                          value={urlInfo.accessType}
                                          onValueChange={(value: "internal" | "external") => 
                                            updateUrlInfo(env, urlInfo.id, "accessType", value)
                                          }
                                        >
                                          <SelectTrigger className="h-8 text-xs mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="internal">내부</SelectItem>
                                            <SelectItem value="external">외부</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">대표URL</label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Switch
                                            checked={urlInfo.isPrimary}
                                            onCheckedChange={(checked) => 
                                              updateUrlInfo(env, urlInfo.id, "isPrimary", checked)
                                            }
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            {urlInfo.isPrimary ? "예" : "아니오"}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">hosts 필요</label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Switch
                                            checked={urlInfo.hostsRequired}
                                            onCheckedChange={(checked) => 
                                              updateUrlInfo(env, urlInfo.id, "hostsRequired", checked)
                                            }
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            {urlInfo.hostsRequired ? "예" : "아니오"}
                                          </span>
                                        </div>
                                      </div>
                                      {urlInfo.hostsRequired && (
                                        <div>
                                          <label className="text-xs text-muted-foreground">hosts IP</label>
                                          <Input 
                                            value={urlInfo.hostsIp}
                                            onChange={(e) => updateUrlInfo(env, urlInfo.id, "hostsIp", e.target.value)}
                                            placeholder="10.0.0.100"
                                            className="h-8 text-xs mt-1" 
                                          />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs text-muted-foreground">설명</label>
                                      <Input 
                                        value={urlInfo.description}
                                        onChange={(e) => updateUrlInfo(env, urlInfo.id, "description", e.target.value)}
                                        placeholder="URL 설명 입력"
                                        className="h-8 text-sm mt-1" 
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 인프라정보 */}
                        <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Cloud className="w-4 h-4" />
                              인프라정보
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addServer(env)}
                              className="h-7 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              서버 추가
                            </Button>
                          </div>
                          
                          {envDetails[env].servers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              등록된 서버가 없습니다. 서버를 추가해주세요.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {envDetails[env].servers.map((server, index) => (
                                <div key={server.id} className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                                      <Badge variant={server.infraType === "CLOUD" ? "default" : "secondary"} className="text-xs">
                                        {server.infraType}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {server.provider}
                                      </Badge>
                                      <Badge variant={server.hostType === "K8S" ? "default" : "secondary"} className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                                        {server.hostType}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => removeServer(env, server.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* 서버명 */}
                                  <div>
                                    <label className="text-xs text-muted-foreground">서버명</label>
                                    <Input
                                      value={server.serverName}
                                      onChange={(e) => updateServerInfo(env, server.id, "serverName", e.target.value)}
                                      placeholder="서버명 입력"
                                      className="h-8 text-xs mt-1"
                                    />
                                  </div>
                                  
                                  {/* 기본 정보 */}
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="text-xs text-muted-foreground">유형</label>
                                      <Select
                                        value={server.infraType}
                                        onValueChange={(value: InfraType) => 
                                          updateServerInfo(env, server.id, "infraType", value)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                          <SelectItem value="CLOUD">CLOUD</SelectItem>
                                          <SelectItem value="ONPREM">ONPREM</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">프로바이더</label>
                                      <Select
                                        value={server.provider}
                                        onValueChange={(value: ProviderType) => 
                                          updateServerInfo(env, server.id, "provider", value)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                          <SelectItem value="AWS">AWS</SelectItem>
                                          <SelectItem value="AZURE">AZURE</SelectItem>
                                          <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Host 유형</label>
                                      <Select
                                        value={server.hostType}
                                        onValueChange={(value: HostType) => 
                                          updateServerInfo(env, server.id, "hostType", value)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                          <SelectItem value="K8S">K8S</SelectItem>
                                          <SelectItem value="VM">VM</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  {/* K8S 전용 필드 */}
                                  {server.hostType === "K8S" && (
                                    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                      <div>
                                        <label className="text-xs text-muted-foreground">구독정보</label>
                                        <Input 
                                          value={server.subscription}
                                          onChange={(e) => updateServerInfo(env, server.id, "subscription", e.target.value)}
                                          placeholder="subscription-id"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">클러스터명</label>
                                        <Input 
                                          value={server.clusterName}
                                          onChange={(e) => updateServerInfo(env, server.id, "clusterName", e.target.value)}
                                          placeholder="cluster-name"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">Namespace명</label>
                                        <Input 
                                          value={server.namespace}
                                          onChange={(e) => updateServerInfo(env, server.id, "namespace", e.target.value)}
                                          placeholder="namespace"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">인증정보 Key name(TBD)</label>
                                        <Input 
                                          value={server.k8sAuth}
                                          onChange={(e) => updateServerInfo(env, server.id, "k8sAuth", e.target.value)}
                                          placeholder="kubeconfig"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* VM 전용 필드 */}
                                  {server.hostType === "VM" && (
                                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                      <div>
                                        <label className="text-xs text-muted-foreground">IP</label>
                                        <Input 
                                          value={server.vmIp}
                                          onChange={(e) => updateServerInfo(env, server.id, "vmIp", e.target.value)}
                                          placeholder="192.168.1.100"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">OS</label>
                                        <Input 
                                          value={server.vmOs}
                                          onChange={(e) => updateServerInfo(env, server.id, "vmOs", e.target.value)}
                                          placeholder="Ubuntu 22.04"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-muted-foreground">인증정보 Key name(TBD)</label>
                                        <Input 
                                          value={server.vmAuth}
                                          onChange={(e) => updateServerInfo(env, server.id, "vmAuth", e.target.value)}
                                          placeholder="SSH Key"
                                          className="h-8 text-xs mt-1" 
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <label className="text-xs text-muted-foreground">설명</label>
                                    <Input 
                                      value={server.description}
                                      onChange={(e) => updateServerInfo(env, server.id, "description", e.target.value)}
                                      placeholder="서버 설명 입력"
                                      className="h-8 text-sm mt-1" 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* DB 정보 */}
                        <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Database className="w-4 h-4" />
                              DB 정보
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addDatabase(env)}
                              className="h-7 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              DB 추가
                            </Button>
                          </div>
                          
                          {envDetails[env].databases.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              등록된 DB가 없습니다. DB를 추가해주세요.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {envDetails[env].databases.map((db, index) => (
                                <div key={db.id} className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                                      <Badge variant="outline" className={cn(
                                        "text-xs",
                                        db.dbType === "Postgres" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                        db.dbType === "MSSQL" && "bg-red-500/20 text-red-400 border-red-500/30",
                                        db.dbType === "MySQL" && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                                        db.dbType === "Oracle" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
                                      )}>
                                        {db.dbType}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => removeDatabase(env, db.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* DB 기본 정보 */}
                                  <div className="grid grid-cols-4 gap-2">
                                    <div>
                                      <label className="text-xs text-muted-foreground">DB Type</label>
                                      <Select
                                        value={db.dbType}
                                        onValueChange={(value: DBType) => 
                                          updateDatabaseInfo(env, db.id, "dbType", value)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                          <SelectItem value="Postgres">Postgres</SelectItem>
                                          <SelectItem value="MSSQL">MSSQL</SelectItem>
                                          <SelectItem value="MySQL">MySQL</SelectItem>
                                          <SelectItem value="Oracle">Oracle</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">DB IP</label>
                                      <Input 
                                        value={db.dbIp}
                                        onChange={(e) => updateDatabaseInfo(env, db.id, "dbIp", e.target.value)}
                                        placeholder="192.168.1.100"
                                        className="h-8 text-xs mt-1" 
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Port</label>
                                      <Input 
                                        value={db.dbPort}
                                        onChange={(e) => updateDatabaseInfo(env, db.id, "dbPort", e.target.value)}
                                        placeholder="5432"
                                        className="h-8 text-xs mt-1" 
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">DB Name</label>
                                      <Input 
                                        value={db.dbName}
                                        onChange={(e) => updateDatabaseInfo(env, db.id, "dbName", e.target.value)}
                                        placeholder="database_name"
                                        className="h-8 text-xs mt-1" 
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Key Vault 정보 */}
                                  <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                    <div>
                                      <label className="text-xs text-muted-foreground">DB User (Key Vault)</label>
                                      <Input 
                                        value={db.dbUser}
                                        onChange={(e) => updateDatabaseInfo(env, db.id, "dbUser", e.target.value)}
                                        placeholder="db_user"
                                        className="h-8 text-xs mt-1" 
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">DB Password (Key Vault)</label>
                                      <Input 
                                        type="password"
                                        value={db.dbPassword}
                                        onChange={(e) => updateDatabaseInfo(env, db.id, "dbPassword", e.target.value)}
                                        placeholder="••••••••"
                                        className="h-8 text-xs mt-1" 
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Key Vault Key</label>
                                      <Input 
                                        value={db.keyVaultKey}
                                        onChange={(e) => updateDatabaseInfo(env, db.id, "keyVaultKey", e.target.value)}
                                        placeholder="kv-db-secret-key"
                                        className="h-8 text-xs mt-1" 
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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

      {/* Detail JSON/MD Popup Modal */}
      <Dialog open={detailViewFormat !== null} onOpenChange={(open) => !open && setDetailViewFormat(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {detailViewFormat === "json" ? <Code className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
              {selectedSystem?.name} - {detailViewFormat === "json" ? "JSON" : "MD"} 보기
            </DialogTitle>
          </DialogHeader>
          {selectedSystem && detailViewFormat && (() => {
            const fullData = { system: selectedSystem, envDetails };
            const content = detailViewFormat === "json" 
              ? JSON.stringify(fullData, null, 2) 
              : systemToMarkdown(selectedSystem, envDetails);
            return (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 z-10"
                  onClick={() => handleCopy(content)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <pre className="p-4 rounded-lg bg-secondary/50 text-xs overflow-auto max-h-[60vh] font-mono whitespace-pre-wrap">
                  {content}
                </pre>
              </div>
            );
          })()}
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
