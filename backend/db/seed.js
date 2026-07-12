import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./index.js";

// Official model posters scraped from CarDekho / BikeDekho, keyed by plate.
// See db/build-images.mjs for how this file is generated.
const __seedDir = path.dirname(fileURLToPath(import.meta.url));
const POSTERS = JSON.parse(fs.readFileSync(path.join(__seedDir, "images.json"), "utf8"));
// Poster + exterior gallery scraped from CarDekho/BikeDekho. See db/build-media.mjs.
const MEDIA = JSON.parse(fs.readFileSync(path.join(__seedDir, "media.json"), "utf8"));

/*
  Strada / Depot Rentals seed
  ---------------------------
  Prices are in Indian Rupees (₹).

  Foreign-market cars (Ford, Chevrolet, Dodge, Rolls-Royce, Lamborghini, etc.)
  have been converted to INR at ~₹83 per USD / ~₹105 per GBP and rounded
  to sensible rental-market numbers. Per-hour ≈ per-day / 8, per-km rate
  is a running-cost estimate typical of Indian self-drive rentals
  (Zoomcar / Revv / Royal Brothers style pricing).
*/

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;

if (userCount === 0) {
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
  );
  const adminHash = bcrypt.hashSync("admin123", 10);
  const customerHash = bcrypt.hashSync("customer123", 10);
  insertUser.run("Fleet Admin", "admin@strada.com", adminHash, "admin");
  insertUser.run("Jamie Rivera", "jamie@example.com", customerHash, "customer");
  console.log("Seeded users: admin@strada.com / admin123, jamie@example.com / customer123");
}

const vehicleCount = db.prepare("SELECT COUNT(*) AS c FROM vehicles").get().c;

