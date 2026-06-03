import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) { toast.error(res.error.message); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-radial)" }} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass rounded-3xl p-8 shadow-card">
          <h1 className="text-2xl font-bold">Welcome to VentureBots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to run a Startup X-Ray on your idea.
          </p>

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={onGoogle}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.999 10.999 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            )}
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignInForm /></TabsContent>
            <TabsContent value="signup"><SignUpForm /></TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in");
    navigate({ to: "/dashboard" });
  };
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Password</Label><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
      <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign In
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Check your email to verify your account.");
    navigate({ to: "/dashboard" });
  };
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="space-y-1.5"><Label>Full name</Label><Input required value={fullName} onChange={e => setFullName(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Password</Label><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Confirm password</Label><Input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
      <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account
      </Button>
    </form>
  );
}
