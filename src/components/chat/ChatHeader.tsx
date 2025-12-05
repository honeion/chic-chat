import { useTranslation } from "react-i18next";
import { Bot, Phone, Video, MoreVertical, Workflow } from "lucide-react";

export function ChatHeader() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-online border-2 border-card" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{t("chat.aiAssistant")}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-online" />
            {t("common.online")} • {t("chat.responseTime")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Workflow className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
