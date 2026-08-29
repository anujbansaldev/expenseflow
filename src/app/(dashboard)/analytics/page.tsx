import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics &amp; Trends</h2>
          <p className="text-sm text-muted-foreground">
            In-depth spending patterns, income vs expense breakdowns, and monthly trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" />
            Export Chart
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visual Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 5: Analytics &amp; Visualizations Ready</p>
            <p className="text-xs">Interactive Recharts area charts, category pie charts, and monthly comparison bars.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
