import fs from "fs";

console.log("🚀 Crawler mulai...");

try {
  const url = "https://belitungkab.bps.go.id/id/publication";
  console.log("🌐 Target:", url);

  // TEST TULIS FILE DULU
  fs.writeFileSync("index.json", JSON.stringify({
    status: "crawler jalan",
    waktu: new Date().toISOString()
  }, null, 2));

  console.log("✅ index.json berhasil ditulis");
} catch (err) {
  console.error("🔥 ERROR ASLI NIH:");
  console.error(err);
  process.exit(1);
}
