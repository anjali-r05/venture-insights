import jsPDF from "jspdf";
import type { ProductStrategyPayload } from "@/lib/product-strategy.functions";

export function exportProductStrategyPDF(productName: string, s: ProductStrategyPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (need: number) => {
    if (y + need > pageH - margin) { doc.addPage(); y = margin; }
  };

  const h1 = (t: string) => {
    ensure(40);
    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(20, 20, 30);
    doc.text(t, margin, y);
    y += 8;
    doc.setDrawColor(120, 100, 255).setLineWidth(1.4);
    doc.line(margin, y, margin + 64, y);
    y += 18;
  };
  const h2 = (t: string) => {
    ensure(28);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(50, 40, 90);
    doc.text(t, margin, y); y += 16;
  };
  const p = (t: string, opts?: { color?: [number, number, number]; size?: number }) => {
    if (!t) return;
    doc.setFont("helvetica", "normal")
      .setFontSize(opts?.size ?? 10.5)
      .setTextColor(...(opts?.color ?? [40, 40, 50]));
    const lines = doc.splitTextToSize(t, maxW);
    for (const line of lines) { ensure(14); doc.text(line, margin, y); y += 14; }
    y += 4;
  };
  const kv = (k: string, v: string) => {
    if (!v) return;
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(80, 70, 120);
    ensure(14); doc.text(`${k}: `, margin, y);
    const kw = doc.getTextWidth(`${k}: `);
    doc.setFont("helvetica", "normal").setTextColor(40, 40, 50);
    const lines = doc.splitTextToSize(v, maxW - kw);
    doc.text(lines[0] ?? "", margin + kw, y); y += 14;
    for (let i = 1; i < lines.length; i++) { ensure(14); doc.text(lines[i], margin, y); y += 14; }
    y += 2;
  };
  const bullet = (t: string) => {
    if (!t) return;
    doc.setFont("helvetica", "normal").setFontSize(10.5).setTextColor(40, 40, 50);
    const lines = doc.splitTextToSize(t, maxW - 14);
    ensure(14);
    doc.text("•", margin, y);
    doc.text(lines[0] ?? "", margin + 12, y); y += 14;
    for (let i = 1; i < lines.length; i++) { ensure(14); doc.text(lines[i], margin + 12, y); y += 14; }
  };
  const spacer = (n = 8) => { y += n; };

  // Cover
  doc.setFillColor(15, 12, 35); doc.rect(0, 0, pageW, 180, "F");
  doc.setTextColor(180, 170, 255).setFont("helvetica", "bold").setFontSize(11);
  doc.text("VENTUREBOTS · AI PRODUCT STRATEGY", margin, 62);
  doc.setTextColor(255, 255, 255).setFontSize(28);
  doc.text(doc.splitTextToSize(productName, maxW), margin, 100);
  doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(200, 195, 230);
  doc.text(new Date().toLocaleDateString(undefined, { dateStyle: "long" }), margin, 160);
  y = 220;

  h1("Executive Summary");
  p(s.executive_summary);
  spacer();

  h1("Product Blueprint");
  h2("Vision"); p(s.blueprint.product_vision);
  h2("Core problem"); p(s.blueprint.core_problem);
  h2("Target user segments");
  s.blueprint.target_users.forEach(t => {
    kv(t.segment, `${t.who_they_are} — Core need: ${t.core_need}`);
  });
  h2("Personas");
  s.blueprint.personas.forEach(pr => {
    kv(pr.name, `${pr.role}. ${pr.context}`);
    kv("Goal", pr.primary_goal);
    kv("Frustration", pr.biggest_frustration);
    p(`"${pr.quote}"`, { color: [110, 100, 160] });
  });
  h2("User journey");
  s.blueprint.user_journey.forEach((j, i) =>
    kv(`${i + 1}. ${j.stage} (${j.emotion})`, `${j.user_action} → ${j.product_response}`)
  );
  h2("Product goals");
  s.blueprint.product_goals.forEach(g => kv(g.goal, `${g.why_it_matters} · Metric: ${g.success_metric}`));

  h1("MVP Plan");
  h2("Hypothesis"); p(s.mvp.hypothesis);
  h2("Core value loop"); p(s.mvp.core_value_loop);
  h2("Must have");
  s.mvp.must_have.forEach(f => kv(f.feature, `${f.why_in_mvp} · Risk if missing: ${f.risk_if_missing}`));
  h2("Nice to have");
  s.mvp.nice_to_have.forEach(f => kv(f.feature, `${f.why_deferred} · Build when: ${f.trigger_to_build}`));
  h2("Future features");
  s.mvp.future_features.forEach(f => kv(f.feature, `${f.why_later} · Unlocks: ${f.unlocks}`));

  h1("Feature Priorities");
  s.feature_priorities.forEach(f =>
    kv(f.name, `[${f.priority} · ${f.complexity} complexity · ${f.business_impact} impact] ${f.purpose} — ${f.reason}`)
  );

  h1("Product Roadmap");
  s.roadmap.forEach(ph => {
    h2(`Phase ${ph.phase} · ${ph.name} · ${ph.timeline}`);
    p(ph.objective);
    ph.features.forEach(bullet);
    kv("Success criteria", ph.success_criteria);
  });

  h1("Build Now vs Skip For Now");
  h2("Build now");
  s.build_vs_skip.build_now.forEach(b => kv(b.feature, `${b.why} · Outcome: ${b.expected_outcome}`));
  h2("Skip for now");
  s.build_vs_skip.skip_for_now.forEach(b => kv(b.feature, `${b.why_skip} · Revisit when: ${b.when_to_revisit}`));

  h1("Technical Suggestions");
  h2("Tech stack");
  s.technical_suggestions.tech_stack.forEach(t =>
    kv(t.layer, `${t.recommendation} — ${t.reason} · Alternative: ${t.alternative}`)
  );
  h2("Architecture");
  kv(s.technical_suggestions.architecture.pattern, s.technical_suggestions.architecture.reason);
  p(s.technical_suggestions.architecture.diagram_notes);
  h2("Database");
  kv(s.technical_suggestions.database.type, s.technical_suggestions.database.reason);
  s.technical_suggestions.database.key_tables.forEach(bullet);
  h2("APIs");
  s.technical_suggestions.apis.forEach(a => kv(a.name, `[${a.priority}] ${a.purpose}`));
  h2("AI models");
  s.technical_suggestions.ai_models.forEach(m => kv(m.use_case, `${m.model_recommendation} — ${m.reason}`));

  h1("AI Product Suggestions");
  s.ai_suggestions.forEach(sg => kv(`[${sg.type}] ${sg.title}`, `${sg.detail} · Impact: ${sg.expected_impact}`));

  h1("Product Risks");
  s.risks.forEach(r => {
    kv(`${r.risk} (${r.severity})`, r.why_it_applies);
    kv("Consequence", r.consequence);
    kv("How to avoid", r.how_to_avoid);
  });

  // Footer page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(140, 140, 160);
    doc.text(`VentureBots · Product Strategy · ${productName}`, margin, pageH - 22);
    doc.text(`${i} / ${total}`, pageW - margin, pageH - 22, { align: "right" });
  }

  const safe = productName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "product-strategy";
  doc.save(`${safe}-product-strategy.pdf`);
}
