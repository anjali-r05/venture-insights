import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("startup_reports").select("health_score");
      const total = data?.length ?? 0;
      const avg = total ? Math.round(data!.reduce((s, r) => s + (r.health_score ?? 0), 0) / total) : 0;
      return { total, avg };
    },
  });

  const meta: any = user.user_metadata ?? {};
  const name = meta.full_name ?? meta.name ?? user.email?.split("@")[0];
  const avatar = meta.avatar_url ?? meta.picture;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-4xl font-bold">Profile</h1>

      <div className="glass flex flex-wrap items-center gap-6 rounded-3xl p-8">
        <Avatar className="h-20 w-20 ring-2 ring-primary/40">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-gradient-primary text-xl font-bold text-primary-foreground">
            {(name ?? "U").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-2xl font-bold">{name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Stat label="Analyses Completed" value={stats?.total ?? 0} />
        <Stat label="Average Startup Score" value={stats?.avg ?? 0} suffix="/100" />
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-4xl font-bold">{value}<span className="text-base text-muted-foreground">{suffix}</span></div>
    </div>
  );
}
