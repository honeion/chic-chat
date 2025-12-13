import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Building,
  Briefcase,
  Shield,
  Server,
  MoreHorizontal,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getSystemNames } from "@/data/systems";
import { SystemMultiSelect } from "./SystemMultiSelect";

type UserRole = "운영자" | "현업담당자" | "관리자";

interface UserData {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  systems: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

// 시스템관리에서 시스템 목록 가져오기
const availableSystems = getSystemNames();

// Mock data
const mockUsers: UserData[] = [
  {
    id: "u1",
    employeeId: "EMP001",
    name: "김철수",
    email: "kim@example.com",
    department: "IT운영팀",
    position: "과장",
    role: "운영자",
    systems: ["e-총무", "BiOn"],
    isActive: true,
    createdAt: "2024-01-15",
    lastLogin: "2024-12-09 09:30",
  },
  {
    id: "u2",
    employeeId: "EMP002",
    name: "이영희",
    email: "lee@example.com",
    department: "SI사업부",
    position: "대리",
    role: "현업담당자",
    systems: ["SATIS", "ITS"],
    isActive: true,
    createdAt: "2024-02-20",
    lastLogin: "2024-12-08 14:20",
  },
  {
    id: "u3",
    employeeId: "EMP003",
    name: "박관리",
    email: "admin@example.com",
    department: "경영지원팀",
    position: "팀장",
    role: "관리자",
    systems: ["e-총무", "BiOn", "SATIS", "ITS"],
    isActive: true,
    createdAt: "2023-06-01",
    lastLogin: "2024-12-09 10:00",
  },
  {
    id: "u4",
    employeeId: "EMP004",
    name: "최운영",
    email: "choi@example.com",
    department: "IT운영팀",
    position: "대리",
    role: "운영자",
    systems: ["e-총무"],
    isActive: false,
    createdAt: "2024-03-10",
    lastLogin: "2024-12-09 08:00",
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [createSelectedSystems, setCreateSelectedSystems] = useState<string[]>([]);
  const [editSelectedSystems, setEditSelectedSystems] = useState<string[]>([]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && user.isActive) ||
      (activeFilter === "inactive" && !user.isActive);
    
    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesActive && matchesRole;
  });

  const handleDelete = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setEditSelectedSystems(user.systems);
    setIsEditModalOpen(true);
  };

  const toggleCreateSystem = (system: string) => {
    setCreateSelectedSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const toggleEditSystem = (system: string) => {
    setEditSelectedSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="사용자 검색 (이름, 사번, 이메일)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[120px]"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
          >
            <option value="all">전체</option>
            <option value="active">사용</option>
            <option value="inactive">미사용</option>
          </select>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          사용자 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
            roleFilter === "all" && "ring-2 ring-primary"
          )}
          onClick={() => setRoleFilter("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">전체사용자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-accent/50",
            roleFilter === "운영자" && "ring-2 ring-accent"
          )}
          onClick={() => setRoleFilter("운영자")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "운영자").length}</p>
                <p className="text-xs text-muted-foreground">운영자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-muted-foreground/50",
            roleFilter === "현업담당자" && "ring-2 ring-muted-foreground"
          )}
          onClick={() => setRoleFilter("현업담당자")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "현업담당자").length}
                </p>
                <p className="text-xs text-muted-foreground">현업담당자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:ring-2 hover:ring-status-online/50",
            roleFilter === "관리자" && "ring-2 ring-status-online"
          )}
          onClick={() => setRoleFilter("관리자")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-online/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-status-online" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "관리자").length}</p>
                <p className="text-xs text-muted-foreground">관리자</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 text-sm">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">사용자</th>
                  <th className="text-left px-4 py-3 font-medium">부서/직책</th>
                  <th className="text-left px-4 py-3 font-medium">담당 시스템</th>
                  <th className="text-left px-4 py-3 font-medium">권한</th>
                  <th className="text-left px-4 py-3 font-medium">사용여부</th>
                  <th className="text-left px-4 py-3 font-medium">마지막 로그인</th>
                  <th className="text-right px-4 py-3 font-medium">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{user.name}</p>
                            {user.role === "관리자" && (
                              <Badge variant="default" className="text-xs px-1.5 py-0">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{user.department}</p>
                      <p className="text-xs text-muted-foreground">{user.position}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.systems.map((system) => (
                          <Badge key={system} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant={user.role === "관리자" ? "default" : user.role === "운영자" ? "secondary" : "outline"} 
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {user.isActive ? (
                          <CheckCircle className="w-4 h-4 text-status-online" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span className={cn("text-xs", user.isActive ? "text-status-online" : "text-destructive")}>
                          {user.isActive ? "사용" : "미사용"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.lastLogin}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
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

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>사용자 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">사번</label>
                <Input placeholder="사번 입력" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">이름</label>
                <Input placeholder="이름 입력" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">이메일</label>
              <Input type="email" placeholder="이메일 입력" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">부서</label>
                <Input placeholder="부서 입력" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">직책</label>
                <Input placeholder="직책 입력" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">담당 시스템</label>
              <SystemMultiSelect
                systems={availableSystems}
                selectedSystems={createSelectedSystems}
                onChange={setCreateSelectedSystems}
                placeholder="담당 시스템 선택"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">권한</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="운영자">운영자</option>
                  <option value="현업담당자">현업담당자</option>
                  <option value="관리자">관리자</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">사용여부</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="true">사용</option>
                  <option value="false">미사용</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>사용자 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">사번</label>
                <Input placeholder="사번 입력" defaultValue={selectedUser?.employeeId} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">이름</label>
                <Input placeholder="이름 입력" defaultValue={selectedUser?.name} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">이메일</label>
              <Input
                type="email"
                placeholder="이메일 입력"
                defaultValue={selectedUser?.email}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">부서</label>
                <Input placeholder="부서 입력" defaultValue={selectedUser?.department} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">직책</label>
                <Input placeholder="직책 입력" defaultValue={selectedUser?.position} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">담당 시스템</label>
              <SystemMultiSelect
                systems={availableSystems}
                selectedSystems={editSelectedSystems}
                onChange={setEditSelectedSystems}
                placeholder="담당 시스템 선택"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">권한</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  defaultValue={selectedUser?.role}
                >
                  <option value="운영자">운영자</option>
                  <option value="현업담당자">현업담당자</option>
                  <option value="관리자">관리자</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">사용여부</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  defaultValue={selectedUser?.isActive ? "true" : "false"}
                >
                  <option value="true">사용</option>
                  <option value="false">미사용</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
