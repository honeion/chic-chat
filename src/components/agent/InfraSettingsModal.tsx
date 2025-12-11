import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  X, Server, Network, HardDrive, Cloud, Shield,
  Plus, Trash2, Save, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InfraSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemName: string;
  systemId: string;
}

interface InfraItem {
  id: string;
  name: string;
  type?: string;
  value?: string;
  ip?: string;
  port?: string;
  capacity?: string;
  enabled: boolean;
}

interface InfraCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  items: InfraItem[];
}

const initialCategories: InfraCategory[] = [
  {
    id: "server",
    name: "서버 구성",
    icon: <Server className="w-5 h-5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    items: [
      { id: "srv-1", name: "WEB 서버", type: "Linux", ip: "10.0.0.10", port: "80, 443", enabled: true },
      { id: "srv-2", name: "WAS 서버", type: "Linux", ip: "10.0.0.20", port: "8080", enabled: true },
      { id: "srv-3", name: "DB 서버", type: "Linux", ip: "10.0.0.30", port: "5432", enabled: true },
    ]
  },
  {
    id: "network",
    name: "네트워크 구성",
    icon: <Network className="w-5 h-5" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    items: [
      { id: "net-1", name: "내부 네트워크", type: "VLAN", value: "10.0.0.0/24", enabled: true },
      { id: "net-2", name: "DMZ 네트워크", type: "VLAN", value: "172.16.0.0/24", enabled: true },
      { id: "net-3", name: "VPN 연결", type: "Site-to-Site", value: "Active", enabled: true },
    ]
  },
  {
    id: "storage",
    name: "스토리지 구성",
    icon: <HardDrive className="w-5 h-5" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    items: [
      { id: "stg-1", name: "메인 스토리지", type: "SSD", capacity: "2TB", enabled: true },
      { id: "stg-2", name: "백업 스토리지", type: "HDD", capacity: "10TB", enabled: true },
      { id: "stg-3", name: "NAS", type: "NFS", capacity: "5TB", enabled: true },
    ]
  },
  {
    id: "cloud",
    name: "클라우드 설정",
    icon: <Cloud className="w-5 h-5" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    items: [
      { id: "cld-1", name: "AWS Region", type: "Region", value: "ap-northeast-2", enabled: true },
      { id: "cld-2", name: "Auto Scaling", type: "Policy", value: "min:2, max:10", enabled: true },
      { id: "cld-3", name: "Load Balancer", type: "ALB", value: "Active", enabled: true },
    ]
  },
  {
    id: "security",
    name: "보안 정책",
    icon: <Shield className="w-5 h-5" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    items: [
      { id: "sec-1", name: "방화벽 정책", type: "Inbound", value: "Restricted", enabled: true },
      { id: "sec-2", name: "SSL 인증서", type: "Let's Encrypt", value: "2025-06-15 만료", enabled: true },
      { id: "sec-3", name: "접근 제어", type: "IP Whitelist", value: "Enabled", enabled: true },
    ]
  },
];

export function InfraSettingsModal({ 
  isOpen, 
  onClose, 
  systemName,
  systemId 
}: InfraSettingsModalProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<InfraCategory[]>(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(initialCategories.map(c => c.id))
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
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
    const newItem: InfraItem = {
      id: `${categoryId}-${Date.now()}`,
      name: "새 구성 항목",
      enabled: true,
      type: "",
      value: "",
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
    console.log("Saving infra settings for", systemId, categories);
    alert(`${systemName} 인프라 설정이 저장되었습니다.`);
    onClose();
  };

  const getEnabledCount = (category: InfraCategory) => {
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
            <h2 className="text-lg font-semibold text-foreground">인프라 구성 설정</h2>
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
                {expandedCategories.has(category.id) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {/* Category Items */}
              {expandedCategories.has(category.id) && (
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
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">타입:</span>
                              <input
                                type="text"
                                value={item.type || ""}
                                onChange={(e) => updateItemField(category.id, item.id, "type", e.target.value)}
                                className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                placeholder="타입 입력"
                              />
                            </div>
                            {item.ip !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">IP:</span>
                                <input
                                  type="text"
                                  value={item.ip}
                                  onChange={(e) => updateItemField(category.id, item.id, "ip", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            {item.port !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">포트:</span>
                                <input
                                  type="text"
                                  value={item.port}
                                  onChange={(e) => updateItemField(category.id, item.id, "port", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            {item.value !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">값:</span>
                                <input
                                  type="text"
                                  value={item.value}
                                  onChange={(e) => updateItemField(category.id, item.id, "value", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            {item.capacity !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">용량:</span>
                                <input
                                  type="text"
                                  value={item.capacity}
                                  onChange={(e) => updateItemField(category.id, item.id, "capacity", e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-xs rounded border border-border/50 bg-background/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
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
