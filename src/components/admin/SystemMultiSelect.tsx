import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SystemMultiSelectProps {
  systems: string[];
  selectedSystems: string[];
  onChange: (systems: string[]) => void;
  placeholder?: string;
}

export function SystemMultiSelect({
  systems,
  selectedSystems,
  onChange,
  placeholder = "시스템 선택",
}: SystemMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSystems = systems.filter((system) =>
    system.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSystem = (system: string) => {
    if (selectedSystems.includes(system)) {
      onChange(selectedSystems.filter((s) => s !== system));
    } else {
      onChange([...selectedSystems, system]);
    }
  };

  const removeSystem = (system: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedSystems.filter((s) => s !== system));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <div
        className={cn(
          "min-h-10 px-3 py-2 rounded-md border border-input bg-background cursor-pointer",
          "flex items-center justify-between gap-2",
          isOpen && "ring-2 ring-ring"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedSystems.length === 0 ? (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          ) : (
            selectedSystems.map((system) => (
              <Badge
                key={system}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {system}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => removeSystem(system, e)}
                />
              </Badge>
            ))
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-input bg-popover shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="시스템 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* System List */}
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {filteredSystems.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  검색 결과가 없습니다
                </div>
              ) : (
                filteredSystems.map((system) => {
                  const isSelected = selectedSystems.includes(system);
                  return (
                    <div
                      key={system}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent/50"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSystem(system);
                      }}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-input"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span>{system}</span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>{selectedSystems.length}개 선택됨</span>
            {selectedSystems.length > 0 && (
              <button
                className="text-destructive hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                전체 해제
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
