import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            View, filter, and manage all your income, expense and transfer records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Ledger Activity</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Ready for Transaction Engine (Phase 4)</p>
            <p className="text-xs">
              Phase 1 foundation layout active. Complete CRUD and atomic transfers will be hooked in Phase 4.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
