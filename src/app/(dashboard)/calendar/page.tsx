import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Financial Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Monthly timeline view of bills due, recurring income, and past transactions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calendar Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 7: Financial Calendar Ready</p>
            <p className="text-xs">Visual day-by-day cashflow timeline and bill milestones.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
