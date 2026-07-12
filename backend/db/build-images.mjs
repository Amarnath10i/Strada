// Scrapes CarDekho / BikeDekho for each vehicle's official poster (og:image),
// verifies it loads, and writes db/images.json { plate: image_url }.
// Falls back to a verified Unsplash stock photo (category-appropriate) on a miss.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" };

// plate, url (cardekho/bikedekho), fallbackGroup
const CARS = "https://www.cardekho.com/";
const BIKES = "https://www.bikedekho.com/";
const V = [
  // CARS
  ["MH01-AA-1001", CARS+"maruti/alto-k10", "hatch"],
  ["KA02-BB-1002", CARS+"renault/kwid", "hatch"],
  ["DL03-CC-1003", CARS+"maruti/swift", "hatch"],
  ["TS04-DD-1004", CARS+"hyundai/grand-i10-nios", "hatch"],
  ["MH05-EE-1005", CARS+"tata/tiago", "hatch"],
  ["KA06-FF-1006", CARS+"maruti/baleno", "hatch"],
  ["DL07-GG-1007", CARS+"hyundai/i20", "hatch"],
  ["TN08-HH-1008", CARS+"maruti/dzire", "sedan"],
  ["MH09-II-1009", CARS+"honda/amaze", "sedan"],
  ["KA10-JJ-1010", CARS+"honda/city", "sedan"],
  ["DL11-KK-1011", CARS+"hyundai/verna", "sedan"],
  ["HR12-LL-1012", CARS+"skoda/slavia", "sedan"],
  ["MH13-MM-1013", CARS+"volkswagen/virtus", "sedan"],
  ["KA14-NN-1014", CARS+"maruti/brezza", "suv"],
  ["MH15-OO-1015", CARS+"tata/nexon", "suv"],
  ["TS16-PP-1016", CARS+"hyundai/venue", "suv"],
  ["KA17-QQ-1017", CARS+"kia/sonet", "suv"],
  ["DL18-RR-1018", CARS+"mahindra/xuv300", "suv"],
  ["MH19-SS-1019", CARS+"hyundai/creta", "suv"],
  ["KA20-TT-1020", CARS+"kia/seltos", "suv"],
  ["HR21-UU-1021", CARS+"volkswagen/taigun", "suv"],
  ["MH22-VV-1022", CARS+"skoda/kushaq", "suv"],
  ["PB23-WW-1023", CARS+"mahindra/scorpio-n", "suv"],
  ["KA24-XX-1024", CARS+"toyota/innova-crysta", "suv"],
  ["MH25-YY-1025", CARS+"toyota/innova-hycross", "suv"],
  ["HR26-ZZ-1026", CARS+"toyota/fortuner", "suv"],
  ["TS27-AA-1027", CARS+"mg/hector", "suv"],
  ["MH28-BB-1028", CARS+"jeep/compass", "suv"],
  ["KA29-CC-1029", CARS+"jeep/wrangler", "suv"],
  ["DL30-DD-1030", CARS+"toyota/camry", "sedan"],
  ["MH31-EE-1031", CARS+"bmw/3-series", "sedan"],
  ["KA32-FF-1032", CARS+"audi/a4", "sedan"],
  ["DL33-GG-1033", CARS+"mercedes-benz/c-class", "sedan"],
  ["MH34-HH-1034", CARS+"mercedes-benz/e-class", "sedan"],
  ["KA35-II-1035", CARS+"bmw/5-series", "sedan"],
  ["MH36-JJ-1036", CARS+"audi/q5", "suv"],
  ["DL37-KK-1037", CARS+"bmw/x5", "suv"],
  ["MH38-LL-1038", CARS+"land-rover/range-rover-sport", "suv"],
  ["KA39-MM-1039", CARS+"volvo/xc90", "suv"],
  ["MH40-NN-1040", CARS+"tesla/model-3", "exotic"],
  ["KA41-OO-1041", CARS+"tata/nexon-ev", "suv"],
  ["DL42-PP-1042", CARS+"mg/zs-ev", "suv"],
  ["GA43-QQ-1043", CARS+"mazda/mx-5", "exotic"],
  ["MH44-RR-1044", CARS+"ford/mustang", "exotic"],
  ["DL45-SS-1045", CARS+"chevrolet/camaro", "exotic"],
  ["MH46-TT-1046", CARS+"porsche/911", "exotic"],
  ["KA47-UU-1047", CARS+"audi/r8", "exotic"],
  ["MH48-VV-1048", CARS+"lamborghini/huracan", "exotic"],
  ["DL49-WW-1049", CARS+"ferrari/f8", "exotic"],
  ["MH50-XX-1050", CARS+"rolls-royce/ghost", "exotic"],
  ["DL51-YY-1051", CARS+"bentley/continental-gt", "exotic"],
  // BIKES
  ["MH01-B-2001", BIKES+"honda/activa-6g", "scooter"],
  ["KA02-B-2002", BIKES+"tvs/jupiter-125", "scooter"],
  ["DL03-B-2003", BIKES+"suzuki/access-125", "scooter"],
  ["KA04-B-2004", BIKES+"ola-electric/s1-pro", "scooter"],
  ["KA05-B-2005", BIKES+"ather/450x", "scooter"],
  ["MH06-B-2006", BIKES+"vespa/vespa", "scooter"],
  ["DL07-B-2007", BIKES+"hero/splendor-plus", "commuter"],
  ["HR08-B-2008", BIKES+"bajaj/pulsar-150", "commuter"],
  ["KA09-B-2009", BIKES+"honda/sp-125", "commuter"],
  ["TN10-B-2010", BIKES+"yamaha/fz-s-fi-v3", "commuter"],
  ["TN11-B-2011", BIKES+"tvs/apache-rtr-200-4v", "sport"],
  ["MH12-B-2012", BIKES+"royal-enfield/classic-350", "cruiser"],
  ["KA13-B-2013", BIKES+"royal-enfield/hunter-350", "cruiser"],
  ["DL14-B-2014", BIKES+"royal-enfield/meteor-350", "cruiser"],
  ["UK15-B-2015", BIKES+"royal-enfield/himalayan-450", "adv"],
  ["KA16-B-2016", BIKES+"ktm/390-duke", "sport"],
  ["MH17-B-2017", BIKES+"ktm/rc-390", "sport"],
  ["DL18-B-2018", BIKES+"bajaj/dominar-400", "sport"],
  ["TN19-B-2019", BIKES+"yamaha/mt-15", "sport"],
  ["KA20-B-2020", BIKES+"yamaha/yzf-r15-v4", "sport"],
  ["MH21-B-2021", BIKES+"kawasaki/ninja-300", "sport"],
  ["KA22-B-2022", BIKES+"kawasaki/ninja-650", "sport"],
  ["DL23-B-2023", BIKES+"triumph/speed-400", "cruiser"],
  ["MH24-B-2024", BIKES+"harley-davidson/x440", "cruiser"],
  ["KA25-B-2025", BIKES+"harley-davidson/iron-883", "cruiser"],
  ["MH26-B-2026", BIKES+"kawasaki/z900", "sport"],
  ["DL27-B-2027", BIKES+"bmw/g-310-gs", "adv"],
  ["KA28-B-2028", BIKES+"bmw/r-1250-gs-adventure", "adv"],
  ["MH29-B-2029", BIKES+"ducati/monster", "sport"],
  ["MH30-B-2030", BIKES+"ducati/panigale-v4", "sport"],
  ["DL31-B-2031", BIKES+"kawasaki/ninja-zx-10r", "sport"],
  ["KA32-B-2032", BIKES+"harley-davidson/road-glide", "cruiser"],
  ["MH33-B-2033", BIKES+"harley-davidson/cvo-road-glide", "cruiser"],
];

