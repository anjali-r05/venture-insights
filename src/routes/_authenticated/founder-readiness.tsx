import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, Sparkles, Play, Volume2, VolumeX, Loader2,
  Brain, Trophy, TrendingUp, AlertTriangle, Lightbulb, Target, Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { founderInterviewTurn, founderFinalReport } from "@/lib/founder-interview.functions";

export const Route = createFileRoute("/_authenticated/founder-readiness")({
  component: FounderReadinessPage,
});

type Msg = { role: "assistant" | "user"; content: string };
type LiveScores = Record<string, number>;

const SCORE_LABELS: Array<{ key: string; label: string }> = [
  { key: "confidence", label: "Confidence" },
  { key: "communication", label: "Communication" },
  { key: "leadership", label: "Leadership" },
  { key: "clarity_of_thought", label: "Clarity of Thought" },
  { key: "conviction", label: "Conviction" },
  { key: "problem_understanding", label: "Problem" },
  { key: "product_understanding", label: "Product" },
  { key: "market_understanding", label: "Market" },
  { key: "business_understanding", label: "Business" },
  { key: "decision_making", label: "Decision Making" },
  { key: "overall_readiness", label: "Overall Readiness" },
];

function FounderReadinessPage() {
  const nextTurn = useServerFn(founderInterviewTurn);
  const finalize = useServerFn(founderFinalReport);

  // Pull latest startup context (optional)
  const { data: startupCtx } = useQuery({
    queryKey: ["latest-startup-ctx"],
    queryFn: async () => {
      const { data } = await supabase
        .from("startups")
        .select("startup_name, industry, description")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
  });

  const [phase, setPhase] = useState<"idle" | "interview" | "finalizing" | "report">("idle");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [scores, setScores] = useState<LiveScores>({});
  const [input, setInput] = useState("");
  const [muted, setMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [turnCount, setTurnCount] = useState(0);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mutedRef = useRef(muted);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const speak = useCallback((text: string) => {
    if (mutedRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02; u.pitch = 1.0; u.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => /google.*(uk|us).*english/i.test(v.name))
        ?? voices.find(v => /en-(US|GB)/i.test(v.lang) && /female|samantha|jenny|zira/i.test(v.name))
        ?? voices.find(v => /en-(US|GB)/i.test(v.lang));
      if (preferred) u.voice = preferred;
      u.onstart = () => setAiSpeaking(true);
      u.onend = () => setAiSpeaking(false);
      u.onerror = () => setAiSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch { /* noop */ }
  }, []);

  const askNext = useCallback(async (history: Msg[], turn: number) => {
    setThinking(true);
    try {
      const res = await nextTurn({ data: {
        messages: history,
        startup: startupCtx ? {
          startup_name: startupCtx.startup_name ?? undefined,
          industry: startupCtx.industry ?? undefined,
          description: startupCtx.description ?? undefined,
        } : undefined,
        turnCount: turn,
      }});
      const q = res.question?.trim();
      if (!q) throw new Error("No question generated");
      setScores(res.scores ?? {});
      setMessages(prev => [...prev, { role: "assistant", content: q }]);
      speak(q);
      if (res.should_end || turn >= 12) {
        setTimeout(() => finish([...history, { role: "assistant", content: q }]), 800);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "AI interviewer failed");
    } finally {
      setThinking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextTurn, startupCtx, speak]);

  const finish = useCallback(async (history: Msg[]) => {
    setPhase("finalizing");
    try {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      const r = await finalize({ data: {
        messages: history,
        startup: startupCtx ? {
          startup_name: startupCtx.startup_name ?? undefined,
          industry: startupCtx.industry ?? undefined,
          description: startupCtx.description ?? undefined,
        } : undefined,
      }});
      setReport(r);
      setPhase("report");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate report");
      setPhase("interview");
    }
  }, [finalize, startupCtx]);

  const start = async () => {
    setMessages([]);
    setScores({});
    setReport(null);
    setTurnCount(0);
    setPhase("interview");
    // Prime voices for TTS
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.getVoices();
    await askNext([], 0);
  };

  const submitAnswer = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    setInput("");
    const newHistory: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(newHistory);
    const nextTurnCount = turnCount + 1;
    setTurnCount(nextTurnCount);
    await askNext(newHistory, nextTurnCount);
  }, [messages, thinking, turnCount, askNext]);

  // Voice input using Web Speech API
  const finalTranscriptRef = useRef("");
  const manualStopRef = useRef(false);

  const toggleMic = useCallback(async () => {
    if (typeof window === "undefined") return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input isn't supported in this browser. Try Chrome, Edge, or Safari — or type your answer.");
      return;
    }

    // Stop mode: user clicked mic while listening → stop and submit whatever we have
    if (listening && recognitionRef.current) {
      manualStopRef.current = true;
      try { recognitionRef.current.stop(); } catch { /* noop */ }
      return;
    }

    // Cancel any AI speech so the mic doesn't pick it up
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    setAiSpeaking(false);

    // Proactively request mic permission so we get a real error instead of a silent no-op
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch (err: any) {
      const name = err?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        toast.error("Microphone blocked. Allow mic access in your browser settings and try again.");
      } else if (name === "NotFoundError") {
        toast.error("No microphone detected on this device.");
      } else {
        toast.error("Couldn't access the microphone. Please type your answer.");
      }
      return;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true; // keep listening until user taps mic again
    finalTranscriptRef.current = "";
    manualStopRef.current = false;

    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscriptRef.current += t + " ";
        else interim += t;
      }
      setInput((finalTranscriptRef.current + interim).trim());
    };
    rec.onerror = (e: any) => {
      const err = e?.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast.error("Microphone permission was denied.");
      } else if (err === "no-speech") {
        toast.message("I didn't hear anything — tap the mic and try again.");
      } else if (err && err !== "aborted") {
        toast.error(`Voice input error: ${err}`);
      }
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      const text = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = "";
      // Only auto-submit when the user manually stopped (tapped mic) AND we captured text
      if (manualStopRef.current && text) {
        setInput("");
        submitAnswer(text);
      }
      manualStopRef.current = false;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      toast.error("Couldn't start voice input. Please try again.");
      setListening(false);
    }
  }, [listening, submitAnswer]);

  // Cleanup on unmount
  useEffect(() => () => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
  }, []);

  const progressPct = Math.min(100, Math.round((turnCount / 12) * 100));

  return (
    <div className="mx-auto max-w-7xl space-y-8 fade-up">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="chip text-primary border-primary/40"><Brain className="h-3.5 w-3.5" /> Founder Readiness Assessment™</div>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">Step into the interview room.</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            An AI investor will interview you live. Answer by voice or text. We evaluate your confidence, conviction, and command of your business — in real time.
          </p>
        </div>
        {phase === "interview" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setMuted(m => !m)} className="gap-2">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} {muted ? "Unmute AI" : "Mute AI"}
            </Button>
            <Button variant="destructive" onClick={() => finish(messages)} disabled={phase === "finalizing" || messages.filter(m => m.role === "user").length < 1}>
              End Interview
            </Button>
          </div>
        )}
      </header>

      {phase === "idle" && <IdleHero onStart={start} startupName={startupCtx?.startup_name} />}

      {(phase === "interview" || phase === "finalizing") && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="glass-strong rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AiAvatar speaking={aiSpeaking || thinking} />
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">AI Investor · Live</div>
                    <div className="text-lg font-bold">{aiSpeaking ? "Speaking…" : thinking ? "Thinking…" : "Listening"}</div>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Progress</div>
                  <div className="text-2xl font-extrabold tabular-nums">{turnCount}/12</div>
                </div>
              </div>
              <Progress value={progressPct} className="mt-4 h-1.5" />
            </div>

            <div ref={transcriptRef} className="glass-strong h-[52vh] overflow-y-auto rounded-3xl p-6 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary/15 border border-primary/30 text-foreground"
                        : "border border-accent/30 bg-card/70 text-foreground"
                    }`}>
                      <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] opacity-70">
                        {m.role === "user" ? "You" : "AI Investor"}
                      </div>
                      <div className="text-[15px]">{m.content}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-accent/30 bg-card/70 px-5 py-3">
                    <div className="flex items-center gap-2 text-accent">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-mono text-xs uppercase tracking-widest">Formulating next question…</span>
                    </div>
                  </div>
                </div>
              )}
              {phase === "finalizing" && (
                <div className="py-6 text-center font-mono text-sm uppercase tracking-[0.25em] text-accent">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                  Synthesizing your Founder Readiness Report…
                </div>
              )}
            </div>

            {phase === "interview" && (
              <form
                onSubmit={(e) => { e.preventDefault(); submitAnswer(input); }}
                className="glass-strong flex items-center gap-2 rounded-2xl p-3"
              >
                <Button type="button" variant={listening ? "destructive" : "outline"} size="icon"
                  onClick={toggleMic} className="h-12 w-12 rounded-full" disabled={thinking}>
                  {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? "Listening… speak now" : "Type your answer or press the mic to speak"}
                  className="h-12 flex-1 border-primary/20 bg-background/40 text-base"
                  disabled={thinking}
                />
                <Button type="submit" className="btn-neon h-12 gap-2 px-5" disabled={!input.trim() || thinking}>
                  <Send className="h-4 w-4" /> Send
                </Button>
              </form>
            )}
          </div>

          <LiveScorePanel scores={scores} />
        </div>
      )}

      {phase === "report" && report && (
        <ReportCard report={report} onRestart={start} />
      )}
    </div>
  );
}

function IdleHero({ onStart, startupName }: { onStart: () => void; startupName?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-background via-background to-primary/10 p-10 md:p-14">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <div className="chip text-accent border-accent/40"><Sparkles className="h-3.5 w-3.5" /> Live AI Interview</div>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            {startupName ? <>Pitch <span className="text-primary">{startupName}</span> to an AI investor.</> : "Sit across from an AI investor."}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            10–12 investor-grade questions. Voice or text. Real-time scoring on confidence, conviction, and command of your business. Ends with a full Founder Readiness Report.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Voice Interview", "Adaptive Follow-ups", "Live Scoring", "Investor Report"].map(t => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
          <Button onClick={onStart} className="btn-neon mt-8 h-14 px-8 text-base font-semibold">
            <Play className="h-5 w-5" /> Start Founder Assessment
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">Grant microphone access when prompted for voice mode. Text works too.</p>
        </div>
        <div className="hidden md:flex justify-center">
          <AiAvatar speaking size="lg" />
        </div>
      </div>
    </div>
  );
}

function AiAvatar({ speaking, size = "md" }: { speaking?: boolean; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-56 w-56" : "h-16 w-16";
  return (
    <div className={`relative ${dim} shrink-0`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-80 ${speaking ? "animate-pulse" : ""}`} />
      {speaking && (
        <>
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          <div className="absolute -inset-2 rounded-full border border-primary/50" />
          <div className="absolute -inset-5 rounded-full border border-accent/30" />
        </>
      )}
      <div className="absolute inset-2 flex items-center justify-center rounded-full bg-background/80 backdrop-blur">
        <Brain className={`text-primary ${size === "lg" ? "h-20 w-20" : "h-7 w-7"}`} />
      </div>
    </div>
  );
}

