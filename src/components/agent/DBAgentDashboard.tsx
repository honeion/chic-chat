import { useTranslation } from "react-i18next";
import { Database, HardDrive, Activity, Clock, CheckCircle, AlertTriangle, Search, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  connections: number;
  status: "online" | "maintenance" | "offline";
}

interface Query {
  id: string;
  query: string;
  duration: string;
  status: "running" | "completed" | "slow";
  timestamp: string;
}

const mockDatabases: DatabaseInfo[] = [
  { id: "db1", name: "PROD_DB", type: "Oracle", size: "2.5TB", connections: 145, status: "online" },
  { id: "db2", name: "DEV_DB", type: "PostgreSQL", size: "500GB", connections: 23, status: "online" },
  { id: "db3", name: "BACKUP_DB", type: "Oracle", size: "2.5TB", connections: 0, status: "maintenance" },
];

const mockQueries: Query[] = [
  { id: "q1", query: "SELECT * FROM orders WHERE date > ...", duration: "2.3s", status: "slow", timestamp: "10:45" },
  { id: "q2", query: "UPDATE inventory SET stock = ...", duration: "0.1s", status: "completed", timestamp: "10:44" },
  { id: "q3", query: "INSERT INTO logs VALUES ...", duration: "...", status: "running", timestamp: "10:45" },
];

export function DBAgentDashboard() {
  const { t } = useTranslation();

  const getStatusStyle = (status: DatabaseInfo["status"]) => {
    switch (status) {
      case "online": return "bg-status-online/20 text-status-online";
      case "maintenance": return "bg-status-busy/20 text-status-busy";
      case "offline": return "bg-destructive/20 text-destructive";
    }
  };

  const getStatusLabel = (status: DatabaseInfo["status"]) => {
    switch (status) {
      case "online": return t("common.online");
      case "maintenance": return t("common.maintenance");
      case "offline": return t("common.offline");
    }
  };

  const getQueryStatusStyle = (status: Query["status"]) => {
    switch (status) {
      case "running": return "bg-primary/20 text-primary";
      case "completed": return "bg-status-online/20 text-status-online";
      case "slow": return "bg-status-busy/20 text-status-busy";
    }
  };

  const totalConnections = mockDatabases.reduce((acc, db) => acc + db.connections, 0);
  const onlineCount = mockDatabases.filter(db => db.status === "online").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("db.totalDb")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{mockDatabases.length}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">{t("common.online")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-online">{onlineCount}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-2 bg-accent/20 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{t("db.totalConnections")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{totalConnections}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">{t("db.slowQueries")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-busy">3</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{t("db.dbStatus")}</span>
        </div>
        <div className="bg-background/80">
          <div className="grid grid-cols-3 gap-4 p-4">
            {mockDatabases.map(db => (
              <div key={db.id} className="p-4 rounded-lg border border-border/30 bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">{db.name}</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getStatusStyle(db.status))}>
                    {getStatusLabel(db.status)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground">{db.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">{db.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="text-foreground">{db.connections}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-accent/30">
        <div className="px-4 py-3 bg-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{t("db.queryMonitoring")}</span>
          </div>
          <button className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors flex items-center gap-1">
            <Play className="w-3 h-3" />
            {t("db.runQuery")}
          </button>
        </div>
        <div className="bg-background/80 divide-y divide-border/30">
          {mockQueries.map(query => (
            <div key={query.id} className="p-3 flex items-center gap-3">
              <code className="flex-1 text-xs text-muted-foreground font-mono truncate">{query.query}</code>
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getQueryStatusStyle(query.status))}>
                {query.duration}
              </span>
              <span className="text-xs text-muted-foreground">{query.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
