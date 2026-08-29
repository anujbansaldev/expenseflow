import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
          <p className="text-sm text-muted-foreground">
            Plan spending limits by category or overall envelope with threshold alerts.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-4 h-4" />
          Create Budget
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Budget Envelopes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 6: Budgets Module Ready</p>
            <p className="text-xs">Category allocation, percentage progress, and over-budget warnings.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
