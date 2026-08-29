import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recurring Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Automate subscriptions, salaries, rent, and scheduled recurring ledger entries.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-4 h-4" />
          Add Recurring Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 6: Recurring Engine Ready</p>
            <p className="text-xs">Idempotent occurrence generator and schedule execution.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
