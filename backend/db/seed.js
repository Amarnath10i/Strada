import bcrypt from "bcryptjs";
import db from "./index.js";

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
      (type, brand, model, year, plate, category, transmission, seats, price_per_day, location, image_url, description, status)
    VALUES (@type, @brand, @model, @year, @plate, @category, @transmission, @seats, @price_per_day, @location, @image_url, @description, @status)
  `);

  // Prices are ballparked against real-world daily rental market rates
  // (major US rental brands for cars, EagleRider/Riders Share-style peer
  // rental pricing for motorcycles) so the fleet reads low-cost to luxury.
  const vehicles = [
    // ---------------- CARS: economy -> luxury/exotic ----------------
    {
      type: "car", brand: "Kia", model: "Rio", year: 2022, plate: "STR-1001",
      category: "Economy", transmission: "automatic", seats: 5, price_per_day: 27,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800",
      description: "Our cheapest set of wheels on the lot. Light, easy to park, and sips fuel — built for quick errands and city commuting.",
      status: "available"
    },
    {
      type: "car", brand: "Toyota", model: "Corolla", year: 2022, plate: "STR-1002",
      category: "Economy", transmission: "automatic", seats: 5, price_per_day: 34,
      location: "Airport Depot", image_url: "https://images.unsplash.com/photo-1623869675184-6d0d1c93f8f9?w=800",
      description: "The rental-lot classic. Bulletproof reliability, great mileage, and enough trunk space for a week's luggage.",
      status: "available"
    },
    {
      type: "car", brand: "Hyundai", model: "Elantra", year: 2023, plate: "STR-1003",
      category: "Compact", transmission: "automatic", seats: 5, price_per_day: 38,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1629897048514-3dd7414efd11?w=800",
      description: "A roomier compact sedan with a modern cabin and driver-assist tech, priced barely above economy class.",
      status: "available"
    },
    {
      type: "car", brand: "Honda", model: "Civic", year: 2023, plate: "STR-1004",
      category: "Compact", transmission: "automatic", seats: 5, price_per_day: 42,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
      description: "Sharper handling than most compacts, with an upscale-feeling interior for the price bracket.",
      status: "available"
    },
    {
      type: "car", brand: "Toyota", model: "Camry", year: 2023, plate: "STR-1042",
      category: "Sedan", transmission: "automatic", seats: 5, price_per_day: 48,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      description: "Reliable mid-size sedan with great fuel economy and a smooth ride. Ideal for city trips and highway runs alike.",
      status: "available"
    },
    {
      type: "car", brand: "Jeep", model: "Wrangler", year: 2022, plate: "STR-1005",
      category: "SUV", transmission: "manual", seats: 4, price_per_day: 72,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      description: "Removable top, 4x4 low range, and real off-road chops for trailhead weekends.",
      status: "available"
    },
    {
      type: "car", brand: "Honda", model: "CR-V", year: 2022, plate: "STR-2077",
      category: "SUV", transmission: "automatic", seats: 5, price_per_day: 65,
      location: "Airport Depot", image_url: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800",
      description: "Spacious SUV with all-wheel drive, perfect for families or gear-heavy trips.",
      status: "available"
    },
    {
      type: "car", brand: "Ford", model: "Transit", year: 2021, plate: "STR-5528",
      category: "Van", transmission: "manual", seats: 8, price_per_day: 78,
      location: "Airport Depot", image_url: "https://images.unsplash.com/photo-1600661653561-629509216228?w=800",
      description: "Full-size passenger van for group trips, moves, and team travel.",
      status: "maintenance"
    },
    {
      type: "car", brand: "Mazda", model: "MX-5 Miata", year: 2023, plate: "STR-3391",
      category: "Convertible", transmission: "manual", seats: 2, price_per_day: 89,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
      description: "A featherweight roadster built for weekend joyrides along the coast.",
      status: "available"
    },
    {
      type: "car", brand: "BMW", model: "3 Series", year: 2023, plate: "STR-6602",
      category: "Luxury Sedan", transmission: "automatic", seats: 5, price_per_day: 82,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800",
      description: "German engineering with a firm, sporty ride and a premium cabin.",
      status: "available"
    },
    {
      type: "car", brand: "Tesla", model: "Model 3", year: 2024, plate: "STR-4415",
      category: "Electric", transmission: "automatic", seats: 5, price_per_day: 95,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
      description: "All-electric sedan with Autopilot. Comes with a full charge and a supercharger map.",
      status: "available"
    },
    {
      type: "car", brand: "Mercedes-Benz", model: "E-Class", year: 2023, plate: "STR-1006",
      category: "Luxury Sedan", transmission: "automatic", seats: 5, price_per_day: 115,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1617469767053-8f35aaa39fd8?w=800",
      description: "Business-class comfort — air suspension, a hushed cabin, and driver-assist features throughout.",
      status: "available"
    },
    {
      type: "car", brand: "Land Rover", model: "Range Rover Sport", year: 2023, plate: "STR-1007",
      category: "Luxury SUV", transmission: "automatic", seats: 5, price_per_day: 149,
      location: "Airport Depot", image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
      description: "Commanding road presence with air suspension and adjustable terrain modes for any surface.",
      status: "available"
    },
    {
      type: "car", brand: "Porsche", model: "911 Carrera", year: 2023, plate: "STR-1008",
      category: "Sports Car", transmission: "automatic", seats: 2, price_per_day: 295,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      description: "The benchmark sports coupe — flat-six howl, razor-sharp steering, and everyday usability.",
      status: "available"
    },
    {
      type: "car", brand: "Lamborghini", model: "Huracán", year: 2022, plate: "STR-1009",
      category: "Supercar", transmission: "automatic", seats: 2, price_per_day: 899,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800",
      description: "A naturally-aspirated V10 supercar for the days you want every head on the block to turn.",
      status: "available"
    },
    {
      type: "car", brand: "Rolls-Royce", model: "Ghost", year: 2023, plate: "STR-1010",
      category: "Ultra-Luxury", transmission: "automatic", seats: 5, price_per_day: 1250,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800",
      description: "The top of our lot — a hand-built flagship sedan for weddings, galas, and the odd very good day.",
      status: "available"
    },

    // ---------------- BIKES: scooters -> premium touring/superbike ----------------
    {
      type: "bike", brand: "Honda", model: "Activa", year: 2023, plate: "STR-B202",
      category: "Scooter", transmission: null, seats: 2, price_per_day: 15,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
      description: "Nimble automatic scooter, easy to park and cheap to run around town.",
      status: "available"
    },
    {
      type: "bike", brand: "Vespa", model: "Primavera", year: 2023, plate: "STR-B606",
      category: "Scooter", transmission: null, seats: 2, price_per_day: 22,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1598983117300-16f966c9e0a2?w=800",
      description: "Classic Italian scooter styling with modern reliability underneath.",
      status: "available"
    },
    {
      type: "bike", brand: "Trek", model: "Marlin 7 (eBike)", year: 2023, plate: "STR-B404",
      category: "Electric Bicycle", transmission: null, seats: 1, price_per_day: 25,
      location: "Airport Depot", image_url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800",
      description: "Pedal-assist mountain bike, good for trails and long commutes without the sweat.",
      status: "available"
    },
    {
      type: "bike", brand: "Royal Enfield", model: "Classic 350", year: 2023, plate: "STR-B101",
      category: "Cruiser", transmission: null, seats: 2, price_per_day: 32,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
      description: "Thumping single-cylinder cruiser with timeless styling and a relaxed seating position.",
      status: "available"
    },
    {
      type: "bike", brand: "Honda", model: "Rebel 500", year: 2022, plate: "STR-B107",
      category: "Cruiser", transmission: null, seats: 2, price_per_day: 45,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1609778269131-b03f9f4a19f0?w=800",
      description: "Low seat height and light clutch make this the easiest cruiser on the lot to learn on.",
      status: "available"
    },
    {
      type: "bike", brand: "Kawasaki", model: "Ninja 300", year: 2022, plate: "STR-B303",
      category: "Sportbike", transmission: null, seats: 2, price_per_day: 48,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800",
      description: "Lightweight sportbike with sharp handling, great for canyon roads.",
      status: "available"
    },
    {
      type: "bike", brand: "Yamaha", model: "MT-07", year: 2023, plate: "STR-B108",
      category: "Naked Standard", transmission: null, seats: 2, price_per_day: 58,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800",
      description: "Torquey parallel-twin naked bike — a favorite for punchy in-town riding and weekend backroads.",
      status: "available"
    },
    {
      type: "bike", brand: "Harley-Davidson", model: "Iron 883", year: 2022, plate: "STR-B505",
      category: "Cruiser", transmission: null, seats: 2, price_per_day: 95,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800",
      description: "Blacked-out muscle cruiser with a deep V-twin rumble.",
      status: "available"
    },
    {
      type: "bike", brand: "BMW", model: "R1250GS Adventure", year: 2023, plate: "STR-B109",
      category: "Adventure Touring", transmission: null, seats: 2, price_per_day: 175,
      location: "Airport Depot", image_url: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800",
      description: "The go-anywhere flagship adventure tourer — huge tank range and a fully loaded electronics suite.",
      status: "available"
    },
    {
      type: "bike", brand: "Harley-Davidson", model: "Road Glide", year: 2023, plate: "STR-B110",
      category: "Touring", transmission: null, seats: 2, price_per_day: 195,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1571646750134-a5b0e6d5eb85?w=800",
      description: "Frame-mounted fairing, a thumping Milwaukee-Eight V-twin, and hard bags for the long haul.",
      status: "available"
    },
    {
      type: "bike", brand: "Ducati", model: "Panigale V4", year: 2022, plate: "STR-B111",
      category: "Superbike", transmission: null, seats: 2, price_per_day: 265,
      location: "Downtown Depot", image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
      description: "MotoGP-derived V4 superbike — the fastest, most exclusive machine in the fleet.",
      status: "maintenance"
    },
    {
      type: "bike", brand: "Harley-Davidson", model: "CVO Road Glide", year: 2023, plate: "STR-B112",
      category: "Touring", transmission: null, seats: 2, price_per_day: 299,
      location: "Uptown Depot", image_url: "https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?w=800",
      description: "The top-of-line CVO trim — premium paint, the biggest engine option, and every touring comfort feature.",
      status: "available"
    }
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertVehicle.run(row);
  });
  insertMany(vehicles);
  console.log(`Seeded ${vehicles.length} vehicles`);
}

console.log("Seed complete.");
