import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  Users,
  Bot,
  MessageSquare,
  TrendingUp,
  Server,
  Calendar,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { mockSystems } from "@/data/systems";

// Mock data for user usage
interface UserUsage {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  loginCount: number;
  messageCount: number;
  agentUsage: number;
  lastAccess: string;
  status: "active" | "inactive";
}

const mockUserUsage: UserUsage[] = [
  { id: "u1", name: "김철수", employeeId: "E001", department: "IT운영팀", role: "운영자", loginCount: 45, messageCount: 320, agentUsage: 85, lastAccess: "2024-12-09 09:30", status: "active" },
  { id: "u2", name: "이영희", employeeId: "E002", department: "IT운영팀", role: "운영자", loginCount: 38, messageCount: 280, agentUsage: 72, lastAccess: "2024-12-09 08:45", status: "active" },
  { id: "u3", name: "박민수", employeeId: "E003", department: "개발팀", role: "현업담당자", loginCount: 52, messageCount: 450, agentUsage: 120, lastAccess: "2024-12-09 10:15", status: "active" },
  { id: "u4", name: "정다현", employeeId: "E004", department: "기획팀", role: "현업담당자", loginCount: 28, messageCount: 180, agentUsage: 45, lastAccess: "2024-12-08 17:30", status: "inactive" },
  { id: "u5", name: "최우진", employeeId: "E005", department: "IT운영팀", role: "관리자", loginCount: 62, messageCount: 520, agentUsage: 150, lastAccess: "2024-12-09 09:00", status: "active" },
  { id: "u6", name: "홍길동", employeeId: "E006", department: "영업팀", role: "현업담당자", loginCount: 15, messageCount: 95, agentUsage: 22, lastAccess: "2024-12-07 14:20", status: "inactive" },
];

// Mock data for system usage
interface SystemUsage {
  id: string;
  name: string;
  shortName: string;
  totalRequests: number;
  activeUsers: number;
  agentCalls: number;
  avgResponseTime: string;
  uptime: string;
  lastAccess: string;
  status: "healthy" | "warning" | "error";
}

const mockSystemUsage: SystemUsage[] = [
  { id: "s1", name: "전자총무시스템", shortName: "e-총무", totalRequests: 2450, activeUsers: 28, agentCalls: 890, avgResponseTime: "120ms", uptime: "99.8%", lastAccess: "2024-12-09 10:20", status: "healthy" },
  { id: "s2", name: "구매시스템", shortName: "BiOn", totalRequests: 1820, activeUsers: 22, agentCalls: 650, avgResponseTime: "145ms", uptime: "99.5%", lastAccess: "2024-12-09 10:18", status: "healthy" },
  { id: "s3", name: "영업물류시스템", shortName: "SATIS", totalRequests: 3200, activeUsers: 35, agentCalls: 1200, avgResponseTime: "180ms", uptime: "98.2%", lastAccess: "2024-12-09 10:15", status: "warning" },
  { id: "s4", name: "IT서비스관리", shortName: "ITS", totalRequests: 4500, activeUsers: 45, agentCalls: 1850, avgResponseTime: "95ms", uptime: "99.9%", lastAccess: "2024-12-09 10:22", status: "healthy" },
];

// Mock data for agent usage
interface AgentUsage {
  id: string;
  name: string;
  type: string;
  totalCalls: number;
  uniqueUsers: number;
  successRate: string;
  avgProcessTime: string;
  lastUsed: string;
  status: "active" | "idle" | "error";
}

const mockAgentUsage: AgentUsage[] = [
  { id: "a1", name: "ITS Agent", type: "IT서비스", totalCalls: 1850, uniqueUsers: 42, successRate: "98.5%", avgProcessTime: "2.3s", lastUsed: "2024-12-09 10:20", status: "active" },
  { id: "a2", name: "SOP Agent", type: "표준운영", totalCalls: 1420, uniqueUsers: 35, successRate: "97.8%", avgProcessTime: "3.1s", lastUsed: "2024-12-09 10:18", status: "active" },
  { id: "a3", name: "DB Agent", type: "데이터베이스", totalCalls: 980, uniqueUsers: 28, successRate: "99.2%", avgProcessTime: "1.8s", lastUsed: "2024-12-09 10:15", status: "active" },
  { id: "a4", name: "모니터링 Agent", type: "모니터링", totalCalls: 2200, uniqueUsers: 18, successRate: "99.5%", avgProcessTime: "0.8s", lastUsed: "2024-12-09 10:22", status: "active" },
  { id: "a5", name: "변경관리 Agent", type: "변경관리", totalCalls: 650, uniqueUsers: 22, successRate: "96.5%", avgProcessTime: "4.2s", lastUsed: "2024-12-09 09:45", status: "idle" },
  { id: "a6", name: "보고서 Agent", type: "보고서", totalCalls: 420, uniqueUsers: 30, successRate: "98.0%", avgProcessTime: "5.5s", lastUsed: "2024-12-09 09:30", status: "idle" },
  { id: "a7", name: "Biz.Support Agent", type: "업무지원", totalCalls: 380, uniqueUsers: 25, successRate: "97.2%", avgProcessTime: "2.8s", lastUsed: "2024-12-08 17:00", status: "idle" },
  { id: "a8", name: "Infra Agent", type: "인프라", totalCalls: 520, uniqueUsers: 12, successRate: "99.0%", avgProcessTime: "1.5s", lastUsed: "2024-12-09 10:10", status: "active" },
];

