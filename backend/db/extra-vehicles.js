// Additional CarDekho / BikeDekho models to expand the fleet nationwide.
// Each row is specified once as [brand, model, slug, category, exShowroomINR, opts?].
// Rental rates are derived from the ex-showroom price so we don't repeat them.
// Consumed by both db/build-media.mjs (posters/galleries) and db/seed.js.

const C = "https://www.cardekho.com/";
const B = "https://www.bikedekho.com/";

// [brand, model, slugPath, category, ex, {trans, seats, fuel}]
const CARS = [
  ["Maruti Suzuki","Wagon R","maruti/wagon-r","Hatchback",620000],
  ["Maruti Suzuki","Celerio","maruti/celerio","Hatchback",580000],
  ["Maruti Suzuki","Ignis","maruti/ignis","Hatchback",650000],
  ["Maruti Suzuki","S-Presso","maruti/s-presso","Hatchback",450000],
  ["Maruti Suzuki","Ciaz","maruti/ciaz","Sedan",950000],
  ["Maruti Suzuki","Ertiga","maruti/ertiga","MPV",1050000,{seats:7}],
  ["Maruti Suzuki","XL6","maruti/xl6","MPV",1250000,{seats:6}],
  ["Maruti Suzuki","Fronx","maruti/fronx","Compact SUV",850000],
  ["Maruti Suzuki","Grand Vitara","maruti/grand-vitara","Mid SUV",1150000],
  ["Maruti Suzuki","Jimny","maruti/jimny","Off-road SUV",1300000,{seats:4}],
  ["Hyundai","Aura","hyundai/aura","Compact Sedan",680000],
  ["Hyundai","Exter","hyundai/exter","Compact SUV",750000],
  ["Hyundai","Alcazar","hyundai/alcazar","Full SUV",1650000,{seats:7}],
  ["Hyundai","Tucson","hyundai/tucson","Premium SUV",3000000],
  ["Hyundai","Ioniq 5","hyundai/ioniq-5","Electric SUV",4600000,{fuel:"Electric"}],
  ["Tata","Punch","tata/punch","Compact SUV",650000],
  ["Tata","Altroz","tata/altroz","Premium Hatch",700000],
  ["Tata","Tigor","tata/tigor","Compact Sedan",640000],
  ["Tata","Harrier","tata/harrier","Full SUV",1650000],
  ["Tata","Safari","tata/safari","Full SUV",1750000,{seats:7}],
  ["Tata","Curvv","tata/curvv","Mid SUV",1300000],
  ["Mahindra","Thar","mahindra/thar","Off-road SUV",1500000,{seats:4}],
  ["Mahindra","Thar Roxx","mahindra/thar-roxx","Off-road SUV",1900000],
  ["Mahindra","XUV700","mahindra/xuv700","Full SUV",1600000,{seats:7}],
  ["Mahindra","Bolero","mahindra/bolero","Full SUV",1050000,{seats:7}],
  ["Mahindra","XUV400 EV","mahindra/xuv400-ev","Electric SUV",1600000,{fuel:"Electric"}],
  ["Kia","Carens","kia/carens","MPV",1200000,{seats:7}],
  ["Kia","Carnival","kia/carnival","MPV",3500000,{seats:7}],
  ["Kia","EV6","kia/ev6","Electric SUV",6100000,{fuel:"Electric"}],
  ["Toyota","Glanza","toyota/glanza","Premium Hatch",720000],
  ["Toyota","Urban Cruiser Hyryder","toyota/urban-cruiser-hyryder","Mid SUV",1200000,{fuel:"Hybrid"}],
  ["Toyota","Hilux","toyota/hilux","Off-road SUV",3500000,{seats:5}],
  ["Toyota","Vellfire","toyota/vellfire","Luxury MPV",13000000,{seats:7,fuel:"Hybrid"}],
  ["Honda","Elevate","honda/elevate","Mid SUV",1200000],
  ["Renault","Triber","renault/triber","MPV",680000,{seats:7}],
  ["Nissan","Magnite","nissan/magnite","Compact SUV",720000],
  ["Citroen","C3","citroen/c3","Hatchback",640000],
  ["Skoda","Kodiaq","skoda/kodiaq","Luxury SUV",4200000,{seats:7}],
  ["Skoda","Superb","skoda/superb","Luxury Sedan",5500000],
  ["Volkswagen","Tiguan","volkswagen/tiguan","Luxury SUV",3600000],
  ["MG","Astor","mg/astor","Mid SUV",1300000],
  ["MG","Gloster","mg/gloster","Luxury SUV",4200000,{seats:7}],
  ["MG","Comet EV","mg/comet-ev","Electric",750000,{fuel:"Electric",seats:4}],
  ["BYD","Atto 3","byd/atto-3","Electric SUV",3400000,{fuel:"Electric"}],
  ["Jeep","Meridian","jeep/meridian","Luxury SUV",3600000,{seats:7}],
  ["Mercedes-Benz","GLC","mercedes-benz/glc","Luxury SUV",7900000],
  ["Mercedes-Benz","S-Class","mercedes-benz/s-class","Ultra-Luxury",17500000],
  ["BMW","X1","bmw/x1","Luxury SUV",5000000],
  ["BMW","7 Series","bmw/7-series","Ultra-Luxury",18000000],
  ["Audi","Q7","audi/q7","Luxury SUV",8800000,{seats:7}],
  ["Audi","A6","audi/a6","Luxury Sedan",6600000],
  ["Porsche","Macan","porsche/macan","Luxury SUV",9000000],
  ["Porsche","Cayenne","porsche/cayenne","Luxury SUV",14000000],
  ["Lamborghini","Urus","lamborghini/urus","Supercar",42000000],
  ["Mini","Cooper","mini/cooper-3-door","Premium Hatch",4400000],
];

