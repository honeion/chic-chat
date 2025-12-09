import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Shield, Bot, Wrench, User, Check, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface UserPermission {
  userId: string;
  userName: string;
  department: string;
  agentPermissions: Record<string, boolean>;
  toolPermissions: Record<string, boolean>;
}

const agents = [
  { id: "its", name: "ITS Agent" },
  { id: "sop", name: "SOP Agent" },
  { id: "change", name: "변경관리 Agent" },
  { id: "db", name: "DB Agent" },
  { id: "monitoring", name: "모니터링 Agent" },
  { id: "report", name: "보고서 Agent" },
  { id: "biz", name: "Biz.Support Agent" },
];

const tools = [
  { id: "t1", name: "Health Check", category: "모니터링" },
  { id: "t2", name: "Log Analyzer", category: "모니터링" },
  { id: "t3", name: "DB Connect", category: "데이터" },
  { id: "t4", name: "Report Gen", category: "보고서" },
  { id: "t5", name: "Alert Send", category: "알림" },
  { id: "t6", name: "Ticket Parser", category: "티켓" },
  { id: "t7", name: "Deploy", category: "배포" },
  { id: "t8", name: "Backup", category: "백업" },
];

const mockUserPermissions: UserPermission[] = [
  {
    userId: "u1",
    userName: "김철수",
    department: "IT운영팀",
    agentPermissions: {
      its: true,
      sop: true,
      change: false,
      db: true,
      monitoring: true,
      report: false,
      biz: true,
    },
    toolPermissions: { t1: true, t2: true, t3: true, t4: false, t5: true, t6: true, t7: false, t8: true },
  },
  {
    userId: "u2",
    userName: "이영희",
    department: "SI사업부",
    agentPermissions: {
      its: true,
      sop: false,
      change: true,
      db: true,
      monitoring: false,
      report: true,
      biz: false,
    },
    toolPermissions: { t1: true, t2: false, t3: true, t4: true, t5: false, t6: true, t7: true, t8: false },
  },
  {
    userId: "u3",
    userName: "박민수",
    department: "인프라팀",
    agentPermissions: {
      its: true,
      sop: true,
      change: true,
      db: true,
      monitoring: true,
      report: true,
      biz: true,
    },
    toolPermissions: { t1: true, t2: true, t3: true, t4: true, t5: true, t6: true, t7: true, t8: true },
  },
];

export function PermissionManagement() {
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>(mockUserPermissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"agent" | "tool">("agent");

  const filteredUsers = userPermissions.filter(
    (u) =>
      u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAgentPermission = (userId: string, agentId: string) => {
    setUserPermissions(
      userPermissions.map((u) =>
        u.userId === userId
          ? {
              ...u,
              agentPermissions: {
                ...u.agentPermissions,
                [agentId]: !u.agentPermissions[agentId],
              },
            }
          : u
      )
    );
  };

  const toggleToolPermission = (userId: string, toolId: string) => {
    setUserPermissions(
      userPermissions.map((u) =>
        u.userId === userId
          ? {
              ...u,
              toolPermissions: {
                ...u.toolPermissions,
                [toolId]: !u.toolPermissions[toolId],
              },
            }
          : u
      )
    );
  };

  const countEnabled = (perms: Record<string, boolean>) =>
    Object.values(perms).filter(Boolean).length;

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="사용자 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === "agent" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("agent")}
              className="gap-2"
            >
              <Bot className="w-4 h-4" />
              Agent 권한
            </Button>
            <Button
              variant={viewMode === "tool" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tool")}
              className="gap-2"
            >
              <Wrench className="w-4 h-4" />
              Tool 권한
            </Button>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      {viewMode === "agent" ? (
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Agent 사용 권한
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 text-sm">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium min-w-[150px]">사용자</th>
                    {agents.map((agent) => (
                      <th key={agent.id} className="text-center px-3 py-3 font-medium text-xs">
                        {agent.name}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 font-medium">활성</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.userName}</p>
                            <p className="text-xs text-muted-foreground">{user.department}</p>
                          </div>
                        </div>
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="text-center px-3 py-3">
                          <Switch
                            checked={user.agentPermissions[agent.id] || false}
                            onCheckedChange={() => toggleAgentPermission(user.userId, agent.id)}
                          />
                        </td>
                      ))}
                      <td className="text-center px-4 py-3">
                        <Badge variant="secondary">
                          {countEnabled(user.agentPermissions)}/{agents.length}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Tool 접근 권한
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Accordion type="multiple" defaultValue={filteredUsers.map((u) => u.userId)}>
              {filteredUsers.map((user) => (
                <AccordionItem key={user.userId} value={user.userId}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">{user.department}</p>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {countEnabled(user.toolPermissions)}/{tools.length} Tool
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-11 pt-2 space-y-4">
                      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {categoryTools.map((tool) => (
                              <div
                                key={tool.id}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded-lg border transition-colors",
                                  user.toolPermissions[tool.id]
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-secondary/30 border-border"
                                )}
                              >
                                <span className="text-sm">{tool.name}</span>
                                <Switch
                                  checked={user.toolPermissions[tool.id] || false}
                                  onCheckedChange={() => toggleToolPermission(user.userId, tool.id)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-primary rounded-full" />
          <span>권한 있음</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-secondary rounded-full" />
          <span>권한 없음</span>
        </div>
        <p className="text-xs">
          * Tool 권한이 없으면 My Agent 등록 및 Assistant 도구 선택에서 해당 Tool을 사용할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