const FALLBACK = {
  hatch:   ["1541899481282-d53bffe3c35d","1549317661-bd32c8ce0db2","1471479917193-f00955256257","1590362891991-f776e747a588"],
  sedan:   ["1552519507-da3b142c6e3d","1580273916550-e323be2ae537","1541443131876-44b03de101c5","1523983388277-336a66bf9bcd","1621007947382-bb3c3994e3fb","1617469767053-8f35aaa39fd8"],
  suv:     ["1533473359331-0135ef1b58bf","1568844293986-8d0400bd4745","1568605117036-5fe5e7bab0b7","1568605114967-8130f3a36994","1519641471654-76ce0107ad1b","1606664515524-ed2f786a0bd6","1519245659620-e859806a8d3b","1580414057403-c5f451f30e1c"],
  exotic:  ["1503736334956-4c8f8e92946d","1614200187524-dc4b892acf16","1544636331-e26879cd4d9b","1583121274602-3e2820c69888","1631295868223-63265b40d9e4","1494905998402-395d579af36f","1560958089-b8a1929cea89","1503376780353-7e6692767b70"],
  scooter: ["1568772585407-9361f9bf3a87","1571068316344-75bc76f77890","1601758124510-52d02ddb7cbd"],
  commuter:["1580310614729-ccd69652491d","1558981806-ec527fa84c39","1547549082-6bc09f2049ae"],
  sport:   ["1591637333184-19aa84b3e01f","1558618047-3c8c76ca7d13","1449426468159-d96dbf08f19f"],
  cruiser: ["1609630875171-b1321377ee65","1615172282427-9a57ef2d142e"],
  adv:     ["1622185135505-2d795003994a"],
};
const fbIdx = {};
function fallback(group) {
  const pool = FALLBACK[group] || FALLBACK.exotic;
  const i = (fbIdx[group] = (fbIdx[group] ?? -1) + 1) % pool.length;
  return `https://images.unsplash.com/photo-${pool[i]}?w=800`;
}

async function ogImage(url) {
  const r = await fetch(url, { headers: UA, redirect: "follow" });
  if (!r.ok) return null;
  const html = await r.text();
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
         || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (!m) return null;
  const img = m[1];
  if (/placeholder|default|logo|no-image/i.test(img)) return null;
  try { const ir = await fetch(img, { headers: UA }); if (!ir.ok) return null; } catch { return null; }
  return img;
}

const out = {};
const misses = [];
for (const [plate, url, group] of V) {
  let img = null;
  try { img = await ogImage(url); } catch { img = null; }
  if (img) { out[plate] = img; }
  else { out[plate] = fallback(group); misses.push(`${plate} ${url}`); }
  process.stdout.write(img ? "." : "x");
}
console.log("\nmatched:", Object.keys(out).length - misses.length, "fallback:", misses.length);
if (misses.length) console.log("MISSES:\n" + misses.join("\n"));
fs.writeFileSync(path.join(__dirname, "images.json"), JSON.stringify(out, null, 2));
console.log("wrote images.json");
