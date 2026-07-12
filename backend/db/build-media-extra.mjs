// Scrape posters + galleries for the EXTRA_VEHICLES and merge into media.json.
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
import { EXTRA_VEHICLES } from "./extra-vehicles.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" };

async function scrape(url) {
  const r = await fetch(url, { headers: UA, redirect: "follow" }); if (!r.ok) return null;
  const html = await r.text();
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (!m) return null; const poster = m[1];
  if (/placeholder|default|logo|no-image/i.test(poster)) return null;
  let gallery = [];
  if (url.includes("cardekho.com")) {
    const seg = poster.match(/\/(?:carexteriorimages|carinteriorimages)\/\d+x\d+\/([^/]+\/[^/]+)\//);
    if (seg) {
      const key = "/" + seg[1] + "/";
      const all = [...html.matchAll(/https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/930x620\/[^"'\\ ]+\.jpg/gi)].map(x => x[0]);
      const seen = new Set();
      for (const u of all) { if (!u.includes(key)) continue; const base = u.split("/").pop(); if (seen.has(base)) continue; seen.add(base); gallery.push(u); if (gallery.length >= 6) break; }
    }
  } else {
    const brand = url.split("/").slice(-2)[0];
    const all = [...new Set([...html.matchAll(/https:\/\/cdn\.bikedekho\.com\/[^"'\\ ]+\.(?:jpg|webp)/gi)].map(x => x[0]))];
    for (const u of all) { if (!u.toLowerCase().includes(brand.replace(/-/g, ""))) continue; if (/logo|placeholder/i.test(u)) continue; gallery.push(u); if (gallery.length >= 6) break; }
  }
  if (!gallery.includes(poster)) gallery.unshift(poster);
  gallery = [...new Set(gallery)].slice(0, 6);
  return { poster, gallery };
}

const media = JSON.parse(fs.readFileSync(path.join(__dirname, "media.json"), "utf8"));
const miss = [];
for (const v of EXTRA_VEHICLES) {
  let d = null; try { d = await scrape(v.url); } catch {}
  if (d) { media[v.plate] = d; process.stdout.write(d.gallery.length >= 3 ? "." : "o"); }
  else { miss.push(`${v.plate} ${v.url}`); process.stdout.write("x"); }
}
console.log("\nscraped:", EXTRA_VEHICLES.length - miss.length, "miss:", miss.length);
if (miss.length) console.log("MISSES:\n" + miss.join("\n"));
fs.writeFileSync(path.join(__dirname, "media.json"), JSON.stringify(media, null, 2));
console.log("merged into media.json");
