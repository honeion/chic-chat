import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Server,
  Globe,
  Cloud,
  ExternalLink,
  Copy,
  CheckCircle,
  Database,
  GitBranch,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { mockSystems, SystemData } from "@/data/systems";

// 환경별 세부정보 타입
type EnvType = "PROD" | "DEV" | "STG" | "DR";

// URL 정보 타입
interface UrlInfo {
  id: string;
  url: string;
  accessType: "internal" | "external";
  isPrimary: boolean;
  hostsRequired: boolean;
  hostsIp: string;
  description: string;
}

const defaultUrlInfo: UrlInfo = {
  id: "",
  url: "",
  accessType: "internal",
  isPrimary: false,
  hostsRequired: false,
  hostsIp: "",
  description: "",
};

// 서버 정보 타입
type InfraType = "CLOUD" | "ONPREM";
type ProviderType = "AWS" | "AZURE" | "PRIVATE";
type HostType = "K8S" | "VM";

interface ServerInfo {
  id: string;
  serverName: string;
  infraType: InfraType;
  provider: ProviderType;
  hostType: HostType;
  description: string;
  subscription: string;
  clusterName: string;
  namespace: string;
  k8sAuth: string;
  vmIp: string;
  vmOs: string;
  vmAuth: string;
}

const defaultServerInfo: ServerInfo = {
  id: "",
  serverName: "",
  infraType: "CLOUD",
  provider: "AWS",
  hostType: "K8S",
  description: "",
  subscription: "",
  clusterName: "",
  namespace: "",
  k8sAuth: "",
  vmIp: "",
  vmOs: "",
  vmAuth: "",
};

// DB 정보 타입
type DBType = "Postgres" | "MSSQL" | "MySQL" | "Oracle";

interface DBInfo {
  id: string;
  dbType: DBType;
  dbIp: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  keyVaultKey: string;
}

const defaultDBInfo: DBInfo = {
  id: "",
  dbType: "Postgres",
  dbIp: "",
  dbPort: "",
  dbName: "",
  dbUser: "",
  dbPassword: "",
  keyVaultKey: "",
};

// CI/CD 연결정보 타입
type RepoType = "GitHub" | "GitLab" | "Bitbucket" | "Azure DevOps" | "기타";
type PipelineType = "Jenkins" | "Azure DevOps" | "GitHub Actions" | "GitLab CI" | "ArgoCD" | "기타";

interface CICDInfo {
  id: string;
  repoType: RepoType;
  repoUrl: string;
  repoBranch: string;
  repoAuth: string;
  pipelineType: PipelineType;
  pipelineUrl: string;
  pipelineName: string;
  pipelineAuth: string;
  description: string;
}

const defaultCICDInfo: CICDInfo = {
  id: "",
  repoType: "GitHub",
  repoUrl: "",
  repoBranch: "main",
  repoAuth: "",
  pipelineType: "Jenkins",
  pipelineUrl: "",
  pipelineName: "",
  pipelineAuth: "",
  description: "",
};

interface EnvDetail {
  isEnabled: boolean;
  urls: UrlInfo[];
  servers: ServerInfo[];
  databases: DBInfo[];
  cicds: CICDInfo[];
  monitoringUrl: string;
  logPath: string;
  alertEmail: string;
}

const defaultEnvDetail: EnvDetail = {
  isEnabled: false,
  urls: [],
  servers: [],
  databases: [],
  cicds: [],
  monitoringUrl: "",
  logPath: "",
  alertEmail: "",
};

interface SystemDetailSettingsProps {
  systemId: string;
  systemName: string;
}

