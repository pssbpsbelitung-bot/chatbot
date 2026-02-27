import axios from "axios";
import fs from "fs";
import pdf from "pdf-parse";

const PUBLICATION_URL = "https://belitungkab.bps.go.id/publication";
const INDEX_PATH = "data/index.json";
const CHUNK_SIZE = 1200;

// pastikan folder data ada
if (!fs.existsSync("data")) fs.mkdirSync("data");

// load index lama
let index = [];
if (fs.existsSync(INDEX_PATH)) {
  index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
}

// helper: cek PDF sudah pernah diproses
const sudahAda = (link) => index.some(i => i.link === link);

// ambil halaman publikasi
const html = (await axios.get(PUBLICATION_URL)).data;

// ambil semua link PDF
const pdfLinks = [...html.matchAll(/href="(https?:\/\/.*?\.pdf)"/g)]
  .map(m => m[1])
  .filter((v, i, a) => a.indexOf(v) === i);

console.log(`Ditemukan ${pdfLinks.length} PDF`);

for (const link of pdfLinks) {

  if (sudahAda(link)) {
    console.log("Skip (sudah ada):", link);
    continue;
  }

  console.log("Proses:", link);

  const buffer = (await axios.get(link, {
    responseType: "arraybuffer",
    timeout: 30000
  })).data;

  const parsed = await pdf(buffer);
  const text = parsed.text.replace(/\s+/g, " ").trim();

  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.substring(i, i + CHUNK_SIZE));
  }

  chunks.forEach((chunk, i) => {
    index.push({
      judul: `Publikasi BPS Belitung (Bagian ${i + 1})`,
      isi: chunk,
      link: link
    });
  });
}

// simpan index terbaru
fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
console.log("Index diperbarui:", index.length, "potongan");