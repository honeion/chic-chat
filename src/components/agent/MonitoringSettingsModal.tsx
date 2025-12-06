import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  X, Globe, Database, RefreshCw, Clock, FileText, Activity,
  Plus, Trash2, Save, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MonitoringSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemName: string;
  systemId: string;
}

// 모니터링 항목 타입
interface MonitoringItem {
  id: string;
  name: string;
  url?: string;
  endpoint?: string;
  query?: string;
  schedule?: string;
  threshold?: string;
  enabled: boolean;
}

interface MonitoringCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  items: MonitoringItem[];
}

const initialCategories: MonitoringCategory[] = [
  {
    id: "http-api",
    name: "HTTP API Check",
    icon: <Globe className="w-5 h-5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    items: [
      { id: "api-1", name: "메인 API 헬스체크", url: "https://api.example.com/health", threshold: "3초", enabled: true },
      { id: "api-2", name: "인증 API", url: "https://api.example.com/auth/status", threshold: "2초", enabled: true },
    ]
  },
  {
    id: "db",
    name: "DB 모니터링",
    icon: <Database className="w-5 h-5" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    items: [
      { id: "db-1", name: "메인 DB 연결", endpoint: "main-db:5432", query: "SELECT 1", threshold: "1초", enabled: true },
      { id: "db-2", name: "리플리카 DB", endpoint: "replica-db:5432", query: "SELECT 1", threshold: "2초", enabled: true },
    ]
  },
  {
    id: "interface",
    name: "IF 모니터링",
    icon: <RefreshCw className="w-5 h-5" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    items: [
      { id: "if-1", name: "ERP 연동", endpoint: "erp.internal:8080", threshold: "5초", enabled: true },
      { id: "if-2", name: "외부 결제 연동", endpoint: "payment.external:443", threshold: "3초", enabled: false },
    ]
  },
  {
    id: "batch",
    name: "BATCH 모니터링",
    icon: <Clock className="w-5 h-5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    items: [
      { id: "batch-1", name: "일일 정산 배치", schedule: "매일 00:00", threshold: "30분", enabled: true },
      { id: "batch-2", name: "데이터 동기화", schedule: "매시 정각", threshold: "10분", enabled: true },
    ]
  },
  {
    id: "log",
    name: "LOG 모니터링",
    icon: <FileText className="w-5 h-5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    items: [
      { id: "log-1", name: "에러 로그 감시", endpoint: "/var/log/app/error.log", threshold: "10건/시간", enabled: true },
      { id: "log-2", name: "액세스 로그", endpoint: "/var/log/app/access.log", threshold: "1000건/분", enabled: true },
    ]
  },
  {
    id: "performance",
    name: "성능 모니터링",
    icon: <Activity className="w-5 h-5" />,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    items: [
      { id: "perf-1", name: "CPU 사용률", threshold: "80%", enabled: true },
      { id: "perf-2", name: "메모리 사용률", threshold: "85%", enabled: true },
      { id: "perf-3", name: "디스크 I/O", threshold: "90%", enabled: true },
    ]
  },
];

export function MonitoringSettingsModal({ 
  isOpen, 
  onClose, 
  systemName,
  systemId 
}: MonitoringSettingsModalProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<MonitoringCategory[]>(initialCategories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("http-api");
  const [editingItem, setEditingItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleItemEnabled = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
          )
        };
      }
      return cat;
    }));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      }
      return cat;
    }));
  };

  const addItem = (categoryId: string) => {
    const newItem: MonitoringItem = {
      id: `${categoryId}-${Date.now()}`,
      name: "새 모니터링 항목",
      enabled: true,
      threshold: "",
    };
    
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...cat.items, newItem]
        };
      }
      return cat;
    }));
    setEditingItem(newItem.id);
  };

  const updateItemField = (categoryId: string, itemId: string, field: string, value: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return cat;
    }));
  };

  const handleSave = () => {
    // 실제 저장 로직 (현재는 시뮬레이션)
    console.log("Saving monitoring settings for", systemId, categories);
    alert(`${systemName} 모니터링 설정이 저장되었습니다.`);
    onClose();
  };

  const getEnabledCount = (category: MonitoringCategory) => {
    return category.items.filter(item => item.enabled).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-lg font-semibold text-foreground">모니터링 설정</h2>
            <p className="text-sm text-muted-foreground">{systemName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {categories.map(category => (
            <div 
              key={category.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "w-full px-4 py-3 flex items-center justify-between transition-colors",
                  category.bgColor
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={category.color}>{category.icon}</span>
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-background/50 text-xs font-medium text-muted-foreground">
                    {getEnabledCount(category)}/{category.items.length} 활성
                  </span>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {/* Category Items */}
              {expandedCategory === category.id && (
                <div className="bg-background/50 divide-y divide-border/50">
                  {category.items.map(item => (
                    <div 
                      key={item.id}
                      className={cn(
                        "px-4 py-3",
                        !item.enabled && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItemField(category.id, item.id, "name", e.target.value)}
                              onBlur={() => setEditingItem(null)}
                              autoFocus
                              className="w-full px-2 py-1 text-sm font-medium rounded border border-primary bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          ) : (
                            <p 
                              className="text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                              onClick={() => setEditingItem(item.id)}
                            >
                              {item.name}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2">
                            {item.url && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">URL:</span>
                                <input
                                  type="text"
                                  value={item.url}
                                  onChange={(e) => updateItemField(category.id, item.id, "url", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            {item.endpoint && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Endpoint:</span>
                                <input
                                  type="text"
                                  value={item.endpoint}
                                  onChange={(e) => updateItemField(category.id, item.id, "endpoint", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            {item.query && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Query:</span>
                                <input
                                  type="text"
                                  value={item.query}
                                  onChange={(e) => updateItemField(category.id, item.id, "query", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            {item.schedule && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">스케줄:</span>
                                <input
                                  type="text"
                                  value={item.schedule}
                                  onChange={(e) => updateItemField(category.id, item.id, "schedule", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">임계치:</span>
                              <input
                                type="text"
                                value={item.threshold || ""}
                                onChange={(e) => updateItemField(category.id, item.id, "threshold", e.target.value)}
                                className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                placeholder="예: 3초, 80%"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Toggle Switch */}
                          <button
                            onClick={() => toggleItemEnabled(category.id, item.id)}
                            className={cn(
                              "relative w-10 h-5 rounded-full transition-colors",
                              item.enabled ? "bg-status-online" : "bg-muted"
                            )}
                          >
                            <div 
                              className={cn(
                                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow",
                                item.enabled ? "left-5" : "left-0.5"
                              )}
                            />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => deleteItem(category.id, item.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Item Button */}
                  <button
                    onClick={() => addItem(category.id)}
                    className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    항목 추가
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors text-sm"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}