if (vehicleCount === 0) {
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles
      (type, brand, model, year, plate, category, transmission, seats,
       price_per_hour, price_per_day, price_per_km, location, image_url, description, status,
       listing_mode, ex_showroom_price, on_road_price, fuel, colors, features, gallery)
    VALUES
      (@type, @brand, @model, @year, @plate, @category, @transmission, @seats,
       @price_per_hour, @price_per_day, @price_per_km, @location, @image_url, @description, @status,
       @listing_mode, @ex_showroom_price, @on_road_price, @fuel, @colors, @features, @gallery)
  `);

  const LOC = {
    MUM: "Mumbai Depot",
    BLR: "Bengaluru Depot",
    DEL: "Delhi Depot",
    HYD: "Hyderabad Depot",
    PUN: "Pune Depot",
    CHN: "Chennai Depot",
    GOA: "Goa Depot",
  };

  // helper to keep the list readable
  const v = (o) => ({
    transmission: o.type === "bike" ? null : (o.transmission || "manual"),
    seats: o.type === "bike" ? 2 : (o.seats ?? 5),
    status: "available",
    ...o,
  });

  const vehicles = [
    // =====================================================================
    // CARS — cheapest hatchbacks → mid sedans → SUVs → luxury → supercars
    // =====================================================================
    v({ type:"car", brand:"Maruti Suzuki", model:"Alto K10",  year:2023, plate:"MH01-AA-1001", category:"Hatchback",       transmission:"manual",    seats:4, price_per_hour:60,   price_per_day:900,    price_per_km:6,   location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", description:"India's most popular pocket hatch. Feather-light, sips fuel, and squeezes into any parking gap." }),
    v({ type:"car", brand:"Renault",       model:"Kwid",      year:2022, plate:"KA02-BB-1002", category:"Hatchback",       transmission:"manual",    seats:5, price_per_hour:70,   price_per_day:1000,   price_per_km:6,   location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800", description:"Crossover-styled entry hatch with a surprisingly tall stance for the city." }),
    v({ type:"car", brand:"Maruti Suzuki", model:"Swift",     year:2023, plate:"DL03-CC-1003", category:"Hatchback",       transmission:"manual",    seats:5, price_per_hour:90,   price_per_day:1300,   price_per_km:7,   location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800", description:"The evergreen driver's hatch — punchy, chuckable, and cheap to run." }),
    v({ type:"car", brand:"Hyundai",       model:"Grand i10 Nios", year:2023, plate:"TS04-DD-1004", category:"Hatchback", transmission:"automatic", seats:5, price_per_hour:100,  price_per_day:1400,   price_per_km:8,   location:LOC.HYD, image_url:"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", description:"AMT gearbox and a genuinely upscale cabin for a premium hatch." }),
    v({ type:"car", brand:"Tata",          model:"Tiago",     year:2023, plate:"MH05-EE-1005", category:"Hatchback",       transmission:"manual",    seats:5, price_per_hour:85,   price_per_day:1200,   price_per_km:7,   location:LOC.PUN, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"5-star safety rated hatch — a smart pick for new drivers." }),
    v({ type:"car", brand:"Maruti Suzuki", model:"Baleno",    year:2023, plate:"KA06-FF-1006", category:"Premium Hatch",   transmission:"automatic", seats:5, price_per_hour:120,  price_per_day:1700,   price_per_km:9,   location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", description:"Roomy premium hatchback with a modern touchscreen and smooth CVT." }),
    v({ type:"car", brand:"Hyundai",       model:"i20",       year:2023, plate:"DL07-GG-1007", category:"Premium Hatch",   transmission:"automatic", seats:5, price_per_hour:130,  price_per_day:1800,   price_per_km:9,   location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"Sporty premium hatch with wireless CarPlay and a peppy turbo option." }),
    v({ type:"car", brand:"Maruti Suzuki", model:"Dzire",     year:2023, plate:"TN08-HH-1008", category:"Compact Sedan",   transmission:"manual",    seats:5, price_per_hour:110,  price_per_day:1500,   price_per_km:8,   location:LOC.CHN, image_url:"https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800", description:"Compact sedan with big boot space — a favourite for city cabs." }),
    v({ type:"car", brand:"Honda",         model:"Amaze",     year:2022, plate:"MH09-II-1009", category:"Compact Sedan",   transmission:"automatic", seats:5, price_per_hour:130,  price_per_day:1800,   price_per_km:9,   location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800", description:"Refined compact sedan with a silky CVT and Honda's build quality." }),
    v({ type:"car", brand:"Honda",         model:"City",      year:2023, plate:"KA10-JJ-1010", category:"Sedan",           transmission:"automatic", seats:5, price_per_hour:170,  price_per_day:2400,   price_per_km:11,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", description:"The benchmark mid-size sedan — smooth, spacious, quiet on the highway." }),
    v({ type:"car", brand:"Hyundai",       model:"Verna",     year:2023, plate:"DL11-KK-1011", category:"Sedan",           transmission:"automatic", seats:5, price_per_hour:180,  price_per_day:2500,   price_per_km:11,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", description:"Feature-packed sedan with ventilated seats and a punchy turbo motor." }),
    v({ type:"car", brand:"Skoda",         model:"Slavia",    year:2023, plate:"HR12-LL-1012", category:"Sedan",           transmission:"automatic", seats:5, price_per_hour:210,  price_per_day:2900,   price_per_km:12,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800", description:"Euro-flavoured sedan with a torquey 1.5 TSI and confident cruising." }),
    v({ type:"car", brand:"Volkswagen",    model:"Virtus",    year:2023, plate:"MH13-MM-1013", category:"Sedan",           transmission:"automatic", seats:5, price_per_hour:220,  price_per_day:3100,   price_per_km:12,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=800", description:"German-engineered sedan with a DSG box and vault-like build." }),
    v({ type:"car", brand:"Maruti Suzuki", model:"Brezza",    year:2023, plate:"KA14-NN-1014", category:"Compact SUV",     transmission:"automatic", seats:5, price_per_hour:170,  price_per_day:2400,   price_per_km:11,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", description:"Practical urban SUV with a sunroof and enough ground clearance for pothole season." }),
    v({ type:"car", brand:"Tata",          model:"Nexon",     year:2023, plate:"MH15-OO-1015", category:"Compact SUV",     transmission:"automatic", seats:5, price_per_hour:180,  price_per_day:2500,   price_per_km:11,  location:LOC.PUN, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"India's first 5-star Global NCAP SUV — built like a tank." }),
    v({ type:"car", brand:"Hyundai",       model:"Venue",     year:2023, plate:"TS16-PP-1016", category:"Compact SUV",     transmission:"automatic", seats:5, price_per_hour:180,  price_per_day:2500,   price_per_km:11,  location:LOC.HYD, image_url:"https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800", description:"Compact SUV loaded with connected-car tech and a peppy turbo." }),
    v({ type:"car", brand:"Kia",           model:"Sonet",     year:2023, plate:"KA17-QQ-1017", category:"Compact SUV",     transmission:"automatic", seats:5, price_per_hour:200,  price_per_day:2800,   price_per_km:12,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", description:"Feature-heavy compact SUV with a Bose stereo and ventilated seats." }),
    v({ type:"car", brand:"Mahindra",      model:"XUV300",    year:2022, plate:"DL18-RR-1018", category:"Compact SUV",     transmission:"manual",    seats:5, price_per_hour:170,  price_per_day:2400,   price_per_km:11,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", description:"Rugged compact SUV with class-leading safety and cornering lamps." }),
    v({ type:"car", brand:"Hyundai",       model:"Creta",     year:2023, plate:"MH19-SS-1019", category:"Mid SUV",         transmission:"automatic", seats:5, price_per_hour:250,  price_per_day:3500,   price_per_km:13,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800", description:"India's best-selling mid SUV — comfy, feature-loaded, easy to drive." }),
    v({ type:"car", brand:"Kia",           model:"Seltos",    year:2023, plate:"KA20-TT-1020", category:"Mid SUV",         transmission:"automatic", seats:5, price_per_hour:260,  price_per_day:3700,   price_per_km:13,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", description:"Sharp-looking mid SUV with a 10-inch screen and heads-up display." }),
    v({ type:"car", brand:"Volkswagen",    model:"Taigun",    year:2023, plate:"HR21-UU-1021", category:"Mid SUV",         transmission:"automatic", seats:5, price_per_hour:280,  price_per_day:3900,   price_per_km:14,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800", description:"German mid SUV with a rock-solid feel and a torquey TSI motor." }),
    v({ type:"car", brand:"Skoda",         model:"Kushaq",    year:2023, plate:"MH22-VV-1022", category:"Mid SUV",         transmission:"automatic", seats:5, price_per_hour:280,  price_per_day:3900,   price_per_km:14,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"Sharp handling mid SUV with a Euro-style cabin." }),
    v({ type:"car", brand:"Mahindra",      model:"Scorpio-N", year:2023, plate:"PB23-WW-1023", category:"Full SUV",        transmission:"automatic", seats:7, price_per_hour:320,  price_per_day:4500,   price_per_km:15,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", description:"Body-on-frame 7-seater — huge road presence and real 4x4 chops." }),
    v({ type:"car", brand:"Toyota",        model:"Innova Crysta", year:2022, plate:"KA24-XX-1024", category:"MPV",         transmission:"manual",    seats:7, price_per_hour:280,  price_per_day:3900,   price_per_km:14,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"The go-to family MPV — bulletproof reliability for long road trips." }),
    v({ type:"car", brand:"Toyota",        model:"Innova Hycross", year:2023, plate:"MH25-YY-1025", category:"MPV",        transmission:"automatic", seats:7, price_per_hour:380,  price_per_day:5300,   price_per_km:16,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800", description:"Strong-hybrid flagship MPV with captain seats and a hushed cabin." }),
    v({ type:"car", brand:"Toyota",        model:"Fortuner",  year:2022, plate:"HR26-ZZ-1026", category:"Full SUV",        transmission:"automatic", seats:7, price_per_hour:520,  price_per_day:7200,   price_per_km:20,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800", description:"The don of Indian highways — big, bold, and unstoppable off-road." }),
    v({ type:"car", brand:"MG",            model:"Hector",    year:2023, plate:"TS27-AA-1027", category:"Full SUV",        transmission:"automatic", seats:7, price_per_hour:400,  price_per_day:5600,   price_per_km:17,  location:LOC.HYD, image_url:"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", description:"Massive touchscreen, panoramic roof, and a lounge-like second row." }),
    v({ type:"car", brand:"Jeep",          model:"Compass",   year:2023, plate:"MH28-BB-1028", category:"Premium SUV",     transmission:"automatic", seats:5, price_per_hour:480,  price_per_day:6700,   price_per_km:19,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", description:"American SUV with genuine off-road hardware and a plush cabin." }),
    v({ type:"car", brand:"Jeep",          model:"Wrangler",  year:2022, plate:"KA29-CC-1029", category:"Off-road SUV",    transmission:"automatic", seats:4, price_per_hour:750,  price_per_day:10500,  price_per_km:26,  location:LOC.GOA, image_url:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", description:"Removable top, low-range 4x4, and real trail-rated hardware." }),
    v({ type:"car", brand:"Toyota",        model:"Camry Hybrid", year:2023, plate:"DL30-DD-1030", category:"Luxury Sedan", transmission:"automatic", seats:5, price_per_hour:600,  price_per_day:8400,   price_per_km:21,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", description:"Hybrid luxury sedan — silent city runs and 20+ km/l on the highway." }),
    v({ type:"car", brand:"BMW",           model:"3 Series",  year:2023, plate:"MH31-EE-1031", category:"Luxury Sedan",    transmission:"automatic", seats:5, price_per_hour:750,  price_per_day:10500,  price_per_km:26,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800", description:"The definitive sport sedan — sharp steering, punchy inline-6." }),
    v({ type:"car", brand:"Audi",          model:"A4",        year:2023, plate:"KA32-FF-1032", category:"Luxury Sedan",    transmission:"automatic", seats:5, price_per_hour:780,  price_per_day:10900,  price_per_km:27,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=800", description:"Vorsprung durch Technik — virtual cockpit, quattro-ready cabin." }),
    v({ type:"car", brand:"Mercedes-Benz", model:"C-Class",   year:2023, plate:"DL33-GG-1033", category:"Luxury Sedan",    transmission:"automatic", seats:5, price_per_hour:850,  price_per_day:11900,  price_per_km:28,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1617469767053-8f35aaa39fd8?w=800", description:"S-Class styling in a compact package. Dual screens, air suspension available." }),
    v({ type:"car", brand:"Mercedes-Benz", model:"E-Class LWB", year:2023, plate:"MH34-HH-1034", category:"Luxury Sedan",  transmission:"automatic", seats:5, price_per_hour:1200, price_per_day:16800,  price_per_km:35,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1617469767053-8f35aaa39fd8?w=800", description:"India's favourite chauffeur-driven luxury sedan. Rear-seat lounge." }),
    v({ type:"car", brand:"BMW",           model:"5 Series",  year:2023, plate:"KA35-II-1035", category:"Luxury Sedan",    transmission:"automatic", seats:5, price_per_hour:1200, price_per_day:16800,  price_per_km:35,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", description:"Business-class BMW with executive rear seating and a laser-quiet cabin." }),
    v({ type:"car", brand:"Audi",          model:"Q5",        year:2023, plate:"MH36-JJ-1036", category:"Luxury SUV",      transmission:"automatic", seats:5, price_per_hour:1100, price_per_day:15400,  price_per_km:33,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800", description:"Quattro all-wheel drive luxury SUV — as good on wet ghats as glass towers." }),
    v({ type:"car", brand:"BMW",           model:"X5",        year:2023, plate:"DL37-KK-1037", category:"Luxury SUV",      transmission:"automatic", seats:5, price_per_hour:1500, price_per_day:21000,  price_per_km:42,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800", description:"Big, brawny luxury SUV with a straight-6 that pulls like a train." }),
    v({ type:"car", brand:"Land Rover",    model:"Range Rover Sport", year:2023, plate:"MH38-LL-1038", category:"Luxury SUV", transmission:"automatic", seats:5, price_per_hour:1900, price_per_day:26600, price_per_km:52, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800", description:"Air suspension, terrain response, and a cabin lifted from the flagship Range Rover." }),
    v({ type:"car", brand:"Volvo",         model:"XC90",      year:2023, plate:"KA39-MM-1039", category:"Luxury SUV",      transmission:"automatic", seats:7, price_per_hour:1400, price_per_day:19600, price_per_km:40, location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", description:"Scandi-luxury 7-seater with the safest cabin money can buy." }),
    v({ type:"car", brand:"Tesla",         model:"Model 3",   year:2024, plate:"MH40-NN-1040", category:"Electric Sedan",  transmission:"automatic", seats:5, price_per_hour:900,  price_per_day:12600, price_per_km:20, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800", description:"All-electric sports sedan with Autopilot. Silent, quick, tech-forward." }),
    v({ type:"car", brand:"Tata",          model:"Nexon EV",  year:2023, plate:"KA41-OO-1041", category:"Electric SUV",    transmission:"automatic", seats:5, price_per_hour:220,  price_per_day:3100,   price_per_km:5,   location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"India's most popular EV — 400+ km range and city-friendly running costs." }),
    v({ type:"car", brand:"MG",            model:"ZS EV",     year:2023, plate:"DL42-PP-1042", category:"Electric SUV",    transmission:"automatic", seats:5, price_per_hour:320,  price_per_day:4500,   price_per_km:6,   location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", description:"Full-size electric SUV with a panoramic roof and Level-2 ADAS." }),
    v({ type:"car", brand:"Mazda",         model:"MX-5 Miata", year:2023, plate:"GA43-QQ-1043", category:"Convertible",    transmission:"manual",    seats:2, price_per_hour:600,  price_per_day:8400,   price_per_km:22, location:LOC.GOA, image_url:"https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800", description:"Featherweight roadster — the purest joyride on the coast road." }),
    v({ type:"car", brand:"Ford",          model:"Mustang GT", year:2022, plate:"MH44-RR-1044", category:"Muscle Car",     transmission:"automatic", seats:4, price_per_hour:1600, price_per_day:22400, price_per_km:45, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", description:"5.0 V8, active exhaust, and American muscle-car swagger." }),
    v({ type:"car", brand:"Chevrolet",     model:"Camaro SS", year:2022, plate:"DL45-SS-1045", category:"Muscle Car",     transmission:"automatic", seats:4, price_per_hour:1700, price_per_day:23800, price_per_km:48, location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", description:"Transformers-style styling and a snarling 6.2L V8." }),
    v({ type:"car", brand:"Porsche",       model:"911 Carrera", year:2023, plate:"MH46-TT-1046", category:"Sports Car",   transmission:"automatic", seats:2, price_per_hour:3200, price_per_day:44800, price_per_km:85, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", description:"The benchmark sports coupe — flat-six howl and telepathic steering." }),
    v({ type:"car", brand:"Audi",          model:"R8 V10",    year:2022, plate:"KA47-UU-1047", category:"Supercar",       transmission:"automatic", seats:2, price_per_hour:5500, price_per_day:76500, price_per_km:130, location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800", description:"Naturally-aspirated V10 supercar with Quattro traction." }),
    v({ type:"car", brand:"Lamborghini",   model:"Huracán EVO", year:2022, plate:"MH48-VV-1048", category:"Supercar",     transmission:"automatic", seats:2, price_per_hour:8500, price_per_day:118000, price_per_km:180, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800", description:"Naturally-aspirated V10 fury. Every drive is an event." }),
    v({ type:"car", brand:"Ferrari",       model:"F8 Tributo", year:2022, plate:"DL49-WW-1049", category:"Supercar",     transmission:"automatic", seats:2, price_per_hour:9500, price_per_day:132000, price_per_km:200, location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", description:"Twin-turbo V8 Prancing Horse — a rolling piece of Maranello." }),
    v({ type:"car", brand:"Rolls-Royce",   model:"Ghost",     year:2023, plate:"MH50-XX-1050", category:"Ultra-Luxury",   transmission:"automatic", seats:5, price_per_hour:10000, price_per_day:140000, price_per_km:210, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800", description:"The top of our lot. A hand-built flagship for weddings, galas, and grand entrances.", status:"available" }),
    v({ type:"car", brand:"Bentley",       model:"Continental GT", year:2022, plate:"DL51-YY-1051", category:"Ultra-Luxury", transmission:"automatic", seats:4, price_per_hour:8000, price_per_day:112000, price_per_km:180, location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", description:"W12 grand tourer — hand-stitched leather and effortless 300 km/h grace." }),

    // =====================================================================
    // BIKES — scooters → commuters → cruisers → naked/sport → adventure → superbikes
    // =====================================================================
    v({ type:"bike", brand:"Honda",         model:"Activa 6G",       year:2023, plate:"MH01-B-2001", category:"Scooter",           price_per_hour:40,   price_per_day:400,   price_per_km:3,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800", description:"India's default scooter — start it, twist it, go. Cheapest set of wheels on the lot." }),
    v({ type:"bike", brand:"TVS",           model:"Jupiter 125",     year:2023, plate:"KA02-B-2002", category:"Scooter",           price_per_hour:45,   price_per_day:450,   price_per_km:3,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800", description:"Peppy 125cc scooter with the largest boot space in class." }),
    v({ type:"bike", brand:"Suzuki",        model:"Access 125",      year:2023, plate:"DL03-B-2003", category:"Scooter",           price_per_hour:45,   price_per_day:450,   price_per_km:3,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800", description:"Smooth, refined 125cc scooter — great mileage, easy to ride." }),
    v({ type:"bike", brand:"Ola",           model:"S1 Pro (EV)",     year:2023, plate:"KA04-B-2004", category:"Electric Scooter",  price_per_hour:60,   price_per_day:600,   price_per_km:1,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800", description:"Silent electric scooter with 170 km range and app-connected features." }),
    v({ type:"bike", brand:"Ather",         model:"450X",            year:2023, plate:"KA05-B-2005", category:"Electric Scooter",  price_per_hour:70,   price_per_day:700,   price_per_km:1,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800", description:"Punchy Bengaluru-built electric scooter — 0-40 in 3.3s." }),
    v({ type:"bike", brand:"Vespa",         model:"Primavera 150",   year:2023, plate:"MH06-B-2006", category:"Premium Scooter",   price_per_hour:80,   price_per_day:900,   price_per_km:4,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1598983117300-16f966c9e0a2?w=800", description:"Classic Italian styling with modern reliability underneath." }),
    v({ type:"bike", brand:"Hero",          model:"Splendor Plus",   year:2023, plate:"DL07-B-2007", category:"Commuter",          price_per_hour:35,   price_per_day:350,   price_per_km:2,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", description:"The commuter that runs half of India. Unkillable, ultra-cheap to run." }),
    v({ type:"bike", brand:"Bajaj",         model:"Pulsar 150",      year:2023, plate:"HR08-B-2008", category:"Commuter Sport",    price_per_hour:60,   price_per_day:700,   price_per_km:3,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", description:"The definitive Indian street bike — sporty stance, punchy 150cc mill." }),
    v({ type:"bike", brand:"Honda",         model:"SP 125",          year:2023, plate:"KA09-B-2009", category:"Commuter",          price_per_hour:45,   price_per_day:500,   price_per_km:2,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800", description:"Fuel-injected 125cc commuter — 65+ km/l all day." }),
    v({ type:"bike", brand:"Yamaha",        model:"FZ-S V3",         year:2023, plate:"TN10-B-2010", category:"Naked Standard",    price_per_hour:80,   price_per_day:900,   price_per_km:4,  location:LOC.CHN, image_url:"https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800", description:"Muscular street naked with a signature Yamaha handling feel." }),
    v({ type:"bike", brand:"TVS",           model:"Apache RTR 200",  year:2023, plate:"TN11-B-2011", category:"Naked Sport",       price_per_hour:90,   price_per_day:1000,  price_per_km:5,  location:LOC.CHN, image_url:"https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800", description:"Race-bred 200cc naked with adjustable riding modes." }),
    v({ type:"bike", brand:"Royal Enfield", model:"Classic 350",     year:2023, plate:"MH12-B-2012", category:"Cruiser",           price_per_hour:110,  price_per_day:1200,  price_per_km:5,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", description:"Thumping single with timeless styling — the definitive Indian cruiser." }),
    v({ type:"bike", brand:"Royal Enfield", model:"Hunter 350",      year:2023, plate:"KA13-B-2013", category:"Roadster",          price_per_hour:100,  price_per_day:1100,  price_per_km:5,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", description:"Nimble roadster version of the J-platform — perfect city Enfield." }),
    v({ type:"bike", brand:"Royal Enfield", model:"Meteor 350",      year:2023, plate:"DL14-B-2014", category:"Cruiser",           price_per_hour:110,  price_per_day:1250,  price_per_km:5,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800", description:"Relaxed cruiser with a comfy pillion seat and Tripper navigation." }),
    v({ type:"bike", brand:"Royal Enfield", model:"Himalayan 450",   year:2024, plate:"UK15-B-2015", category:"Adventure",         price_per_hour:180,  price_per_day:2000,  price_per_km:7,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800", description:"Purpose-built Himalayan adventure bike — 40hp Sherpa 450 motor, ride modes." }),
    v({ type:"bike", brand:"KTM",           model:"Duke 390",        year:2023, plate:"KA16-B-2016", category:"Naked Sport",       price_per_hour:170,  price_per_day:1900,  price_per_km:7,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Razor-sharp naked with 44hp and TFT dash — the hooligan special." }),
    v({ type:"bike", brand:"KTM",           model:"RC 390",          year:2023, plate:"MH17-B-2017", category:"Sport",             price_per_hour:180,  price_per_day:2000,  price_per_km:7,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Track-focused fully-faired KTM with cornering ABS." }),
    v({ type:"bike", brand:"Bajaj",         model:"Dominar 400",     year:2023, plate:"DL18-B-2018", category:"Tourer",            price_per_hour:150,  price_per_day:1700,  price_per_km:6,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800", description:"Muscular sport-tourer with a torquey 373cc mill — a highway favourite." }),
    v({ type:"bike", brand:"Yamaha",        model:"MT-15",           year:2023, plate:"TN19-B-2019", category:"Naked Sport",       price_per_hour:130,  price_per_day:1500,  price_per_km:6,  location:LOC.CHN, image_url:"https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800", description:"Baby MT with the R15's engine — sharp and playful." }),
    v({ type:"bike", brand:"Yamaha",        model:"R15 V4",          year:2023, plate:"KA20-B-2020", category:"Sport",             price_per_hour:150,  price_per_day:1700,  price_per_km:6,  location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Track-inspired 155cc supersport with VVA and quickshifter." }),
    v({ type:"bike", brand:"Kawasaki",      model:"Ninja 300",       year:2022, plate:"MH21-B-2021", category:"Sport",             price_per_hour:250,  price_per_day:2800,  price_per_km:9,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Sweet-handling parallel-twin — a great step into full-fairing bikes." }),
    v({ type:"bike", brand:"Kawasaki",      model:"Ninja 650",       year:2023, plate:"KA22-B-2022", category:"Sport Tourer",      price_per_hour:400,  price_per_day:4500,  price_per_km:14, location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Do-it-all middleweight twin with big-bike stability." }),
    v({ type:"bike", brand:"Triumph",       model:"Speed 400",       year:2024, plate:"DL23-B-2023", category:"Modern Classic",    price_per_hour:180,  price_per_day:2000,  price_per_km:7,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800", description:"India-built Triumph — 40hp single with premium chassis feel." }),
    v({ type:"bike", brand:"Harley-Davidson", model:"X440",          year:2024, plate:"MH24-B-2024", category:"Cruiser",          price_per_hour:220,  price_per_day:2500,  price_per_km:8,  location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800", description:"H-D's first India-built roadster cruiser — 440cc single, big torque." }),
    v({ type:"bike", brand:"Harley-Davidson", model:"Iron 883",      year:2022, plate:"KA25-B-2025", category:"Cruiser",          price_per_hour:650,  price_per_day:7200,  price_per_km:20, location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800", description:"Blacked-out Sportster with a deep V-twin rumble." }),
    v({ type:"bike", brand:"Kawasaki",      model:"Z900",            year:2023, plate:"MH26-B-2026", category:"Naked Superbike",  price_per_hour:800,  price_per_day:9000,  price_per_km:26, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Inline-4 naked hooligan — 125hp, wheelie-happy Sugomi styling." }),
    v({ type:"bike", brand:"BMW",           model:"G 310 GS",        year:2023, plate:"DL27-B-2027", category:"Adventure",        price_per_hour:250,  price_per_day:2800,  price_per_km:9,  location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800", description:"Baby GS — approachable adventure with real off-road ability." }),
    v({ type:"bike", brand:"BMW",           model:"R 1250 GS Adventure", year:2023, plate:"KA28-B-2028", category:"Adventure Touring", price_per_hour:1400, price_per_day:15500, price_per_km:38, location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800", description:"The go-anywhere flagship ADV — huge tank range and full electronics suite." }),
    v({ type:"bike", brand:"Ducati",        model:"Monster",         year:2023, plate:"MH29-B-2029", category:"Naked Superbike",  price_per_hour:1200, price_per_day:13500, price_per_km:35, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"Iconic Italian naked — 111hp V-twin, aggressive stance, cornering ABS." }),
    v({ type:"bike", brand:"Ducati",        model:"Panigale V4",     year:2023, plate:"MH30-B-2030", category:"Superbike",        price_per_hour:2000, price_per_day:22500, price_per_km:55, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800", description:"MotoGP-derived V4 superbike — the fastest, most exclusive machine in the fleet." }),
    v({ type:"bike", brand:"Kawasaki",      model:"Ninja ZX-10R",    year:2022, plate:"DL31-B-2031", category:"Superbike",        price_per_hour:1900, price_per_day:21000, price_per_km:52, location:LOC.DEL, image_url:"https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800", description:"WSBK-derived litre-class rocket with quickshifter and race modes." }),
    v({ type:"bike", brand:"Harley-Davidson", model:"Road Glide",    year:2023, plate:"KA32-B-2032", category:"Touring",          price_per_hour:1500, price_per_day:16500, price_per_km:42, location:LOC.BLR, image_url:"https://images.unsplash.com/photo-1571646750134-a5b0e6d5eb85?w=800", description:"Frame-mounted fairing, big Milwaukee-Eight V-twin, hard bags for the long haul." }),
    v({ type:"bike", brand:"Harley-Davidson", model:"CVO Road Glide", year:2023, plate:"MH33-B-2033", category:"Touring",         price_per_hour:2400, price_per_day:26500, price_per_km:65, location:LOC.MUM, image_url:"https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?w=800", description:"Top-of-line CVO trim — premium paint, biggest engine option, every touring comfort." }),
  ];

  // Mark a couple as maintenance/retired so the admin UI has variety.
  vehicles[7].status = "maintenance";       // Maruti Dzire
  vehicles[29].status = "maintenance";      // Ducati Panigale V4 area — reindexed below
  const panigale = vehicles.find((x) => x.model === "Panigale V4");
  if (panigale) panigale.status = "maintenance";
  const camaro = vehicles.find((x) => x.model === "Camaro SS");
  if (camaro) camaro.status = "maintenance";

  // ---------------------------------------------------------------------
  // BUY marketplace data (Strada = road: rent OR buy).
  // Ex-showroom prices (INR) are realistic Indian-market values per model.
  // ---------------------------------------------------------------------
  const EX = {
    "MH01-AA-1001":420000,"KA02-BB-1002":480000,"DL03-CC-1003":650000,"TS04-DD-1004":620000,
    "MH05-EE-1005":580000,"KA06-FF-1006":710000,"DL07-GG-1007":760000,"TN08-HH-1008":680000,
    "MH09-II-1009":760000,"KA10-JJ-1010":1300000,"DL11-KK-1011":1200000,"HR12-LL-1012":1250000,
    "MH13-MM-1013":1320000,"KA14-NN-1014":920000,"MH15-OO-1015":900000,"TS16-PP-1016":860000,
    "KA17-QQ-1017":880000,"DL18-RR-1018":940000,"MH19-SS-1019":1250000,"KA20-TT-1020":1280000,
    "HR21-UU-1021":1330000,"MH22-VV-1022":1260000,"PB23-WW-1023":1550000,"KA24-XX-1024":2050000,
    "MH25-YY-1025":2150000,"HR26-ZZ-1026":4250000,"TS27-AA-1027":1750000,"MH28-BB-1028":2250000,
    "KA29-CC-1029":6700000,"DL30-DD-1030":4800000,"MH31-EE-1031":6200000,"KA32-FF-1032":4800000,
    "DL33-GG-1033":6100000,"MH34-HH-1034":8200000,"KA35-II-1035":7600000,"MH36-JJ-1036":6900000,
    "DL37-KK-1037":10100000,"MH38-LL-1038":14200000,"KA39-MM-1039":10200000,"MH40-NN-1040":6000000,
    "KA41-OO-1041":1500000,"DL42-PP-1042":2000000,"GA43-QQ-1043":5000000,"MH44-RR-1044":9000000,
    "DL45-SS-1045":7200000,"MH46-TT-1046":20500000,"KA47-UU-1047":25000000,"MH48-VV-1048":35000000,
    "DL49-WW-1049":40000000,"MH50-XX-1050":70000000,"DL51-YY-1051":50000000,
    "MH01-B-2001":85000,"KA02-B-2002":92000,"DL03-B-2003":90000,"KA04-B-2004":150000,
    "KA05-B-2005":150000,"MH06-B-2006":140000,"DL07-B-2007":80000,"HR08-B-2008":120000,
    "KA09-B-2009":95000,"TN10-B-2010":130000,"TN11-B-2011":150000,"MH12-B-2012":200000,
    "KA13-B-2013":170000,"DL14-B-2014":220000,"UK15-B-2015":300000,"KA16-B-2016":320000,
    "MH17-B-2017":330000,"DL18-B-2018":250000,"TN19-B-2019":170000,"KA20-B-2020":190000,
    "MH21-B-2021":350000,"KA22-B-2022":750000,"DL23-B-2023":250000,"MH24-B-2024":280000,
    "KA25-B-2025":1100000,"MH26-B-2026":950000,"DL27-B-2027":350000,"KA28-B-2028":2200000,
    "MH29-B-2029":1200000,"MH30-B-2030":2700000,"DL31-B-2031":1600000,"KA32-B-2032":4000000,
    "MH33-B-2033":5500000,
  };

  const PALETTE = {
    White:"#f4f4f4", "Pearl White":"#eef0ee", Silver:"#c8cbd0", Grey:"#7d8288", "Steel Grey":"#5b6169",
    Black:"#1b1b1d", Red:"#c0392b", Blue:"#2c5aa0", "Sky Blue":"#4a90d9", Brown:"#6b4b3a",
    Green:"#3a6b4b", Orange:"#e07b2a", Yellow:"#e8c33a", Bronze:"#8a6d3b",
  };
  const colorSet = (names) => JSON.stringify(names.map((n) => ({ name: n, hex: PALETTE[n] || "#888" })));
  const colorsFor = (t) => t === "bike"
    ? colorSet(["Black", "Red", "Blue", "Silver"])
    : colorSet(["White", "Silver", "Grey", "Black", "Red", "Blue"]);

  const featuresFor = (cat, type, fuel) => {
    const c = cat.toLowerCase();
    let f;
    if (type === "bike") {
      if (c.includes("scooter")) f = ["LED headlamp", "Digital console", "USB charging", "Under-seat storage", "Combi-brake / ABS"];
      else if (c.includes("commuter")) f = ["Fuel injection", "LED DRL", "Digital-analog console", "Tubeless tyres", "Single-channel ABS"];
      else if (c.includes("cruiser") || c.includes("roadster") || c.includes("classic")) f = ["Torquey engine", "LED lighting", "Dual-channel ABS", "Tripper navigation", "Comfort touring seat"];
      else if (c.includes("adventure") || c.includes("tourer") || c.includes("touring")) f = ["Ride modes", "Long-travel suspension", "Windscreen", "Tubeless spoke wheels", "TFT display"];
      else f = ["USD front forks", "Dual-channel ABS", "Slipper clutch", "TFT display", "Ride modes", "Quickshifter"];
    } else if (fuel === "Electric") {
      f = ["Fast charging", "Regenerative braking", "Connected car app", "Single-pedal drive", "6 airbags", "Digital cockpit"];
    } else if (c.includes("hatch")) {
      f = ["Touchscreen infotainment", "Dual airbags", "ABS with EBD", "Rear parking camera", "Power windows", "Apple CarPlay & Android Auto"];
    } else if (c.includes("sedan")) {
      f = ["Sunroof", "Automatic climate control", "Cruise control", "6 airbags", "Ventilated seats", "Connected car tech"];
    } else if (c.includes("suv") || c.includes("mpv")) {
      f = ["Panoramic sunroof", "360° camera", "Hill-hold assist", "6 airbags", "Wireless CarPlay/Android Auto", "Ambient lighting"];
    } else if (c.includes("ultra") ) {
      f = ["Massage rear seats", "Rear entertainment", "Air suspension", "Nappa leather", "Starlight headliner", "Executive lounge seating"];
    } else {
      f = ["Launch control", "Sport exhaust", "Adaptive suspension", "Track mode", "Carbon-fibre trim", "Performance brakes"];
    }
    return JSON.stringify(f);
  };

  const fuelFor = (row) => {
    const c = row.category.toLowerCase();
    if (c.includes("electric") || row.model.includes("EV") || /S1 Pro|450X/.test(row.model)) return "Electric";
    if (/Hybrid|Hycross|Camry/.test(row.model)) return "Hybrid";
    return "Petrol";
  };

  // Enrich every vehicle: real poster + gallery, buy pricing, colours, features.
  for (const row of vehicles) {
    const media = MEDIA[row.plate];
    if (media?.poster) row.image_url = media.poster;
    else if (POSTERS[row.plate]) row.image_url = POSTERS[row.plate];
    const gallery = media?.gallery?.length ? media.gallery : (row.image_url ? [row.image_url] : []);
    row.gallery = JSON.stringify(gallery);

    const ex = EX[row.plate] || null;
    row.ex_showroom_price = ex;
    // On-road ≈ ex-showroom + RTO + insurance (~11% cars, ~13% two-wheelers).
    row.on_road_price = ex ? Math.round((ex * (row.type === "bike" ? 1.13 : 1.11)) / 1000) * 1000 : null;
    row.listing_mode = "both";
    row.fuel = fuelFor(row);
    row.colors = colorsFor(row.type);
    row.features = featuresFor(row.category, row.type, row.fuel);
  }

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertVehicle.run(row);
  });
  insertMany(vehicles);
  console.log(`Seeded ${vehicles.length} vehicles`);

  // -------------------------------------------------------------------
  // Showroom network across major Indian cities (for the buy flow's
  // "nearest showroom"). Generated per brand present in the fleet.
  // -------------------------------------------------------------------
  const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Goa"];
  const AREA = {
    Mumbai:"Andheri East", Delhi:"Moti Nagar", Bengaluru:"Whitefield", Hyderabad:"Banjara Hills",
    Chennai:"Guindy", Pune:"Baner", Kolkata:"Salt Lake", Ahmedabad:"S.G. Highway",
    Jaipur:"Tonk Road", Goa:"Porvorim",
  };
  const insertShowroom = db.prepare(
    "INSERT INTO showrooms (brand, type, city, name, address, phone) VALUES (@brand, @type, @city, @name, @address, @phone)"
  );
  const brandTypes = new Map();
  for (const row of vehicles) brandTypes.set(row.brand, row.type);
  let phoneSeed = 9800000000;
  const showrooms = [];
  for (const [brand, type] of brandTypes) {
    for (const city of CITIES) {
      showrooms.push({
        brand, type, city,
        name: `${brand} ${type === "bike" ? "Motorrad" : "Motors"} — ${city}`,
        address: `${AREA[city]}, ${city}`,
        phone: `+91 ${String(++phoneSeed).slice(0, 5)} ${String(phoneSeed).slice(5)}`,
      });
    }
  }
  const insertShowrooms = db.transaction((rows) => { for (const s of rows) insertShowroom.run(s); });
  insertShowrooms(showrooms);
  console.log(`Seeded ${showrooms.length} showrooms across ${CITIES.length} cities`);
}

console.log("Seed complete.");