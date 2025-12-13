import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Bot, Wrench, Users, Server, Briefcase, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type UserRole = "관리자" | "운영자(조회)" | "운영자(제어)" | "현업담당자";

interface RolePermission {
  roleId: UserRole;
  roleName: string;
  description: string;
  icon: React.ReactNode;
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
  { id: "infra", name: "인프라 Agent" },
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

const initialRolePermissions: RolePermission[] = [
  {
    roleId: "관리자",
    roleName: "관리자",
    description: "시스템 전체 관리 권한을 가진 최고 권한 그룹",
    icon: <Crown className="w-5 h-5 text-status-online" />,
    agentPermissions: {
      its: true, sop: true, change: true, db: true, monitoring: true, report: true, biz: true, infra: true,
    },
    toolPermissions: { t1: true, t2: true, t3: true, t4: true, t5: true, t6: true, t7: true, t8: true },
  },
  {
    roleId: "운영자(제어)",
    roleName: "운영자(제어)",
    description: "시스템 운영 및 제어 권한을 가진 그룹",
    icon: <Server className="w-5 h-5 text-blue-500" />,
    agentPermissions: {
      its: true, sop: true, change: true, db: true, monitoring: true, report: true, biz: true, infra: true,
    },
    toolPermissions: { t1: true, t2: true, t3: true, t4: true, t5: true, t6: true, t7: true, t8: true },
  },
  {
    roleId: "운영자(조회)",
    roleName: "운영자(조회)",
    description: "시스템 모니터링 및 조회만 가능한 그룹",
    icon: <Server className="w-5 h-5 text-accent" />,
    agentPermissions: {
      its: true, sop: true, change: false, db: true, monitoring: true, report: true, biz: true, infra: false,
    },
    toolPermissions: { t1: true, t2: true, t3: true, t4: true, t5: false, t6: true, t7: false, t8: false },
  },
  {
    roleId: "현업담당자",
    roleName: "현업담당자",
    description: "업무 시스템 사용 및 요청 권한을 가진 그룹",
    icon: <Briefcase className="w-5 h-5 text-muted-foreground" />,
    agentPermissions: {
      its: true, sop: false, change: false, db: false, monitoring: false, report: true, biz: true, infra: false,
    },
    toolPermissions: { t1: false, t2: false, t3: false, t4: true, t5: false, t6: true, t7: false, t8: false },
  },
];

export function PermissionManagement() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(initialRolePermissions);
  const [viewMode, setViewMode] = useState<"agent" | "tool">("agent");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const toggleAgentPermission = (roleId: UserRole, agentId: string) => {
    setRolePermissions(
      rolePermissions.map((r) =>
        r.roleId === roleId
          ? {
              ...r,
              agentPermissions: {
                ...r.agentPermissions,
                [agentId]: !r.agentPermissions[agentId],
              },
            }
          : r
      )
    );
  };

  const toggleToolPermission = (roleId: UserRole, toolId: string) => {
    setRolePermissions(
      rolePermissions.map((r) =>
        r.roleId === roleId
          ? {
              ...r,
              toolPermissions: {
                ...r.toolPermissions,
                [toolId]: !r.toolPermissions[toolId],
              },
            }
          : r
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
        <div className="flex items-center gap-4">
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

      {/* Role Cards */}
      <div className="grid grid-cols-4 gap-4">
        {rolePermissions.map((role) => (
          <Card 
            key={role.roleId}
            className={cn(
              "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
              selectedRole === role.roleId && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedRole(selectedRole === role.roleId ? null : role.roleId)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {role.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{role.roleName}</p>
                  <p className="text-xs text-muted-foreground">
                    Agent {countEnabled(role.agentPermissions)}/{agents.length} · Tool {countEnabled(role.toolPermissions)}/{tools.length}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      {viewMode === "agent" ? (
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-5 h-5" />
              권한 그룹별 Agent 사용 권한
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 text-sm">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium min-w-[180px]">권한 그룹</th>
                    {agents.map((agent) => (
                      <th key={agent.id} className="text-center px-3 py-3 font-medium text-xs">
                        {agent.name}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 font-medium">활성</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rolePermissions.map((role) => (
                    <tr 
                      key={role.roleId} 
                      className={cn(
                        "hover:bg-secondary/30 transition-colors",
                        selectedRole === role.roleId && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            {role.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{role.roleName}</p>
                          </div>
                        </div>
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="text-center px-3 py-3">
                          <Switch
                            checked={role.agentPermissions[agent.id] || false}
                            onCheckedChange={() => toggleAgentPermission(role.roleId, agent.id)}
                          />
                        </td>
                      ))}
                      <td className="text-center px-4 py-3">
                        <Badge variant="secondary">
                          {countEnabled(role.agentPermissions)}/{agents.length}
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
              권한 그룹별 Tool 접근 권한
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Accordion type="multiple" defaultValue={rolePermissions.map((r) => r.roleId)}>
              {rolePermissions.map((role) => (
                <AccordionItem key={role.roleId} value={role.roleId}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        {role.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{role.roleName}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {countEnabled(role.toolPermissions)}/{tools.length} Tool
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
                                  role.toolPermissions[tool.id]
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-secondary/30 border-border"
                                )}
                              >
                                <span className="text-sm">{tool.name}</span>
                                <Switch
                                  checked={role.toolPermissions[tool.id] || false}
                                  onCheckedChange={() => toggleToolPermission(role.roleId, tool.id)}
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
          * 권한 그룹별로 Agent 및 Tool 사용 권한을 설정합니다. 사용자의 권한은 사용자관리에서 권한 그룹을 지정하여 적용됩니다.
        </p>
      </div>
    </div>
  );
}
