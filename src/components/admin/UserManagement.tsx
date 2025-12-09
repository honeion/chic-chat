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

interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  customerCompany: string;
  systems: string[];
  permissions: string[];
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
}

// Mock data
const mockUsers: UserData[] = [
  {
    id: "u1",
    name: "김철수",
    email: "kim@example.com",
    department: "IT운영팀",
    position: "과장",
    customerCompany: "A고객사",
    systems: ["e-총무", "BiOn"],
    permissions: ["ITS Agent", "SOP Agent", "Tool-1", "Tool-2"],
    isAdmin: false,
    createdAt: "2024-01-15",
    lastLogin: "2024-12-09 09:30",
  },
  {
    id: "u2",
    name: "이영희",
    email: "lee@example.com",
    department: "SI사업부",
    position: "대리",
    customerCompany: "B고객사",
    systems: ["SATIS", "ITS"],
    permissions: ["모니터링 Agent", "DB Agent", "Tool-3"],
    isAdmin: false,
    createdAt: "2024-02-20",
    lastLogin: "2024-12-08 14:20",
  },
  {
    id: "u3",
    name: "박관리",
    email: "admin@example.com",
    department: "경영지원팀",
    position: "팀장",
    customerCompany: "-",
    systems: ["e-총무", "BiOn", "SATIS", "ITS"],
    permissions: ["전체 Agent", "전체 Tool"],
    isAdmin: true,
    createdAt: "2023-06-01",
    lastLogin: "2024-12-09 10:00",
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="사용자 검색 (이름, 이메일, 부서)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          사용자 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">전체 사용자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-online/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-status-online" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter((u) => u.isAdmin).length}</p>
                <p className="text-xs text-muted-foreground">관리자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Building className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(users.map((u) => u.department)).size}
                </p>
                <p className="text-xs text-muted-foreground">부서</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(users.map((u) => u.customerCompany).filter((c) => c !== "-")).size}
                </p>
                <p className="text-xs text-muted-foreground">고객사</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5" />
            사용자 목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 text-sm">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">사용자</th>
                  <th className="text-left px-4 py-3 font-medium">부서/직책</th>
                  <th className="text-left px-4 py-3 font-medium">고객사</th>
                  <th className="text-left px-4 py-3 font-medium">담당 시스템</th>
                  <th className="text-left px-4 py-3 font-medium">권한</th>
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
                            {user.isAdmin && (
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
                    <td className="px-4 py-3 text-sm">{user.customerCompany}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.systems.slice(0, 2).map((system) => (
                          <Badge key={system} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                        {user.systems.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.systems.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 2).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {user.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 2}
                          </Badge>
                        )}
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
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>사용자 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">이름</label>
                <Input placeholder="이름 입력" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">이메일</label>
                <Input type="email" placeholder="이메일 입력" />
              </div>
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
              <label className="text-sm font-medium mb-1.5 block">고객사</label>
              <Input placeholder="담당 고객사 입력" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAdmin" className="rounded" />
              <label htmlFor="isAdmin" className="text-sm">
                관리자 권한 부여
              </label>
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
                <label className="text-sm font-medium mb-1.5 block">이름</label>
                <Input placeholder="이름 입력" defaultValue={selectedUser?.name} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">이메일</label>
                <Input
                  type="email"
                  placeholder="이메일 입력"
                  defaultValue={selectedUser?.email}
                />
              </div>
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
              <label className="text-sm font-medium mb-1.5 block">고객사</label>
              <Input
                placeholder="담당 고객사 입력"
                defaultValue={selectedUser?.customerCompany}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAdminEdit"
                className="rounded"
                defaultChecked={selectedUser?.isAdmin}
              />
              <label htmlFor="isAdminEdit" className="text-sm">
                관리자 권한 부여
              </label>
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
