import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bill Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Track upcoming dues, payment statuses, and mark bills paid with linked transactions.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-4 h-4" />
          Add Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming &amp; Settled Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 6: Bills Tracking Ready</p>
            <p className="text-xs">Upcoming, paid, overdue workflows with reminder scheduling.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
