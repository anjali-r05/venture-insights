import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ACCEPTED_AUDIO_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
]);

export const Route = createFileRoute("/api/founder-transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const backendUrl = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

        if (!apiKey) return new Response("AI transcription is not configured", { status: 500 });
        if (!backendUrl || !publishableKey) return new Response("Backend auth is not configured", { status: 500 });

        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const authClient = createClient(backendUrl, publishableKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userError } = await authClient.auth.getUser(token);
        if (userError || !userData.user) return new Response("Unauthorized", { status: 401 });

        const formData = await request.formData().catch(() => null);
        const file = formData?.get("file");
        if (!(file instanceof File)) return new Response("Missing audio file", { status: 400 });
        if (file.size < 2048) return new Response("Recording was empty. Please try again.", { status: 400 });
        if (file.size > MAX_AUDIO_BYTES) return new Response("Recording is too large. Please keep answers shorter.", { status: 413 });

        const mimeType = file.type.split(";")[0].toLowerCase();
        if (!ACCEPTED_AUDIO_TYPES.has(mimeType)) {
          return new Response("Unsupported audio format. Please record again.", { status: 400 });
        }

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, file.name || "founder-answer.wav");
        upstream.append("stream", "true");

        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: upstream,
        });

        if (!response.ok) {
          const message = await response.text().catch(() => "Transcription failed");
          return new Response(message || "Transcription failed", { status: response.status });
        }

        return new Response(response.body, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});