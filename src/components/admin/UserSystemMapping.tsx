import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Plus, Trash2, User, Server, Link2, ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface UserSystemMap {
  id: string;
  userId: string;
  userName: string;
  userDepartment: string;
  systemId: string;
  systemName: string;
  role: "primary" | "secondary" | "support";
  assignedAt: string;
}

const mockMappings: UserSystemMap[] = [
  {
    id: "m1",
    userId: "u1",
    userName: "김철수",
    userDepartment: "IT운영팀",
    systemId: "s1",
    systemName: "e-총무",
    role: "primary",
    assignedAt: "2024-01-15",
  },
  {
    id: "m2",
    userId: "u1",
    userName: "김철수",
    userDepartment: "IT운영팀",
    systemId: "s2",
    systemName: "BiOn",
    role: "secondary",
    assignedAt: "2024-02-10",
  },
  {
    id: "m3",
    userId: "u2",
    userName: "이영희",
    userDepartment: "SI사업부",
    systemId: "s3",
    systemName: "SATIS",
    role: "primary",
    assignedAt: "2024-02-20",
  },
  {
    id: "m4",
    userId: "u2",
    userName: "이영희",
    userDepartment: "SI사업부",
    systemId: "s4",
    systemName: "ITS",
    role: "support",
    assignedAt: "2024-03-01",
  },
  {
    id: "m5",
    userId: "u3",
    userName: "박민수",
    userDepartment: "인프라팀",
    systemId: "s1",
    systemName: "e-총무",
    role: "support",
    assignedAt: "2024-01-20",
  },
];

const mockUsers = [
  { id: "u1", name: "김철수", department: "IT운영팀" },
  { id: "u2", name: "이영희", department: "SI사업부" },
  { id: "u3", name: "박민수", department: "인프라팀" },
  { id: "u4", name: "정다현", department: "개발팀" },
];

const mockSystems = [
  { id: "s1", name: "e-총무" },
  { id: "s2", name: "BiOn" },
  { id: "s3", name: "SATIS" },
  { id: "s4", name: "ITS" },
];

export function UserSystemMapping() {
  const [mappings, setMappings] = useState<UserSystemMap[]>(mockMappings);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"user" | "system">("user");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [selectedRole, setSelectedRole] = useState<"primary" | "secondary" | "support">("primary");

  const filteredMappings = mappings.filter(
    (m) =>
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.systemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by user or system
  const groupedData =
    filterType === "user"
      ? filteredMappings.reduce((acc, m) => {
          if (!acc[m.userId]) {
            acc[m.userId] = {
              key: m.userId,
              name: m.userName,
              department: m.userDepartment,
              items: [],
            };
          }
          acc[m.userId].items.push(m);
          return acc;
        }, {} as Record<string, { key: string; name: string; department: string; items: UserSystemMap[] }>)
      : filteredMappings.reduce((acc, m) => {
          if (!acc[m.systemId]) {
            acc[m.systemId] = {
              key: m.systemId,
              name: m.systemName,
              department: "",
              items: [],
            };
          }
          acc[m.systemId].items.push(m);
          return acc;
        }, {} as Record<string, { key: string; name: string; department: string; items: UserSystemMap[] }>);

  const getRoleBadge = (role: UserSystemMap["role"]) => {
    switch (role) {
      case "primary":
        return <Badge className="bg-primary text-primary-foreground">주담당</Badge>;
      case "secondary":
        return <Badge className="bg-accent text-accent-foreground">부담당</Badge>;
      case "support":
        return <Badge variant="secondary">지원</Badge>;
    }
  };

  const handleDelete = (mappingId: string) => {
    setMappings(mappings.filter((m) => m.id !== mappingId));
  };

  const handleCreate = () => {
    if (!selectedUser || !selectedSystem) return;

    const user = mockUsers.find((u) => u.id === selectedUser);
    const system = mockSystems.find((s) => s.id === selectedSystem);
    if (!user || !system) return;

    const newMapping: UserSystemMap = {
      id: `m${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userDepartment: user.department,
      systemId: system.id,
      systemName: system.name,
      role: selectedRole,
      assignedAt: new Date().toISOString().split("T")[0],
    };

    setMappings([...mappings, newMapping]);
    setIsCreateModalOpen(false);
    setSelectedUser("");
    setSelectedSystem("");
    setSelectedRole("primary");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="사용자 또는 시스템 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={filterType === "user" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("user")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              사용자별
            </Button>
            <Button
              variant={filterType === "system" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType("system")}
              className="gap-2"
            >
              <Server className="w-4 h-4" />
              시스템별
            </Button>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          맵핑 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mappings.length}</p>
                <p className="text-xs text-muted-foreground">전체 맵핑</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(mappings.map((m) => m.userId)).size}</p>
                <p className="text-xs text-muted-foreground">담당자 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Server className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(mappings.map((m) => m.systemId)).size}
                </p>
                <p className="text-xs text-muted-foreground">시스템 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapping List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(groupedData).map((group) => (
          <Card key={group.key}>
            <CardHeader className="bg-primary/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  {filterType === "user" ? (
                    <User className="w-5 h-5 text-primary" />
                  ) : (
                    <Server className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  {group.department && (
                    <p className="text-xs text-muted-foreground">{group.department}</p>
                  )}
                </div>
                <Badge variant="outline" className="ml-auto">
                  {group.items.length}개
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                        {filterType === "user" ? (
                          <Server className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {filterType === "user" ? item.systemName : item.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">할당일: {item.assignedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(item.role)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>사용자-시스템 맵핑 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">사용자</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">사용자 선택</option>
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">시스템</label>
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">시스템 선택</option>
                {mockSystems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">역할</label>
              <div className="flex gap-2">
                {(["primary", "secondary", "support"] as const).map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                    className="flex-1"
                  >
                    {role === "primary" ? "주담당" : role === "secondary" ? "부담당" : "지원"}
                  </Button>
                ))}
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
