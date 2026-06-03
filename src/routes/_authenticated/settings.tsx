import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-4xl font-bold">Settings</h1>
      <div className="glass rounded-3xl p-6">
        <div className="text-sm text-muted-foreground">Signed in as</div>
        <div className="mt-1 text-lg font-medium">{user.email}</div>
      </div>
      <div className="glass rounded-3xl p-6">
        <div className="font-semibold">Account</div>
        <p className="mt-1 text-sm text-muted-foreground">Sign out of your VentureBots account on this device.</p>
        <Button
          variant="outline" className="mt-4"
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
        >Sign out</Button>
      </div>
    </div>
  );
}
