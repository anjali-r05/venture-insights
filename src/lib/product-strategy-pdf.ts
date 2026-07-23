import jsPDF from "jspdf";
import type { ProductStrategyPayload } from "@/lib/product-strategy.functions";

export function exportProductStrategyPDF(productName: string, s: ProductStrategyPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (need: number) => { if (y + need > pageH - margin) { doc.addPage(); y = margin; } };
  const h1 = (t: string) => {
    ensure(40);
    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(20, 20, 30);
    doc.text(t, margin, y); y += 8;
    doc.setDrawColor(120, 100, 255).setLineWidth(1.4);
    doc.line(margin, y, margin + 64, y); y += 18;
  };
  const h2 = (t: string) => {
    ensure(24);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(50, 40, 90);
    doc.text(t, margin, y); y += 16;
  };
  const p = (t: string) => {
    if (!t) return;
    doc.setFont("helvetica", "normal").setFontSize(10.5).setTextColor(40, 40, 50);
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

  // Cover
  doc.setFillColor(15, 12, 35); doc.rect(0, 0, pageW, 180, "F");
  doc.setTextColor(180, 170, 255).setFont("helvetica", "bold").setFontSize(11);
  doc.text("VENTUREBOTS · AI PRODUCT STRATEGY", margin, 62);
  doc.setTextColor(255, 255, 255).setFontSize(28);
  doc.text(doc.splitTextToSize(productName, maxW), margin, 100);
  doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(200, 195, 230);
  doc.text(new Date().toLocaleDateString(undefined, { dateStyle: "long" }), margin, 160);
  y = 220;

  h1("Product Vision"); p(s.product_vision);

  h1("Target Users");
  s.target_users.forEach(u => kv(u.segment, u.description));

  h1("MVP Features");
  ["Build First", "Build Later", "Skip for Now"].forEach(pri => {
    const items = s.mvp_features.filter(f => f.priority === pri);
    if (!items.length) return;
    h2(pri);
    items.forEach(f => kv(f.name, f.description));
  });

  h1("Recommended Tech Stack");
  s.tech_stack.forEach(t => kv(t.layer, `${t.recommendation} — ${t.reason}`));

  h1("30-Day Launch Plan");
  s.launch_plan_30_days.forEach(w => {
    h2(`Week ${w.week} · ${w.focus}`);
    w.tasks.forEach(bullet);
  });

  h1("Top 3 Risks");
  s.top_risks.forEach(r => kv(`${r.risk} (${r.severity})`, `Mitigation: ${r.mitigation}`));

  h1("AI Recommendation");
  p(s.ai_recommendation);

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
