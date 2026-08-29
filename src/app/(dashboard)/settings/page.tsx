import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings &amp; Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile, currency, timezone, security preferences and audit log.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Localization &amp; Currency</CardTitle>
            <CardDescription>Configure your primary reporting currency and date formats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Base Currency</label>
              <Input defaultValue="INR (₹)" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
              <Input defaultValue="Asia/Kolkata" disabled />
            </div>
            <Button size="sm">Save Preferences</Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>Audit export and account data deletion options.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Delete Account &amp; Ledger Data</p>
              <p className="text-xs text-muted-foreground">Permanently wipes all financial history.</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
