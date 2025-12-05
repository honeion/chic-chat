import { User, Mail, Shield, Bell, Palette, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const MyPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: "프로필 설정", description: "이름, 사진 등 프로필 정보 관리" },
    { icon: Mail, label: "알림 설정", description: "이메일 및 푸시 알림 설정" },
    { icon: Shield, label: "보안 설정", description: "비밀번호 및 2단계 인증" },
    { icon: Bell, label: "Agent 알림", description: "Agent별 알림 수신 설정" },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">마이페이지</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            돌아가기
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">U</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">사용자</h2>
                <p className="text-sm text-muted-foreground">user@example.com</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  Lv.2 사용자
                </span>
              </div>
            </div>
          </div>

          {/* Theme Setting */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">테마 설정</p>
                  <p className="text-sm text-muted-foreground">라이트/다크 모드 전환</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="w-full p-4 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Logout */}
          <button className="w-full p-4 rounded-2xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-destructive">로그아웃</p>
              <p className="text-sm text-destructive/70">계정에서 로그아웃</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
