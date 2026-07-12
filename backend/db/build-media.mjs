// Scrapes CarDekho / BikeDekho for each vehicle's poster + exterior gallery.
// Writes db/media.json { plate: { poster, gallery: [...] } }.
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" };
const C = "https://www.cardekho.com/", B = "https://www.bikedekho.com/";
const V = [
  ["MH01-AA-1001",C+"maruti/alto-k10"],["KA02-BB-1002",C+"renault/kwid"],["DL03-CC-1003",C+"maruti/swift"],
  ["TS04-DD-1004",C+"hyundai/grand-i10-nios"],["MH05-EE-1005",C+"tata/tiago"],["KA06-FF-1006",C+"maruti/baleno"],
  ["DL07-GG-1007",C+"hyundai/i20"],["TN08-HH-1008",C+"maruti/dzire"],["MH09-II-1009",C+"honda/amaze"],
  ["KA10-JJ-1010",C+"honda/city"],["DL11-KK-1011",C+"hyundai/verna"],["HR12-LL-1012",C+"skoda/slavia"],
  ["MH13-MM-1013",C+"volkswagen/virtus"],["KA14-NN-1014",C+"maruti/brezza"],["MH15-OO-1015",C+"tata/nexon"],
  ["TS16-PP-1016",C+"hyundai/venue"],["KA17-QQ-1017",C+"kia/sonet"],["DL18-RR-1018",C+"mahindra/xuv300"],
  ["MH19-SS-1019",C+"hyundai/creta"],["KA20-TT-1020",C+"kia/seltos"],["HR21-UU-1021",C+"volkswagen/taigun"],
  ["MH22-VV-1022",C+"skoda/kushaq"],["PB23-WW-1023",C+"mahindra/scorpio-n"],["KA24-XX-1024",C+"toyota/innova-crysta"],
  ["MH25-YY-1025",C+"toyota/innova-hycross"],["HR26-ZZ-1026",C+"toyota/fortuner"],["TS27-AA-1027",C+"mg/hector"],
  ["MH28-BB-1028",C+"jeep/compass"],["KA29-CC-1029",C+"jeep/wrangler"],["DL30-DD-1030",C+"toyota/camry"],
  ["MH31-EE-1031",C+"bmw/3-series"],["KA32-FF-1032",C+"audi/a4"],["DL33-GG-1033",C+"mercedes-benz/c-class"],
  ["MH34-HH-1034",C+"mercedes-benz/e-class"],["KA35-II-1035",C+"bmw/5-series"],["MH36-JJ-1036",C+"audi/q5"],
  ["DL37-KK-1037",C+"bmw/x5"],["MH38-LL-1038",C+"land-rover/range-rover-sport"],["KA39-MM-1039",C+"volvo/xc90"],
  ["MH40-NN-1040",C+"tesla/model-3"],["KA41-OO-1041",C+"tata/nexon-ev"],["DL42-PP-1042",C+"mg/zs-ev"],
  ["GA43-QQ-1043",C+"mazda/mx-5"],["MH44-RR-1044",C+"ford/mustang"],["DL45-SS-1045",C+"chevrolet/camaro"],
  ["MH46-TT-1046",C+"porsche/911"],["KA47-UU-1047",C+"audi/r8"],["MH48-VV-1048",C+"lamborghini/huracan"],
  ["DL49-WW-1049",C+"ferrari/f8"],["MH50-XX-1050",C+"rolls-royce/ghost"],["DL51-YY-1051",C+"bentley/continental-gt"],
  ["MH01-B-2001",B+"honda/activa-6g"],["KA02-B-2002",B+"tvs/jupiter-125"],["DL03-B-2003",B+"suzuki/access-125"],
  ["KA04-B-2004",B+"ola-electric/s1-pro"],["KA05-B-2005",B+"ather/450x"],["MH06-B-2006",B+"vespa/vxl-125"],
  ["DL07-B-2007",B+"hero/splendor-plus"],["HR08-B-2008",B+"bajaj/pulsar-150"],["KA09-B-2009",B+"honda/sp125"],
  ["TN10-B-2010",B+"yamaha/fz-fi"],["TN11-B-2011",B+"tvs/apache-rtr-200-4v"],["MH12-B-2012",B+"royal-enfield/classic-350"],
  ["KA13-B-2013",B+"royal-enfield/hunter"],["DL14-B-2014",B+"royal-enfield/meteor-350"],["UK15-B-2015",B+"royal-enfield/himalayan-450"],
  ["KA16-B-2016",B+"ktm/390-duke"],["MH17-B-2017",B+"ktm/rc-390"],["DL18-B-2018",B+"bajaj/dominar-400"],
  ["TN19-B-2019",B+"yamaha/mt-15"],["KA20-B-2020",B+"yamaha/r15-v4"],["MH21-B-2021",B+"kawasaki/ninja-500"],
  ["KA22-B-2022",B+"kawasaki/ninja-650"],["DL23-B-2023",B+"triumph/speed-400"],["MH24-B-2024",B+"harley-davidson/x440"],
  ["KA25-B-2025",B+"harley-davidson/iron-883"],["MH26-B-2026",B+"kawasaki/z900"],["DL27-B-2027",B+"bmw/g-310-gs"],
  ["KA28-B-2028",B+"bmw/r-1250-gs-adventure"],["MH29-B-2029",B+"ducati/monster"],["MH30-B-2030",B+"ducati/panigale-v4"],
  ["DL31-B-2031",B+"kawasaki/ninja-zx-10r"],["KA32-B-2032",B+"harley-davidson/road-glide"],["MH33-B-2033",B+"harley-davidson/cvo-road-glide"],
];
async function scrape(url){
  const r = await fetch(url,{headers:UA,redirect:"follow"}); if(!r.ok) return null;
  const html = await r.text();
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if(!m) return null; const poster=m[1];
  if(/placeholder|default|logo|no-image/i.test(poster)) return null;
  // derive /Brand/Model/ segment for cars; brand/model slug for bikes
  let gallery=[];
  const car = url.includes("cardekho.com");
  if(car){
    const seg = poster.match(/\/(?:carexteriorimages|carinteriorimages)\/\d+x\d+\/([^/]+\/[^/]+)\//);
    if(seg){
      const key = "/"+seg[1]+"/";
      const all = [...html.matchAll(/https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/930x620\/[^"'\\ ]+\.jpg/gi)].map(x=>x[0]);
      const seen=new Set();
      for(const u of all){ if(!u.includes(key)) continue; const base=u.split("/").pop(); if(seen.has(base))continue; seen.add(base); gallery.push(u); if(gallery.length>=6)break; }
    }
  } else {
    const slug = url.split("/").slice(-2).join("/").replace("-","");
    const all=[...new Set([...html.matchAll(/https:\/\/cdn\.bikedekho\.com\/[^"'\\ ]+\.(?:jpg|webp)/gi)].map(x=>x[0]))];
    const brand=url.split("/").slice(-2)[0];
    for(const u of all){ if(!u.toLowerCase().includes(brand.replace(/-/g,"")))continue; if(/logo|placeholder/i.test(u))continue; gallery.push(u); if(gallery.length>=6)break; }
  }
  if(!gallery.includes(poster)) gallery.unshift(poster);
  gallery=[...new Set(gallery)].slice(0,6);
  return { poster, gallery };
}
const out={}; const miss=[];
for(const [plate,url] of V){
  let d=null; try{ d=await scrape(url); }catch{}
  if(d){ out[plate]=d; process.stdout.write(d.gallery.length>=3?".":"o"); }
  else { miss.push(plate); process.stdout.write("x"); }
}
console.log("\nok:",Object.keys(out).length,"miss:",miss.length, miss.join(","));
fs.writeFileSync(path.join(__dirname,"media.json"),JSON.stringify(out,null,2));
console.log("wrote media.json");