const BIKES = [
  ["Hero","HF Deluxe","hero/hf-deluxe","Commuter",65000],
  ["Hero","Xtreme 160R","hero/xtreme-160r","Naked Sport",130000],
  ["Hero","Xpulse 200","hero/xpulse-200","Adventure",150000],
  ["Hero","Karizma XMR","hero/karizma-xmr","Sport",180000],
  ["Hero","Destini 125","hero/destini-125","Scooter",80000],
  ["Honda","Shine","honda/cb-shine","Commuter",85000],
  ["Honda","Unicorn","honda/cb-unicorn","Commuter",115000],
  ["Honda","Hornet 2.0","honda/hornet-2-0","Naked Sport",145000],
  ["Honda","Dio","honda/dio","Scooter",78000],
  ["Honda","CB350 RS","honda/cb350-rs","Cruiser",220000],
  ["TVS","Raider 125","tvs/raider-125","Commuter Sport",95000],
  ["TVS","Ntorq 125","tvs/ntorq-125","Scooter",90000],
  ["TVS","Apache RTR 160","tvs/apache-rtr-160-4v","Naked Sport",125000],
  ["TVS","Ronin","tvs/ronin","Roadster",160000],
  ["TVS","iQube","tvs/iqube-electric","Electric Scooter",140000,{fuel:"Electric"}],
  ["TVS","Apache RR 310","tvs/apache-rr-310","Sport",280000],
  ["Bajaj","Platina","bajaj/platina","Commuter",72000],
  ["Bajaj","Pulsar N160","bajaj/pulsar-n160","Naked Sport",135000],
  ["Bajaj","Pulsar NS200","bajaj/pulsar-ns200","Naked Sport",160000],
  ["Bajaj","Avenger Cruise 220","bajaj/avenger-cruise-220","Cruiser",150000],
  ["Bajaj","Chetak","bajaj/chetak","Electric Scooter",130000,{fuel:"Electric"}],
  ["Yamaha","Aerox 155","yamaha/aerox-155","Scooter",150000],
  ["Yamaha","Fascino 125","yamaha/fascino-125","Scooter",90000],
  ["Yamaha","Ray ZR 125","yamaha/ray-zr-125","Scooter",95000],
  ["Suzuki","Gixxer","suzuki/gixxer","Naked Sport",140000],
  ["Suzuki","Gixxer SF","suzuki/gixxer-sf","Sport",150000],
  ["Suzuki","Burgman Street","suzuki/burgman-street","Scooter",110000],
  ["Suzuki","V-Strom SX 250","suzuki/v-strom-250-sx","Adventure",220000],
  ["Royal Enfield","Bullet 350","royal-enfield/bullet-350","Cruiser",175000],
  ["Royal Enfield","Interceptor 650","royal-enfield/interceptor-650","Roadster",320000],
  ["Royal Enfield","Continental GT 650","royal-enfield/continental-gt-650","Sport",340000],
  ["Royal Enfield","Super Meteor 650","royal-enfield/super-meteor-650","Cruiser",380000],
  ["Royal Enfield","Scram 411","royal-enfield/scram-411","Adventure",220000],
  ["Royal Enfield","Guerrilla 450","royal-enfield/guerrilla-450","Roadster",250000],
  ["KTM","200 Duke","ktm/200-duke","Naked Sport",200000],
  ["KTM","250 Duke","ktm/250-duke","Naked Sport",250000],
  ["KTM","390 Adventure","ktm/390-adventure","Adventure Touring",370000],
  ["Jawa","42","jawa/42","Modern Classic",200000],
  ["Yezdi","Roadster","yezdi/roadster","Modern Classic",210000],
  ["Kawasaki","Versys 650","kawasaki/versys-650","Adventure Touring",800000],
  ["Triumph","Scrambler 400 X","triumph/scrambler-400-x","Modern Classic",270000],
  ["Triumph","Tiger 900","triumph/tiger-900","Adventure Touring",2100000],
  ["BMW","G 310 R","bmw/g-310-r","Naked Sport",290000],
  ["Harley-Davidson","Nightster","harley-davidson/nightster","Cruiser",1500000],
  ["Harley-Davidson","Fat Boy","harley-davidson/fat-boy","Cruiser",2300000],
  ["Ather","Rizta","ather/rizta","Electric Scooter",130000,{fuel:"Electric"}],
  ["Ola","S1 X","ola-electric/s1-x","Electric Scooter",100000,{fuel:"Electric"}],
];

