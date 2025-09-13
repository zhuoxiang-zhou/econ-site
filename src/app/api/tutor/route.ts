import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  // Placeholder response. Later, swap with a call to your LLM using process.env.OPENAI_API_KEY.
  const canned = (q: string) => {
    if (/hetero|robust/i.test(q)) {
      return "Heteroskedasticity means variance of errors differs across observations. Use robust (Huber–White) SEs; coefficients stay the same, uncertainty changes.";
    }
    if (/cluster/i.test(q)) {
      return "Cluster SEs when errors may correlate within groups (e.g., students within classes). Choose the cluster at the level of treatment or shock.";
    }
    if (/ols/i.test(q)) {
      return "OLS finds the line minimizing squared residuals. Check linearity, no omitted confounders, and use robust/clustered SEs when appropriate.";
    }
    return "I’m your econometrics tutor. Ask about OLS/IV/RD/DiD/panels, or paste a short regression output for interpretation.";
  };

  return NextResponse.json({ answer: canned(question || "") });
}
