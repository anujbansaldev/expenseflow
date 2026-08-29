import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Reports &amp; Exports</h2>
          <p className="text-sm text-muted-foreground">
            Generate printable summaries, audit-ready CSV, and JSON ledger exports.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 font-semibold">
          <FileDown className="w-4 h-4" />
          Generate Statement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ledger Statement Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 7: Reports Engine Ready</p>
            <p className="text-xs">Date-filtered statements, category matrices, and CSV exports.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