// Chart data
const dailyUsageData = [
  { date: "12/03", users: 42, requests: 1200, agents: 850 },
  { date: "12/04", users: 45, requests: 1350, agents: 920 },
  { date: "12/05", users: 38, requests: 1100, agents: 780 },
  { date: "12/06", users: 52, requests: 1580, agents: 1100 },
  { date: "12/07", users: 35, requests: 980, agents: 650 },
  { date: "12/08", users: 28, requests: 720, agents: 480 },
  { date: "12/09", users: 48, requests: 1420, agents: 980 },
];

const hourlyUsageData = [
  { time: "00:00", users: 5, requests: 45 },
  { time: "04:00", users: 3, requests: 28 },
  { time: "08:00", users: 35, requests: 320 },
  { time: "10:00", users: 48, requests: 450 },
  { time: "12:00", users: 42, requests: 380 },
  { time: "14:00", users: 52, requests: 520 },
  { time: "16:00", users: 45, requests: 420 },
  { time: "18:00", users: 28, requests: 180 },
  { time: "20:00", users: 15, requests: 95 },
  { time: "22:00", users: 8, requests: 52 },
];

export function AdminMonitoring() {
  const [activeTab, setActiveTab] = useState("user");
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
  const [searchQuery, setSearchQuery] = useState("");

  // User tab filters
  const [userDeptFilter, setUserDeptFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  // System tab filters
  const [systemStatusFilter, setSystemStatusFilter] = useState("");

  // Agent tab filters
  const [agentTypeFilter, setAgentTypeFilter] = useState("");
  const [agentStatusFilter, setAgentStatusFilter] = useState("");

  const filteredUsers = useMemo(() => {
    return mockUserUsage.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = !userDeptFilter || user.department === userDeptFilter;
      const matchesRole = !userRoleFilter || user.role === userRoleFilter;
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [searchQuery, userDeptFilter, userRoleFilter]);

  const filteredSystems = useMemo(() => {
    return mockSystemUsage.filter((system) => {
      const matchesSearch =
        system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !systemStatusFilter || system.status === systemStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, systemStatusFilter]);

  const filteredAgents = useMemo(() => {
    return mockAgentUsage.filter((agent) => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !agentTypeFilter || agent.type === agentTypeFilter;
      const matchesStatus = !agentStatusFilter || agent.status === agentStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, agentTypeFilter, agentStatusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "healthy":
        return <Badge className="bg-status-online text-white">활성</Badge>;
      case "idle":
        return <Badge variant="secondary">대기</Badge>;
      case "warning":
        return <Badge className="bg-status-busy text-white">주의</Badge>;
      case "inactive":
      case "error":
        return <Badge variant="destructive">비활성</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Total stats
  const totalStats = {
    totalUsers: mockUserUsage.length,
    activeUsers: mockUserUsage.filter((u) => u.status === "active").length,
    totalSystems: mockSystemUsage.length,
    healthySystems: mockSystemUsage.filter((s) => s.status === "healthy").length,
    totalAgents: mockAgentUsage.length,
    activeAgents: mockAgentUsage.filter((a) => a.status === "active").length,
    totalRequests: mockSystemUsage.reduce((sum, s) => sum + s.totalRequests, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          접속 및 사용량 모니터링
        </h2>
        <div className="flex items-center gap-2 border rounded-lg p-1">
          {(["today", "week", "month"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range === "today" ? "오늘" : range === "week" ? "이번 주" : "이번 달"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalStats.activeUsers}/{totalStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">활성 사용자</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-status-online">
              <TrendingUp className="w-3 h-3" />
              <span>+5 vs 어제</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalStats.healthySystems}/{totalStats.totalSystems}</p>
                <p className="text-xs text-muted-foreground">정상 시스템</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Server className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>1 시스템 주의 필요</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalStats.activeAgents}/{totalStats.totalAgents}</p>
                <p className="text-xs text-muted-foreground">실행 중 Agent</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-online/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-status-online" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-status-online">
              <TrendingUp className="w-3 h-3" />
              <span>정상 작동 중</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalStats.totalRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">총 요청 수</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-status-online">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs 어제</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">일별 사용량 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="requests" name="요청" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="agents" name="Agent호출" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>요청 수</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>Agent 호출</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">시간대별 접속자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="users" name="접속자" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for User / System / Agent */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="user" className="gap-2">
              <Users className="w-4 h-4" />
              사용자별 ({mockUserUsage.length})
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Server className="w-4 h-4" />
              시스템별 ({mockSystemUsage.length})
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Bot className="w-4 h-4" />
              Agent별 ({mockAgentUsage.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
            </Button>
          </div>
        </div>

        {/* User Tab */}
        <TabsContent value="user" className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <select
              value={userDeptFilter}
              onChange={(e) => setUserDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">전체 부서</option>
              <option value="IT운영팀">IT운영팀</option>
              <option value="개발팀">개발팀</option>
              <option value="기획팀">기획팀</option>
              <option value="영업팀">영업팀</option>
            </select>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">전체 역할</option>
              <option value="운영자">운영자</option>
              <option value="현업담당자">현업담당자</option>
              <option value="관리자">관리자</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>사번</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead className="text-right">로그인</TableHead>
                    <TableHead className="text-right">메시지</TableHead>
                    <TableHead className="text-right">Agent 사용</TableHead>
                    <TableHead>최근 접속</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.employeeId}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{user.loginCount}회</TableCell>
                      <TableCell className="text-right">{user.messageCount}건</TableCell>
                      <TableCell className="text-right">{user.agentUsage}회</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastAccess}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border border-border z-50">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              상세보기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <select
              value={systemStatusFilter}
              onChange={(e) => setSystemStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">전체 상태</option>
              <option value="healthy">정상</option>
              <option value="warning">주의</option>
              <option value="error">오류</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시스템</TableHead>
                    <TableHead className="text-right">총 요청</TableHead>
                    <TableHead className="text-right">활성 사용자</TableHead>
                    <TableHead className="text-right">Agent 호출</TableHead>
                    <TableHead className="text-right">평균 응답</TableHead>
                    <TableHead className="text-right">가동률</TableHead>
                    <TableHead>최근 접속</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSystems.map((system) => (
                    <TableRow key={system.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{system.shortName}</p>
                          <p className="text-xs text-muted-foreground">{system.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{system.totalRequests.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{system.activeUsers}명</TableCell>
                      <TableCell className="text-right">{system.agentCalls.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{system.avgResponseTime}</TableCell>
                      <TableCell className="text-right">{system.uptime}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{system.lastAccess}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(system.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border border-border z-50">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              상세보기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Tab */}
        <TabsContent value="agent" className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <select
              value={agentTypeFilter}
              onChange={(e) => setAgentTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">전체 유형</option>
              <option value="IT서비스">IT서비스</option>
              <option value="표준운영">표준운영</option>
              <option value="데이터베이스">데이터베이스</option>
              <option value="모니터링">모니터링</option>
              <option value="변경관리">변경관리</option>
              <option value="보고서">보고서</option>
              <option value="업무지원">업무지원</option>
              <option value="인프라">인프라</option>
            </select>
            <select
              value={agentStatusFilter}
              onChange={(e) => setAgentStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">전체 상태</option>
              <option value="active">활성</option>
              <option value="idle">대기</option>
              <option value="error">오류</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent명</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead className="text-right">총 호출</TableHead>
                    <TableHead className="text-right">사용자 수</TableHead>
                    <TableHead className="text-right">성공률</TableHead>
                    <TableHead className="text-right">평균 처리시간</TableHead>
                    <TableHead>최근 사용</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{agent.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{agent.totalCalls.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.uniqueUsers}명</TableCell>
                      <TableCell className="text-right">{agent.successRate}</TableCell>
                      <TableCell className="text-right">{agent.avgProcessTime}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{agent.lastUsed}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(agent.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border border-border z-50">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              상세보기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