export function SystemDetailSettings({ systemId, systemName }: SystemDetailSettingsProps) {
  const { toast } = useToast();
  const [activeEnvTab, setActiveEnvTab] = useState<EnvType>("PROD");
  const [selectedSystem, setSelectedSystem] = useState<SystemData | null>(null);
  const [envDetails, setEnvDetails] = useState<Record<EnvType, EnvDetail>>({
    PROD: { ...defaultEnvDetail, isEnabled: true },
    DEV: { ...defaultEnvDetail },
    STG: { ...defaultEnvDetail },
    DR: { ...defaultEnvDetail },
  });

  // 시스템 데이터 로드
  useEffect(() => {
    const system = mockSystems.find(s => s.shortName === systemId || s.id === systemId || s.name === systemName);
    if (system) {
      setSelectedSystem(system);
      // 초기 데이터 설정
      const initialUrls: UrlInfo[] = [
        {
          id: crypto.randomUUID(),
          url: system.url,
          accessType: "external",
          isPrimary: true,
          hostsRequired: false,
          hostsIp: "",
          description: "서비스 대표 URL",
        },
        {
          id: crypto.randomUUID(),
          url: system.apiEndpoint,
          accessType: "internal",
          isPrimary: false,
          hostsRequired: true,
          hostsIp: "10.0.0.100",
          description: "API 엔드포인트",
        },
      ];
      const initialServers: ServerInfo[] = [
        {
          id: crypto.randomUUID(),
          serverName: system.shortName + "-PROD-01",
          infraType: "CLOUD",
          provider: "AWS",
          hostType: "K8S",
          description: "운영 K8S 클러스터",
          subscription: "prod-subscription",
          clusterName: system.shortName.toLowerCase() + "-cluster",
          namespace: system.namespace,
          k8sAuth: "kubeconfig",
          vmIp: "",
          vmOs: "",
          vmAuth: "",
        },
      ];
      const initialDatabases: DBInfo[] = [
        {
          id: crypto.randomUUID(),
          dbType: "Postgres",
          dbIp: "db-prod.example.com",
          dbPort: "5432",
          dbName: system.shortName.toLowerCase() + "_db",
          dbUser: system.shortName.toLowerCase() + "_user",
          dbPassword: "",
          keyVaultKey: "kv-" + system.shortName.toLowerCase() + "-db",
        },
      ];
      const initialCICDs: CICDInfo[] = [
        {
          id: crypto.randomUUID(),
          repoType: "GitHub",
          repoUrl: "https://github.com/example/" + system.shortName.toLowerCase(),
          repoBranch: "main",
          repoAuth: "github-token-" + system.shortName.toLowerCase(),
          pipelineType: "Jenkins",
          pipelineUrl: "https://jenkins.example.com/job/" + system.shortName.toLowerCase(),
          pipelineName: system.shortName + "-deploy",
          pipelineAuth: "jenkins-token-" + system.shortName.toLowerCase(),
          description: "운영 배포 파이프라인",
        },
      ];
      setEnvDetails({
        PROD: {
          isEnabled: true,
          urls: initialUrls,
          servers: initialServers,
          databases: initialDatabases,
          cicds: initialCICDs,
          monitoringUrl: "https://monitor.example.com/" + system.shortName.toLowerCase(),
          logPath: "/var/log/" + system.shortName.toLowerCase(),
          alertEmail: system.manager + "@example.com",
        },
        DEV: { ...defaultEnvDetail },
        STG: { ...defaultEnvDetail },
        DR: { ...defaultEnvDetail },
      });
    }
  }, [systemId, systemName]);

  // URL 추가
  const addUrl = (env: EnvType) => {
    const newUrl: UrlInfo = { ...defaultUrlInfo, id: crypto.randomUUID() };
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], urls: [...prev[env].urls, newUrl] },
    }));
  };

  // URL 삭제
  const removeUrl = (env: EnvType, urlId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], urls: prev[env].urls.filter(u => u.id !== urlId) },
    }));
  };

  // URL 정보 업데이트
  const updateUrlInfo = (env: EnvType, urlId: string, field: keyof UrlInfo, value: string | boolean) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        urls: prev[env].urls.map(u => u.id === urlId ? { ...u, [field]: value } : u),
      },
    }));
  };

  // 서버 추가
  const addServer = (env: EnvType) => {
    const newServer: ServerInfo = { ...defaultServerInfo, id: crypto.randomUUID() };
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], servers: [...prev[env].servers, newServer] },
    }));
  };

  // 서버 삭제
  const removeServer = (env: EnvType, serverId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], servers: prev[env].servers.filter(s => s.id !== serverId) },
    }));
  };

  // 서버 정보 업데이트
  const updateServerInfo = (env: EnvType, serverId: string, field: keyof ServerInfo, value: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        servers: prev[env].servers.map(s => s.id === serverId ? { ...s, [field]: value } : s),
      },
    }));
  };

  // DB 추가
  const addDatabase = (env: EnvType) => {
    const newDB: DBInfo = { ...defaultDBInfo, id: crypto.randomUUID() };
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], databases: [...prev[env].databases, newDB] },
    }));
  };

  // DB 삭제
  const removeDatabase = (env: EnvType, dbId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], databases: prev[env].databases.filter(d => d.id !== dbId) },
    }));
  };

  // DB 정보 업데이트
  const updateDatabaseInfo = (env: EnvType, dbId: string, field: keyof DBInfo, value: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        databases: prev[env].databases.map(d => d.id === dbId ? { ...d, [field]: value } : d),
      },
    }));
  };

  // CI/CD 추가
  const addCICD = (env: EnvType) => {
    const newCICD: CICDInfo = { ...defaultCICDInfo, id: crypto.randomUUID() };
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], cicds: [...prev[env].cicds, newCICD] },
    }));
  };

  // CI/CD 삭제
  const removeCICD = (env: EnvType, cicdId: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: { ...prev[env], cicds: prev[env].cicds.filter(c => c.id !== cicdId) },
    }));
  };

  // CI/CD 정보 업데이트
  const updateCICDInfo = (env: EnvType, cicdId: string, field: keyof CICDInfo, value: string) => {
    setEnvDetails(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        cicds: prev[env].cicds.map(c => c.id === cicdId ? { ...c, [field]: value } : c),
      },
    }));
  };

  // 환경 상태 업데이트
  const updateEnvDetail = (env: EnvType, field: keyof EnvDetail, value: string | boolean) => {
    setEnvDetails(prev => ({ ...prev, [env]: { ...prev[env], [field]: value } }));
  };

  // 복사
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "복사됨", description: "클립보드에 복사되었습니다." });
  };

  if (!selectedSystem) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        시스템 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Server className="w-4 h-4" />
          기본 정보
        </h4>
        <div className="p-3 rounded-lg bg-secondary/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">시스템약어명</label>
              <Input value={selectedSystem.shortName} readOnly className="h-8 text-sm mt-1 bg-muted/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">시스템명</label>
              <Input value={selectedSystem.name} readOnly className="h-8 text-sm mt-1 bg-muted/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">시스템유형</label>
              <Input value={selectedSystem.systemType} readOnly className="h-8 text-sm mt-1 bg-muted/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">담당자</label>
              <Input value={selectedSystem.manager} readOnly className="h-8 text-sm mt-1 bg-muted/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">상태</label>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={selectedSystem.isActive ? "bg-status-online" : "bg-destructive"}>
                  {selectedSystem.isActive ? "사용" : "미사용"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Detail Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Cloud className="w-4 h-4" />
          세부정보 (환경별)
        </h4>
        
        <Tabs value={activeEnvTab} onValueChange={(v) => setActiveEnvTab(v as EnvType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="PROD" className="gap-1 text-xs">
              PROD
              {envDetails.PROD.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
            </TabsTrigger>
            <TabsTrigger value="DEV" className="gap-1 text-xs">
              DEV
              {envDetails.DEV.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
            </TabsTrigger>
            <TabsTrigger value="STG" className="gap-1 text-xs">
              STG
              {envDetails.STG.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
            </TabsTrigger>
            <TabsTrigger value="DR" className="gap-1 text-xs">
              DR
              {envDetails.DR.isEnabled && <CheckCircle className="w-3 h-3 text-status-online" />}
            </TabsTrigger>
          </TabsList>

          {(["PROD", "DEV", "STG", "DR"] as EnvType[]).map((env) => (
            <TabsContent key={env} value={env} className="space-y-3 mt-3">
              {/* Environment Enable Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{env} 환경 사용</span>
                  {envDetails[env].isEnabled ? (
                    <Badge className="bg-status-online text-white text-xs">활성</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">비활성</Badge>
                  )}
                </div>
                <Switch
                  checked={envDetails[env].isEnabled}
                  onCheckedChange={(checked) => updateEnvDetail(env, "isEnabled", checked)}
                />
              </div>

              {/* Environment Details */}
              <div className={cn(
                "space-y-3 transition-opacity",
                !envDetails[env].isEnabled && "opacity-50 pointer-events-none"
              )}>
                {/* 접속정보 */}
                <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      접속정보
                    </h5>
                    <Button variant="outline" size="sm" onClick={() => addUrl(env)} className="h-6 text-xs px-2">
                      <Plus className="w-3 h-3 mr-1" />URL 추가
                    </Button>
                  </div>
                  
                  {envDetails[env].urls.length === 0 ? (
                    <div className="text-center py-3 text-muted-foreground text-xs">
                      등록된 URL이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {envDetails[env].urls.map((urlInfo, index) => (
                        <div key={urlInfo.id} className="p-2 rounded-lg bg-background/50 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">#{index + 1}</span>
                              {urlInfo.isPrimary && <Badge className="bg-primary text-primary-foreground text-xs h-4">대표</Badge>}
                              <Badge variant={urlInfo.accessType === "external" ? "default" : "secondary"} className="text-xs h-4">
                                {urlInfo.accessType === "external" ? "외부" : "내부"}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeUrl(env, urlInfo.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Input 
                              value={urlInfo.url}
                              onChange={(e) => updateUrlInfo(env, urlInfo.id, "url", e.target.value)}
                              placeholder="https://example.com"
                              className="flex-1 h-7 text-xs"
                            />
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleCopy(urlInfo.url)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                              <a href={urlInfo.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          </div>
                          <Input 
                            value={urlInfo.description}
                            onChange={(e) => updateUrlInfo(env, urlInfo.id, "description", e.target.value)}
                            placeholder="설명"
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 인프라정보 */}
                <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xs flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5" />
                      인프라정보
                    </h5>
                    <Button variant="outline" size="sm" onClick={() => addServer(env)} className="h-6 text-xs px-2">
                      <Plus className="w-3 h-3 mr-1" />서버 추가
                    </Button>
                  </div>
                  
                  {envDetails[env].servers.length === 0 ? (
                    <div className="text-center py-3 text-muted-foreground text-xs">
                      등록된 서버가 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {envDetails[env].servers.map((server, index) => (
                        <div key={server.id} className="p-2 rounded-lg bg-background/50 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">#{index + 1}</span>
                              <Badge variant="outline" className="text-xs h-4">{server.infraType}</Badge>
                              <Badge variant="outline" className="text-xs h-4">{server.hostType}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeServer(env, server.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <Input 
                            value={server.serverName}
                            onChange={(e) => updateServerInfo(env, server.id, "serverName", e.target.value)}
                            placeholder="서버명"
                            className="h-7 text-xs"
                          />
                          <div className="grid grid-cols-3 gap-1.5">
                            <Select value={server.infraType} onValueChange={(v: InfraType) => updateServerInfo(env, server.id, "infraType", v)}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="CLOUD">CLOUD</SelectItem>
                                <SelectItem value="ONPREM">ONPREM</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={server.provider} onValueChange={(v: ProviderType) => updateServerInfo(env, server.id, "provider", v)}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="AWS">AWS</SelectItem>
                                <SelectItem value="AZURE">AZURE</SelectItem>
                                <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={server.hostType} onValueChange={(v: HostType) => updateServerInfo(env, server.id, "hostType", v)}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="K8S">K8S</SelectItem>
                                <SelectItem value="VM">VM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {server.hostType === "K8S" ? (
                            <div className="grid grid-cols-2 gap-1.5">
                              <Input value={server.namespace} onChange={(e) => updateServerInfo(env, server.id, "namespace", e.target.value)} placeholder="Namespace" className="h-7 text-xs" />
                              <Input value={server.clusterName} onChange={(e) => updateServerInfo(env, server.id, "clusterName", e.target.value)} placeholder="Cluster" className="h-7 text-xs" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5">
                              <Input value={server.vmIp} onChange={(e) => updateServerInfo(env, server.id, "vmIp", e.target.value)} placeholder="VM IP" className="h-7 text-xs" />
                              <Input value={server.vmOs} onChange={(e) => updateServerInfo(env, server.id, "vmOs", e.target.value)} placeholder="OS" className="h-7 text-xs" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DB정보 */}
                <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xs flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      DB정보
                    </h5>
                    <Button variant="outline" size="sm" onClick={() => addDatabase(env)} className="h-6 text-xs px-2">
                      <Plus className="w-3 h-3 mr-1" />DB 추가
                    </Button>
                  </div>
                  
                  {envDetails[env].databases.length === 0 ? (
                    <div className="text-center py-3 text-muted-foreground text-xs">
                      등록된 DB가 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {envDetails[env].databases.map((db, index) => (
                        <div key={db.id} className="p-2 rounded-lg bg-background/50 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">#{index + 1}</span>
                              <Badge variant="outline" className="text-xs h-4">{db.dbType}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeDatabase(env, db.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            <Select value={db.dbType} onValueChange={(v: DBType) => updateDatabaseInfo(env, db.id, "dbType", v)}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="Postgres">Postgres</SelectItem>
                                <SelectItem value="MSSQL">MSSQL</SelectItem>
                                <SelectItem value="MySQL">MySQL</SelectItem>
                                <SelectItem value="Oracle">Oracle</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input value={db.dbIp} onChange={(e) => updateDatabaseInfo(env, db.id, "dbIp", e.target.value)} placeholder="Host/IP" className="h-7 text-xs" />
                            <Input value={db.dbPort} onChange={(e) => updateDatabaseInfo(env, db.id, "dbPort", e.target.value)} placeholder="Port" className="h-7 text-xs" />
                            <Input value={db.dbName} onChange={(e) => updateDatabaseInfo(env, db.id, "dbName", e.target.value)} placeholder="DB Name" className="h-7 text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CI/CD 연결정보 */}
                <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xs flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" />
                      CI/CD 연결정보
                    </h5>
                    <Button variant="outline" size="sm" onClick={() => addCICD(env)} className="h-6 text-xs px-2">
                      <Plus className="w-3 h-3 mr-1" />CI/CD 추가
                    </Button>
                  </div>
                  
                  {envDetails[env].cicds.length === 0 ? (
                    <div className="text-center py-3 text-muted-foreground text-xs">
                      등록된 CI/CD 정보가 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {envDetails[env].cicds.map((cicd, index) => (
                        <div key={cicd.id} className="p-2 rounded-lg bg-background/50 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">#{index + 1}</span>
                              <Badge variant="outline" className="text-xs h-4">{cicd.repoType}</Badge>
                              <Badge variant="outline" className="text-xs h-4">{cicd.pipelineType}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeCICD(env, cicd.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input value={cicd.repoUrl} onChange={(e) => updateCICDInfo(env, cicd.id, "repoUrl", e.target.value)} placeholder="Repo URL" className="h-7 text-xs" />
                            <Input value={cicd.repoBranch} onChange={(e) => updateCICDInfo(env, cicd.id, "repoBranch", e.target.value)} placeholder="Branch" className="h-7 text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input value={cicd.pipelineUrl} onChange={(e) => updateCICDInfo(env, cicd.id, "pipelineUrl", e.target.value)} placeholder="Pipeline URL" className="h-7 text-xs" />
                            <Input value={cicd.pipelineName} onChange={(e) => updateCICDInfo(env, cicd.id, "pipelineName", e.target.value)} placeholder="Pipeline Name" className="h-7 text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