function LiveScorePanel({ scores }: { scores: LiveScores }) {
  const has = Object.keys(scores).length > 0;
  return (
    <aside className="glass-strong sticky top-6 h-fit rounded-3xl p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Live Founder Signals</div>
      <div className="mt-1 text-xl font-bold">Real-time Assessment</div>
      <div className="mt-5 space-y-3">
        {SCORE_LABELS.map(({ key, label }) => {
          const v = scores[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono tabular-nums font-semibold">{has && typeof v === "number" ? v : "—"}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${has && typeof v === "number" ? Math.max(0, Math.min(100, v)) : 0}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {!has && (
        <p className="mt-5 text-xs text-muted-foreground">Scores appear after your first answer.</p>
      )}
    </aside>
  );
}

function ReportCard({ report, onRestart }: { report: any; onRestart: () => void }) {
  const verdictTone =
    report.verdict === "Ready" ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
    : report.verdict === "Almost Ready" ? "text-amber-300 border-amber-300/40 bg-amber-300/10"
    : "text-rose-400 border-rose-400/40 bg-rose-400/10";

  const scoreEntries = Object.entries(report.scores ?? {});

  return (
    <div className="space-y-6 fade-up">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="chip text-accent border-accent/40"><Trophy className="h-3.5 w-3.5" /> Founder Readiness Report</div>
            <div className="mt-4 flex items-baseline gap-4">
              <div className="text-7xl font-extrabold tabular-nums">{Math.round(report.overall_score ?? 0)}</div>
              <div className="text-xl text-muted-foreground">/ 100</div>
            </div>
            <Badge className={`mt-3 border ${verdictTone} px-4 py-1 text-sm font-bold`}>{report.verdict}</Badge>
            <p className="mt-4 max-w-2xl text-muted-foreground">{report.verdict_reasoning}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={onRestart} className="btn-neon h-12 px-6">Retake Interview</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {scoreEntries.map(([k, v]: any) => (
          <div key={k} className="glass-strong rounded-2xl p-5">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{k.replace(/_/g, " ")}</div>
            <div className="mt-2 text-3xl font-extrabold tabular-nums">{Math.round(v)}</div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/40">
              <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(100, Math.max(0, v))}%` }} />
            </div>
          </div>
        ))}
      </div>

      {report.signature_quote && (
        <div className="glass-strong rounded-3xl p-8">
          <Quote className="h-6 w-6 text-accent" />
          <p className="mt-3 text-2xl font-semibold leading-snug">"{report.signature_quote}"</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionList title="Strengths" icon={<TrendingUp className="h-4 w-4" />} tone="emerald"
          items={report.strengths} render={(s: any) => (
            <>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
              {s.evidence && <p className="mt-2 text-xs italic text-accent">"{s.evidence}"</p>}
            </>
          )} />
        <SectionList title="Weaknesses" icon={<AlertTriangle className="h-4 w-4" />} tone="rose"
          items={report.weaknesses} render={(s: any) => (
            <>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
              {s.evidence && <p className="mt-2 text-xs italic text-rose-300">"{s.evidence}"</p>}
            </>
          )} />
        <SectionList title="Areas to Improve" icon={<Target className="h-4 w-4" />} tone="amber"
          items={report.areas_to_improve} render={(s: any) => (
            <>
              <div className="font-semibold">{s.area}</div>
              <p className="mt-1 text-sm text-muted-foreground"><span className="text-foreground/80">Why:</span> {s.why}</p>
              <p className="mt-1 text-sm text-muted-foreground"><span className="text-foreground/80">How:</span> {s.how}</p>
            </>
          )} />
        <SectionList title="Personalized Recommendations" icon={<Lightbulb className="h-4 w-4" />} tone="primary"
          items={report.recommendations} render={(s: any) => (
            <>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.action}</p>
              {s.expected_outcome && <p className="mt-2 text-xs text-primary">Expected: {s.expected_outcome}</p>}
            </>
          )} />
      </div>
    </div>
  );
}

function SectionList({ title, icon, items, render, tone }: {
  title: string; icon: React.ReactNode; items: any[]; render: (i: any) => React.ReactNode;
  tone: "emerald" | "rose" | "amber" | "primary";
}) {
  const toneMap: Record<string, string> = {
    emerald: "border-emerald-400/30 text-emerald-300",
    rose: "border-rose-400/30 text-rose-300",
    amber: "border-amber-300/30 text-amber-200",
    primary: "border-primary/40 text-primary",
  };
  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className={`chip ${toneMap[tone]}`}>{icon} {title}</div>
      <div className="mt-4 space-y-3">
        {(items ?? []).map((it: any, i: number) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-4">
            {render(it)}
          </div>
        ))}
        {(!items || items.length === 0) && <p className="text-sm text-muted-foreground">No data.</p>}
      </div>
    </div>
  );
}
