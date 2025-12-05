import { User, Mail, Shield, Bell, Palette, LogOut, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";

const MyPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    { icon: User, label: t("mypage.profile"), description: t("mypage.profileDesc") },
    { icon: Mail, label: t("mypage.notification"), description: t("mypage.notificationDesc") },
    { icon: Shield, label: t("mypage.security"), description: t("mypage.securityDesc") },
    { icon: Bell, label: t("mypage.agentNotification"), description: t("mypage.agentNotificationDesc") },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("mypage.title")}</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("common.back")}
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
                  {t("mypage.userLevel")}
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
                  <p className="font-medium">{t("mypage.theme")}</p>
                  <p className="text-sm text-muted-foreground">{t("mypage.themeDesc")}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Language Setting */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{t("mypage.language")}</p>
                  <p className="text-sm text-muted-foreground">{t("mypage.languageDesc")}</p>
                </div>
              </div>
              <LanguageSelector />
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
              <p className="font-medium text-destructive">{t("common.logout")}</p>
              <p className="text-sm text-destructive/70">{t("mypage.logoutDesc")}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
