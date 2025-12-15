import { useState, useMemo } from "react";
import { 
  Server, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreVertical,
  Download,
  Settings,
  Check,
  X,
  Wrench,
  Shield,
  Building2,
  Users,
  Info,
  Search,
  ChevronDown,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockSystems } from "@/data/systems";

// Interfaces
interface MCPTool {
  id: string;
  name: string;
  description: string;
  inputSchema?: string;
  isEnabled: boolean;
}

interface MCPServer {
  id: string;
  name: string;
  description: string;
  connectionType: "stdio" | "sse" | "http";
  connectionUrl: string;
  authType: "none" | "api-key" | "oauth";
  authValue?: string;
  isActive: boolean;
  tools: MCPTool[];
  createdAt: string;
  updatedAt: string;
  connectionStatus?: "unknown" | "testing" | "connected" | "failed";
  lastTestedAt?: string;
}

interface SystemMCPPermission {
  systemId: string;
  serverId: string;
  enabledToolIds: string[];
}

interface RoleMCPPermission {
  role: string;
  serverId: string;
  enabledToolIds: string[];
}

// Mock data
const mockMCPServers: MCPServer[] = [
  {
    id: "mcp1",
    name: "File System MCP",
    description: "파일 시스템 접근 및 관리 도구",
    connectionType: "stdio",
    connectionUrl: "npx -y @anthropic/mcp-server-filesystem",
    authType: "none",
    isActive: true,
    tools: [
      { id: "t1", name: "read_file", description: "파일 내용 읽기", isEnabled: true },
      { id: "t2", name: "write_file", description: "파일 쓰기", isEnabled: true },
      { id: "t3", name: "list_directory", description: "디렉토리 목록 조회", isEnabled: true },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    connectionStatus: "connected",
    lastTestedAt: "2024-01-20 14:30",
  },
  {
    id: "mcp2",
    name: "Database MCP",
    description: "데이터베이스 쿼리 및 관리 도구",
    connectionType: "http",
    connectionUrl: "http://localhost:3001/mcp",
    authType: "api-key",
    authValue: "sk-****",
    isActive: true,
    tools: [
      { id: "t4", name: "execute_query", description: "SQL 쿼리 실행", isEnabled: true },
      { id: "t5", name: "list_tables", description: "테이블 목록 조회", isEnabled: true },
      { id: "t6", name: "describe_table", description: "테이블 스키마 조회", isEnabled: true },
    ],
    createdAt: "2024-01-18",
    updatedAt: "2024-01-25",
    connectionStatus: "connected",
    lastTestedAt: "2024-01-25 10:15",
  },
  {
    id: "mcp3",
    name: "Monitoring MCP",
    description: "시스템 모니터링 및 알림 도구",
    connectionType: "sse",
    connectionUrl: "http://localhost:3002/mcp/sse",
    authType: "oauth",
    isActive: false,
    tools: [],
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
    connectionStatus: "unknown",
  },
];

const userRoles = [
  { id: "admin", name: "관리자" },
  { id: "operator-control", name: "운영자(제어)" },
  { id: "operator-view", name: "운영자(조회)" },
  { id: "business", name: "현업담당자" },
];

const mockSystemPermissions: SystemMCPPermission[] = [
  { systemId: "s1", serverId: "mcp1", enabledToolIds: ["t1", "t2", "t3"] },
  { systemId: "s1", serverId: "mcp2", enabledToolIds: ["t4", "t5"] },
  { systemId: "s2", serverId: "mcp1", enabledToolIds: ["t1"] },
];

const mockRolePermissions: RoleMCPPermission[] = [
  { role: "admin", serverId: "mcp1", enabledToolIds: ["t1", "t2", "t3"] },
  { role: "admin", serverId: "mcp2", enabledToolIds: ["t4", "t5", "t6"] },
  { role: "operator-control", serverId: "mcp1", enabledToolIds: ["t1", "t2"] },
  { role: "operator-control", serverId: "mcp2", enabledToolIds: ["t4", "t5"] },
  { role: "operator-view", serverId: "mcp1", enabledToolIds: ["t1"] },
  { role: "business", serverId: "mcp1", enabledToolIds: ["t1"] },
];

export const MCPManagement = () => {
  const [servers, setServers] = useState<MCPServer[]>(mockMCPServers);
  const [systemPermissions, setSystemPermissions] = useState<SystemMCPPermission[]>(mockSystemPermissions);
  const [rolePermissions, setRolePermissions] = useState<RoleMCPPermission[]>(mockRolePermissions);
  const [activeTab, setActiveTab] = useState("servers");
  
  // Server modal states
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  
  // Tool detail modal
  const [isToolDetailOpen, setIsToolDetailOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    connectionType: "stdio" as "stdio" | "sse" | "http",
    connectionUrl: "",
    authType: "none" as "none" | "api-key" | "oauth",
    authValue: "",
  });

  // Permission tab states
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedSystemForPermission, setSelectedSystemForPermission] = useState<string>("");
  
  // Search states
  const [serverSearchQuery, setServerSearchQuery] = useState("");
  const [isServerSelectOpen, setIsServerSelectOpen] = useState(false);
  
  // Selected server for tool list display
  const [selectedServerForTools, setSelectedServerForTools] = useState<string | null>(null);
  
  // Get selected server object
  const selectedServerData = useMemo(() => {
    return servers.find(s => s.id === selectedServerForTools) || null;
  }, [servers, selectedServerForTools]);

  // Filtered servers based on search
  const filteredServers = useMemo(() => {
    if (!serverSearchQuery) return servers;
    const query = serverSearchQuery.toLowerCase();
    return servers.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query) ||
      s.connectionType.toLowerCase().includes(query)
    );
  }, [servers, serverSearchQuery]);

  const activeFilteredServers = useMemo(() => {
    return filteredServers.filter(s => s.isActive);
  }, [filteredServers]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      connectionType: "stdio",
      connectionUrl: "",
      authType: "none",
      authValue: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setEditingServer(null);
    setIsServerModalOpen(true);
  };

  const openEditModal = (server: MCPServer) => {
    setFormData({
      name: server.name,
      description: server.description,
      connectionType: server.connectionType,
      connectionUrl: server.connectionUrl,
      authType: server.authType,
      authValue: server.authValue || "",
    });
    setIsEditMode(true);
    setEditingServer(server);
    setIsServerModalOpen(true);
  };

  const handleSaveServer = () => {
    if (isEditMode && editingServer) {
      setServers(servers.map(s => 
        s.id === editingServer.id 
          ? { ...s, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : s
      ));
    } else {
      const newServer: MCPServer = {
        id: `mcp${Date.now()}`,
        ...formData,
        isActive: true,
        tools: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setServers([...servers, newServer]);
    }
    setIsServerModalOpen(false);
    resetForm();
  };

  const handleDeleteServer = (serverId: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setServers(servers.filter(s => s.id !== serverId));
    }
  };

  const handleImportTools = (serverId: string) => {
    // Mock tool import - in production, this would call the MCP server
    const mockImportedTools: MCPTool[] = [
      { id: `t${Date.now()}1`, name: "imported_tool_1", description: "가져온 도구 1", isEnabled: true },
      { id: `t${Date.now()}2`, name: "imported_tool_2", description: "가져온 도구 2", isEnabled: true },
    ];
    
    setServers(servers.map(s => 
      s.id === serverId 
        ? { ...s, tools: [...s.tools, ...mockImportedTools], updatedAt: new Date().toISOString().split('T')[0] }
        : s
    ));
    alert("Tool을 성공적으로 가져왔습니다.");
  };

  const handleTestConnection = async (serverId: string) => {
    // Set testing status
    setServers(servers.map(s => 
      s.id === serverId ? { ...s, connectionStatus: "testing" as const } : s
    ));

    // Mock connection test - simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Mock result - randomly succeed or fail for demo
    const success = Math.random() > 0.3;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setServers(servers.map(s => 
      s.id === serverId 
        ? { 
            ...s, 
            connectionStatus: success ? "connected" as const : "failed" as const,
            lastTestedAt: timeStr
          } 
        : s
    ));
  };

  const handleTestAllConnections = async () => {
    const activeServerIds = servers.filter(s => s.isActive).map(s => s.id);
    for (const serverId of activeServerIds) {
      await handleTestConnection(serverId);
    }
  };

  const getConnectionStatusBadge = (status?: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            연결됨
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
            <XCircle className="w-3 h-3" />
            연결실패
          </Badge>
        );
      case "testing":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            테스트중
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
            <AlertCircle className="w-3 h-3" />
            미확인
          </Badge>
        );
    }
  };

  const toggleServerActive = (serverId: string) => {
    setServers(servers.map(s => 
      s.id === serverId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const toggleToolEnabled = (serverId: string, toolId: string) => {
    setServers(servers.map(s => 
      s.id === serverId 
        ? { 
            ...s, 
            tools: s.tools.map(t => 
              t.id === toolId ? { ...t, isEnabled: !t.isEnabled } : t
            )
          }
        : s
    ));
  };

  const getSystemPermission = (systemId: string, serverId: string): string[] => {
    const perm = systemPermissions.find(p => p.systemId === systemId && p.serverId === serverId);
    return perm?.enabledToolIds || [];
  };

  const toggleSystemToolPermission = (systemId: string, serverId: string, toolId: string) => {
    const existing = systemPermissions.find(p => p.systemId === systemId && p.serverId === serverId);
    if (existing) {
      const hasToolId = existing.enabledToolIds.includes(toolId);
      setSystemPermissions(systemPermissions.map(p => 
        p.systemId === systemId && p.serverId === serverId
          ? { ...p, enabledToolIds: hasToolId 
              ? p.enabledToolIds.filter(id => id !== toolId)
              : [...p.enabledToolIds, toolId]
            }
          : p
      ));
    } else {
      setSystemPermissions([...systemPermissions, { systemId, serverId, enabledToolIds: [toolId] }]);
    }
  };

  const getRolePermission = (role: string, serverId: string): string[] => {
    const perm = rolePermissions.find(p => p.role === role && p.serverId === serverId);
    return perm?.enabledToolIds || [];
  };

  const toggleRoleToolPermission = (role: string, serverId: string, toolId: string) => {
    const existing = rolePermissions.find(p => p.role === role && p.serverId === serverId);
    if (existing) {
      const hasToolId = existing.enabledToolIds.includes(toolId);
      setRolePermissions(rolePermissions.map(p => 
        p.role === role && p.serverId === serverId
          ? { ...p, enabledToolIds: hasToolId 
              ? p.enabledToolIds.filter(id => id !== toolId)
              : [...p.enabledToolIds, toolId]
            }
          : p
      ));
    } else {
      setRolePermissions([...rolePermissions, { role, serverId, enabledToolIds: [toolId] }]);
    }
  };

  const getConnectionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      stdio: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      sse: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      http: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="servers" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            MCP 서버/Tool 관리
          </TabsTrigger>
          <TabsTrigger value="system-permissions" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            시스템별 권한
          </TabsTrigger>
          <TabsTrigger value="role-permissions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            역할별 권한
          </TabsTrigger>
        </TabsList>

        {/* MCP Servers Tab */}
        <TabsContent value="servers" className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="서버명, 설명, 연결방식으로 검색..."
                  value={serverSearchQuery}
                  onChange={(e) => setServerSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {serverSearchQuery ? `${filteredServers.length}개 검색됨 / ` : ""}총 {servers.length}개의 MCP 서버
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleTestAllConnections}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                전체 연결 테스트
              </Button>
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="w-4 h-4" />
                MCP 서버 추가
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">서버명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-[90px]">연결방식</TableHead>
                  <TableHead className="w-[80px]">Tool 수</TableHead>
                  <TableHead className="w-[120px]">연결상태</TableHead>
                  <TableHead className="w-[70px]">활성</TableHead>
                  <TableHead className="w-[140px] text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServers.map((server) => (
                  <TableRow 
                    key={server.id} 
                    className={`hover:bg-muted/30 cursor-pointer transition-colors ${
                      selectedServerForTools === server.id 
                        ? "bg-primary/10 border-l-2 border-l-primary" 
                        : ""
                    }`}
                    onClick={() => setSelectedServerForTools(
                      selectedServerForTools === server.id ? null : server.id
                    )}
                  >
                    <TableCell>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {server.connectionUrl}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {server.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getConnectionTypeBadge(server.connectionType)}>
                        {server.connectionType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{server.tools.length}개</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getConnectionStatusBadge(server.connectionStatus)}
                        {server.lastTestedAt && (
                          <span className="text-[10px] text-muted-foreground">{server.lastTestedAt}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={server.isActive} 
                        onCheckedChange={() => toggleServerActive(server.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTestConnection(server.id)}
                          disabled={server.connectionStatus === "testing"}
                          title="연결 테스트"
                        >
                          {server.connectionStatus === "testing" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(server)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImportTools(server.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Tool 가져오기
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteServer(server.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tools Section */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                MCP Tool 목록
                {selectedServerData && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedServerData.name}
                  </Badge>
                )}
              </h3>
              {selectedServerForTools && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedServerForTools(null)}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  선택 해제
                </Button>
              )}
            </div>
            
            {!selectedServerForTools ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
                <Server className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  위 목록에서 MCP 서버를 선택하면 해당 서버의 Tool 목록이 표시됩니다.
                </p>
              </div>
            ) : selectedServerData && selectedServerData.tools.length > 0 ? (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    <span className="font-medium">{selectedServerData.name}</span>
                    <Badge variant="outline" className={getConnectionTypeBadge(selectedServerData.connectionType)}>
                      {selectedServerData.connectionType.toUpperCase()}
                    </Badge>
                    {getConnectionStatusBadge(selectedServerData.connectionStatus)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleImportTools(selectedServerData.id)}
                    className="gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Tool 가져오기
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedServerData.tools.map((tool) => (
                    <div 
                      key={tool.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{tool.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTool(tool);
                            setIsToolDetailOpen(true);
                          }}
                        >
                          <Info className="w-3 h-3" />
                        </Button>
                        <Switch 
                          checked={tool.isEnabled} 
                          onCheckedChange={() => toggleToolEnabled(selectedServerData.id, tool.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedServerData ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
                <Wrench className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  이 서버에 등록된 Tool이 없습니다.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => handleImportTools(selectedServerData.id)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Tool 가져오기
                </Button>
              </div>
            ) : null}
          </div>
        </TabsContent>

        {/* System Permissions Tab */}
        <TabsContent value="system-permissions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: System Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">시스템 선택</Label>
              <div className="border border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-[400px]">
                  <div className="p-2 space-y-1">
                    {mockSystems.filter(s => s.isActive).map((system) => (
                      <div
                        key={system.id}
                        onClick={() => setSelectedSystemForPermission(system.id)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSystemForPermission === system.id
                            ? "bg-primary/10 border border-primary/50"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="font-medium text-sm">{system.shortName}</div>
                        <div className="text-xs text-muted-foreground">{system.name}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Middle: MCP Server Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">MCP 서버 선택</Label>
              <div className="border border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-[400px]">
                  <div className="p-2 space-y-1">
                    {servers.filter(s => s.isActive).map((server) => (
                      <div
                        key={server.id}
                        onClick={() => setSelectedServerId(server.id)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedServerId === server.id
                            ? "bg-primary/10 border border-primary/50"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{server.name}</div>
                          <Badge variant="outline" className={`text-xs ${getConnectionTypeBadge(server.connectionType)}`}>
                            {server.connectionType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{server.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Tool: {server.tools.length}개
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Right: Tool Permission Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Tool 권한 설정</Label>
                {selectedSystemForPermission && selectedServerId && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const server = servers.find(s => s.id === selectedServerId);
                        if (server) {
                          server.tools.forEach(tool => {
                            if (!getSystemPermission(selectedSystemForPermission, selectedServerId).includes(tool.id)) {
                              toggleSystemToolPermission(selectedSystemForPermission, selectedServerId, tool.id);
                            }
                          });
                        }
                      }}
                    >
                      전체 선택
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const server = servers.find(s => s.id === selectedServerId);
                        if (server) {
                          server.tools.forEach(tool => {
                            if (getSystemPermission(selectedSystemForPermission, selectedServerId).includes(tool.id)) {
                              toggleSystemToolPermission(selectedSystemForPermission, selectedServerId, tool.id);
                            }
                          });
                        }
                      }}
                    >
                      전체 해제
                    </Button>
                  </div>
                )}
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-[400px]">
                  {!selectedSystemForPermission && !selectedServerId ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">시스템과 MCP 서버를 선택하세요</p>
                    </div>
                  ) : !selectedSystemForPermission ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">시스템을 선택하세요</p>
                    </div>
                  ) : !selectedServerId ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">MCP 서버를 선택하세요</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {servers.find(s => s.id === selectedServerId)?.tools.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">등록된 Tool이 없습니다</p>
                        </div>
                      ) : (
                        servers.find(s => s.id === selectedServerId)?.tools.map((tool) => {
                          const isEnabled = getSystemPermission(selectedSystemForPermission, selectedServerId).includes(tool.id);
                          return (
                            <div
                              key={tool.id}
                              className={`p-3 rounded-md border transition-colors ${
                                isEnabled
                                  ? "bg-primary/5 border-primary/30"
                                  : "bg-background border-border hover:bg-muted/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isEnabled}
                                  onCheckedChange={() => toggleSystemToolPermission(selectedSystemForPermission, selectedServerId, tool.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{tool.name}</span>
                                    {tool.isEnabled && (
                                      <Badge variant="outline" className="text-xs bg-status-online/10 text-status-online border-status-online/30">
                                        활성
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {tool.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
              {selectedSystemForPermission && selectedServerId && (
                <div className="text-xs text-muted-foreground text-right">
                  선택됨: {getSystemPermission(selectedSystemForPermission, selectedServerId).length} / {servers.find(s => s.id === selectedServerId)?.tools.length || 0}개
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Role Permissions Tab */}
        <TabsContent value="role-permissions" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Label>MCP 서버 선택:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[300px] justify-between"
                >
                  {selectedServerId
                    ? servers.find(s => s.id === selectedServerId)?.name || "서버를 선택하세요"
                    : "서버를 선택하세요"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 z-50 bg-popover" align="start">
                <Command>
                  <CommandInput placeholder="서버 검색..." />
                  <CommandList>
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      {servers.filter(s => s.isActive).map((server) => (
                        <CommandItem
                          key={server.id}
                          value={server.name}
                          onSelect={() => {
                            setSelectedServerId(server.id);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Server className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{server.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{server.description}</div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${getConnectionTypeBadge(server.connectionType)}`}>
                              {server.connectionType.toUpperCase()}
                            </Badge>
                          </div>
                          {selectedServerId === server.id && (
                            <Check className="ml-2 h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedServerId && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedServerId("")}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                선택 해제
              </Button>
            )}
          </div>

          {selectedServerId && (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px]">역할</TableHead>
                    {servers.find(s => s.id === selectedServerId)?.tools.map((tool) => (
                      <TableHead key={tool.id} className="text-center min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs">{tool.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                      </TableCell>
                      {servers.find(s => s.id === selectedServerId)?.tools.map((tool) => (
                        <TableCell key={tool.id} className="text-center">
                          <Checkbox
                            checked={getRolePermission(role.id, selectedServerId).includes(tool.id)}
                            onCheckedChange={() => toggleRoleToolPermission(role.id, selectedServerId, tool.id)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!selectedServerId && (
            <div className="text-center py-12 text-muted-foreground">
              MCP 서버를 선택하면 역할별 Tool 권한을 설정할 수 있습니다.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Server Create/Edit Modal */}
      <Dialog open={isServerModalOpen} onOpenChange={setIsServerModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "MCP 서버 수정" : "MCP 서버 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>서버명 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="MCP 서버 이름"
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="서버 설명"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>연결 방식 *</Label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={formData.connectionType}
                onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
              >
                <option value="stdio">STDIO (로컬 프로세스)</option>
                <option value="sse">SSE (Server-Sent Events)</option>
                <option value="http">HTTP</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>연결 URL/명령어 *</Label>
              <Input
                value={formData.connectionUrl}
                onChange={(e) => setFormData({ ...formData, connectionUrl: e.target.value })}
                placeholder={formData.connectionType === "stdio" ? "npx -y @anthropic/mcp-server-xxx" : "http://localhost:3001/mcp"}
              />
            </div>
            <div className="space-y-2">
              <Label>인증 방식</Label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={formData.authType}
                onChange={(e) => setFormData({ ...formData, authType: e.target.value as any })}
              >
                <option value="none">없음</option>
                <option value="api-key">API Key</option>
                <option value="oauth">OAuth</option>
              </select>
            </div>
            {formData.authType !== "none" && (
              <div className="space-y-2">
                <Label>인증 정보</Label>
                <Input
                  type="password"
                  value={formData.authValue}
                  onChange={(e) => setFormData({ ...formData, authValue: e.target.value })}
                  placeholder={formData.authType === "api-key" ? "API Key" : "OAuth Token"}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServerModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveServer} disabled={!formData.name || !formData.connectionUrl}>
              {isEditMode ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tool Detail Modal */}
      <Dialog open={isToolDetailOpen} onOpenChange={setIsToolDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              {selectedTool?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">설명</Label>
              <p className="mt-1">{selectedTool?.description}</p>
            </div>
            {selectedTool?.inputSchema && (
              <div>
                <Label className="text-muted-foreground">Input Schema</Label>
                <pre className="mt-1 p-3 rounded-lg bg-muted text-sm overflow-x-auto">
                  {selectedTool.inputSchema}
                </pre>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">상태:</Label>
              <Badge variant={selectedTool?.isEnabled ? "default" : "secondary"}>
                {selectedTool?.isEnabled ? "활성" : "비활성"}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
