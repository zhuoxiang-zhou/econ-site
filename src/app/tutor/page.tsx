// src/app/tutor/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";

type Msg = { role: "user" | "assistant"; content: string };
type ModelOpt = { id: string; label: string };

export default function Tutor() {
  // 1) Read whatever models your installed web-llm exposes
  const discovered: ModelOpt[] = useMemo(() => {
    const list = webllm.prebuiltAppConfig?.model_list ?? [];
    // keep it simple: show them all (you can filter later)
    return list.map((m) => ({ id: m.model_id, label: m.model_id }));
  }, []);

  const [modelId, setModelId] = useState<string>(() => discovered[0]?.id ?? "");
  const [engine, setEngine] = useState<webllm.MLCEngine | null>(null);
  const [ready, setReady] = useState(false);

  // progress UI
  const [progressText, setProgressText] = useState<string>("Initializing…");
  const [pct, setPct] = useState<number>(0);

  // chat UI
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  // 2) Boot engine once, load initial model directly from the discovered ids
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!discovered.length) {
          setProgressText("No models found in WebLLM’s registry.");
          return;
        }
        const initial = modelId || discovered[0].id;

        setReady(false);
        setPct(0);
        setProgressText("Initializing…");

        const eng = await webllm.CreateMLCEngine({
          // IMPORTANT: pass a STRING id; don't pass objects here
          model: initial,
          initProgressCallback: (p) => {
            if (cancelled) return;
            setProgressText(p.text);
            const v =
              typeof (p as any).progress === "number"
                ? (p as any).progress
                : (() => {
                    const m = p.text.match(/(\d{1,3})\s*%/);
                    return m ? Math.min(1, Math.max(0, Number(m[1]) / 100)) : NaN;
                  })();
            if (!Number.isNaN(v)) setPct(v);
          },
        });

        if (cancelled) return;
        setEngine(eng);
        setModelId(initial);
        setProgressText("Ready");
        setPct(1);
        setReady(true);

        // See what ids your build actually has
        console.log(
          "[WebLLM] Available models:",
          (webllm.prebuiltAppConfig?.model_list ?? []).map((m) => m.model_id)
        );
      } catch (e: any) {
        if (!cancelled) {
          setProgressText(`Error: ${e?.message || String(e)}`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discovered]);

  // 3) Switching models after engine exists
  useEffect(() => {
    (async () => {
      if (!engine || !modelId) return;
      setReady(false);
      setPct(0);
      setProgressText("Preparing selected model…");
      await engine.reload(modelId); // again, pass a STRING id
      setProgressText("Ready");
      setPct(1);
      setReady(true);
    })();
  }, [engine, modelId]);

  async function ask() {
    if (!engine || !ready) return;
    const q = input.trim();
    if (!q) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);

    const system =
      "You are an undergraduate econometrics TA. Scope: OLS, multiple regression, IV, RD, DiD, panels. Be concise and intuition-first. Prefer hints before solutions; keep code minimal and correct.";

    let acc = "";
    await engine.chat.completions.create(
      {
        model: modelId, // same string id
        temperature: 0.2,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...messages,
          { role: "user", content: q },
        ],
      },
      (chunk) => {
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (!delta) return;
        acc += delta;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-3">AI Tutor (Free, Runs in Browser)</h1>

      {/* Model selector + progress */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3 text-sm">
          <label className="shrink-0">Model:</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="border rounded-md px-2 py-1"
            disabled={!discovered.length}
          >
            {discovered.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="text-neutral-500">{progressText}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-500">Loading status</span>
            <span className="tabular-nums text-neutral-600">{Math.round(pct * 100)}%</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct * 100)}
            aria-label="Model loading progress"
            title={progressText}
          >
            <div
              className="h-full bg-black transition-[width] duration-200"
              style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="border rounded-2xl p-4 h-[60vh] overflow-y-auto mb-4 bg-white">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500">
            Try: “Explain heteroskedasticity in plain language” or “Why cluster at class level?”
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block px-3 py-2 rounded-xl ${
                m.role === "user" ? "bg-blue-100" : "bg-neutral-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={ready ? "Ask a question…" : "Loading model…"}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          disabled={!ready}
        />
        <button
          onClick={ask}
          className="px-4 py-2 rounded-xl border hover:shadow disabled:opacity-50"
          disabled={!ready}
        >
          Ask
        </button>
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        100% in-browser via WebGPU. First load downloads the model; later loads are cached.
      </p>
    </main>
  );
}