const DEPOTS = [
  "Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad",
  "Jaipur","Goa","Kochi","Chandigarh","Lucknow","Surat","Indore","Nagpur","Coimbatore",
];

const round = (n, step) => Math.round(n / step) * step;

function build(rows, type, prefix, baseUrl) {
  return rows.map(([brand, model, slug, category, ex, opts = {}], i) => {
    const day = type === "car" ? round(ex * 0.0025, 50) : round(ex * 0.005, 10);
    return {
      type, brand, model, category,
      plate: `${prefix}-${String(i + 1).padStart(3, "0")}`,
      year: 2024,
      transmission: type === "bike" ? null : (opts.trans || "automatic"),
      seats: type === "bike" ? 2 : (opts.seats ?? 5),
      fuel: opts.fuel || (type === "bike" ? "Petrol" : "Petrol"),
      price_per_day: day,
      price_per_hour: type === "car" ? round(day / 8, 10) : Math.max(30, Math.round(day / 8)),
      price_per_km: type === "car" ? Math.max(5, Math.round(day / 120)) : Math.max(2, Math.round(day / 250)),
      ex_showroom_price: ex,
      location: `${DEPOTS[i % DEPOTS.length]} Depot`,
      description: `${brand} ${model} — available to rent by the hour, day or kilometre, or to buy with on-road pricing and your nearest showroom.`,
      url: baseUrl + slug,
      status: "available",
    };
  });
}

export const EXTRA_VEHICLES = [
  ...build(CARS, "car", "EXC", C),
  ...build(BIKES, "bike", "EXB", B),
];
