import fs from "fs";

const BASE = "https://belitungkab.bps.go.id";

async function crawl() {
  console.log("🚀 Mulai crawl BPS Belitung");

  const res = await fetch(`${BASE}/id/publication`);
  const html = await res.text();

  // ambil semua halaman publikasi
  const pages = [...html.matchAll(/href="(\/id\/publication\/\d+\/\d+\/[^"]+\.html)"/g)]
    .map(m => BASE + m[1]);

  console.log("📄 Halaman publikasi ditemukan:", pages.length);

  const results = [];

  for (const page of pages) {
    console.log("➡️ Buka:", page);
    const p = await fetch(page);
    const pHtml = await p.text();

    const pdf = pHtml.match(/href="([^"]+\.pdf)"/);
    if (pdf) {
      results.push({
        page,
        pdf: pdf[1].startsWith("http") ? pdf[1] : BASE + pdf[1]
      });
    }
  }

  fs.writeFileSync("index.json", JSON.stringify(results, null, 2));
  console.log("✅ Selesai, total PDF:", results.length);
}

crawl().catch(err => {
  console.error("🔥 ERROR:", err);
  process.exit(1);
});
