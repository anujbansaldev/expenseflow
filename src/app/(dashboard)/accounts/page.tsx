import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts &amp; Wallets</h2>
          <p className="text-sm text-muted-foreground">
            Manage your bank accounts, cash reserves, credit cards, and investment balances.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configured Financial Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Phase 3: Accounts Module Ready</p>
            <p className="text-xs">Account definitions, initial balances, and archive workflows.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
