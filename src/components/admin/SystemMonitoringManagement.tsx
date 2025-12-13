import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from "lucide-react";

export function SystemMonitoringManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            시스템 모니터링 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>시스템 모니터링 설정 화면이 준비 중입니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
