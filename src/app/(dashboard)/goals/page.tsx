import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Savings Goals</h2>
          <p className="text-sm text-muted-foreground">
            Set target savings milestones, log contributions, and monitor progress over time.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 7: Savings Goals Ready</p>
            <p className="text-xs">Target dates, contribution records, and projection calculations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
