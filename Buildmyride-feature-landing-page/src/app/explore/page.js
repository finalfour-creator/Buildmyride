 "use client";
 
 import { useState } from "react";
 
 const CARS = [
   { id: 1, brand: "Suzuki", model: "Alto VXL AGS", year: 2024, price: "PKR 30.5 Lac", priceNum: 3050000, engine: "658cc", power: "67 HP", fuel: "22 km/l", type: "Hatchback", tag: "BEST SELLER 🏆", colors: ["#ffffff", "#C0C0C0", "#1a1a1a", "#4a4a60"], features: ["Dual Airbags", "ABS Brakes", "Power Windows", "AGS Auto"], img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80&auto=format&fit=crop" },
   { id: 2, brand: "Suzuki", model: "Cultus VXL AGS", year: 2024, price: "PKR 38.9 Lac", priceNum: 3890000, engine: "998cc", power: "67 HP", fuel: "19 km/l", type: "Hatchback", tag: "CITY CHAMP ⚡", colors: ["#ffffff", "#1a3a5c", "#C0392B", "#C0C0C0"], features: ["Push Start", "Rear Camera", "Alloy Wheels", "LCD Screen"], img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&auto=format&fit=crop" },
   { id: 3, brand: "Toyota", model: "Yaris ATIV CVT", year: 2024, price: "PKR 46.9 Lac", priceNum: 4690000, engine: "1300cc", power: "98 HP", fuel: "17 km/l", type: "Sedan", tag: "VALUE PICK ⭐", colors: ["#C0C0C0", "#1a1a1a", "#C0392B", "#ffffff"], features: ["CVT Auto", "7\" Screen", "Rear Sensors", "Keyless Entry"], img: "https://images.unsplash.com/photo-1549399542-7e8ee8c312e8?w=600&q=80&auto=format&fit=crop" },
   { id: 4, brand: "Honda", model: "City 1.5L Aspire CVT", year: 2024, price: "PKR 57.9 Lac", priceNum: 5790000, engine: "1497cc", power: "118 HP", fuel: "16 km/l", type: "Sedan", tag: "SPORTY PICK 🔥", colors: ["#ffffff", "#C0C0C0", "#1a1a1a", "#cc0000"], features: ["Lane Watch", "Honda Sensing", "8\" Display", "Wireless Charge"], img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80&auto=format&fit=crop" },
   { id: 5, brand: "Toyota", model: "Corolla Altis X 1.6 CVT", year: 2024, price: "PKR 68.5 Lac", priceNum: 6850000, engine: "1598cc", power: "122 HP", fuel: "15 km/l", type: "Sedan", tag: "LEGEND 👑", colors: ["#ffffff", "#1a1a1a", "#C0C0C0", "#1a3a5c"], features: ["7 Airbags", "Adaptive Cruise", "TSS Safety", "Sunroof"], img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80&auto=format&fit=crop" },
   { id: 6, brand: "KIA", model: "Sportage Alpha AWD", year: 2024, price: "PKR 79.9 Lac", priceNum: 7990000, engine: "1591cc", power: "175 HP", fuel: "13 km/l", type: "SUV", tag: "TOP SUV 🚀", colors: ["#1a1a1a", "#1a3a5c", "#C0C0C0", "#ffffff"], features: ["AWD", "Panoramic Roof", "BOSE Audio", "360° Camera"], img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80&auto=format&fit=crop" },
   { id: 7, brand: "Hyundai", model: "Tucson AWD Ultimate", year: 2024, price: "PKR 82.9 Lac", priceNum: 8290000, engine: "1999cc", power: "156 HP", fuel: "12 km/l", type: "SUV", tag: "LUXURY SUV 💎", colors: ["#1a1a1a", "#ffffff", "#2c3e50", "#8e44ad"], features: ["ADAS", "Smart Cruise", "Ventilated Seats", "HUD"], img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80&auto=format&fit=crop" },
   { id: 8, brand: "Changan", model: "Oshan X7 Plus", year: 2024, price: "PKR 69.9 Lac", priceNum: 6990000, engine: "1999cc", power: "188 HP", fuel: "13 km/l", type: "SUV", tag: "NEW ARRIVAL 🆕", colors: ["#ffffff", "#1a1a1a", "#8B0000", "#C0C0C0"], features: ["Twin Turbo", "8-AT", "Nappa Leather", "14.6\" Screen"], img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80&auto=format&fit=crop" },
 ];
 
 const FILTERS = ["All", "Hatchback", "Sedan", "SUV"];
 const SORTS = ["Price: Low to High", "Price: High to Low", "Most Popular"];
 
 function ColorDot({ color, active, onClick }) {
   return (
     <button onClick={onClick} style={{ width: 16, height: 16, borderRadius: "50%", background: color, border: active ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "transform 0.2s", transform: active ? "scale(1.3)" : "scale(1)", padding: 0, flexShrink: 0 }} />
   );
 }
 
 function CarCard({ car }) {
   const [hov, setHov] = useState(false);
   const [col, setCol] = useState(0);
   const [wish, setWish] = useState(false);
 
   return (
     <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#0f0f0f", border: `1px solid ${hov ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)"}`, borderRadius: 18, overflow: "hidden", transition: "all 0.32s", transform: hov ? "translateY(-7px)" : "none", boxShadow: hov ? "0 28px 64px rgba(0,0,0,0.65)" : "0 4px 18px rgba(0,0,0,0.3)", cursor: "pointer" }}>
       <div style={{ position: "relative", height: 192, overflow: "hidden", background: "#111" }}>
         <img src={car.img} alt={car.model} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", transform: hov ? "scale(1.07)" : "scale(1)" }} />
         <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.72) 0%,transparent 55%)" }} />
         <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, backdropFilter: "blur(10px)" }}>
           <span style={{ fontSize: 9.5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase" }}>{car.tag}</span>
         </div>
         <button onClick={e => { e.stopPropagation(); setWish(!wish); }} style={{ position: "absolute", top: 10, right: 12, width: 32, height: 32, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, backdropFilter: "blur(8px)", transition: "all 0.2s", transform: wish ? "scale(1.15)" : "none" }}>{wish ? "❤️" : "🤍"}</button>
         <div style={{ position: "absolute", top: 12, right: 50, padding: "4px 10px", background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, backdropFilter: "blur(8px)" }}>
           <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>{car.type}</span>
         </div>
       </div>
       <div style={{ padding: "18px 20px 20px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
           <div>
             <div style={{ fontSize: 10.5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 3 }}>{car.brand} · {car.year}</div>
             <div style={{ fontSize: 18, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{car.model}</div>
           </div>
           <div style={{ textAlign: "right", flexShrink: 0 }}>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "'Barlow',sans-serif", marginBottom: 1 }}>Starting at</div>
             <div style={{ fontSize: 14, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, color: "#fff" }}>{car.price}</div>
           </div>
         </div>
         <div style={{ display: "flex", margin: "12px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 0" }}>
           {[{ l: "Engine", v: car.engine }, { l: "Power", v: car.power }, { l: "Fuel", v: car.fuel }].map((s, i) => (
             <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
               <div style={{ fontSize: 13, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, color: "#fff" }}>{s.v}</div>
               <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", fontFamily: "'Barlow',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{s.l}</div>
             </div>
           ))}
         </div>
         <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
           {car.features.map(f => (
             <span key={f} style={{ fontSize: 9.5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "rgba(255,255,255,0.45)" }}>{f}</span>
           ))}
         </div>
         <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
           <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "'Barlow',sans-serif", marginRight: 2 }}>Colours:</span>
           {car.colors.map((c, i) => <ColorDot key={i} color={c} active={col === i} onClick={e => { e.stopPropagation(); setCol(i); }} />)}
         </div>
         <button style={{ width: "100%", padding: "12px", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", background: hov ? "#fff" : "rgba(255,255,255,0.07)", color: hov ? "#000" : "rgba(255,255,255,0.65)", border: `1.5px solid ${hov ? "#fff" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.25s" }}>
           Configure &amp; Build →
         </button>
       </div>
     </div>
   );
 }
 
 export default function ExplorePage() {
   const [filter, setFilter] = useState("All");
   const [sort, setSort] = useState(SORTS[0]);
   const [search, setSearch] = useState("");
 
   let list = CARS.filter(c => (filter === "All" || c.type === filter) && (`${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase())));
   if (sort === SORTS[0]) list = [...list].sort((a, b) => a.priceNum - b.priceNum);
   else if (sort === SORTS[1]) list = [...list].sort((a, b) => b.priceNum - a.priceNum);
 
   return (
     <>
       <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
         *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
         html,body{background:#080808;}
         ::placeholder{color:rgba(255,255,255,0.2);}
         select option{background:#111;}
       `}</style>
 
       <div style={{ minHeight: "100vh", background: "#080808" }}>
         <div style={{ paddingTop: 105, paddingBottom: 56, padding: "105px 68px 56px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a", position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
           <div style={{ maxWidth: 1280, margin: "0 auto" }}>
             <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
               <div style={{ width: 24, height: 1.5, background: "rgba(255,255,255,0.45)" }} />
               <span style={{ fontSize: 10.5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>BuildMyRide · Pakistan Cars</span>
             </div>
             <h1 style={{ fontSize: "clamp(40px,5vw,68px)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, lineHeight: 0.94, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#fff", marginBottom: 16 }}>
               Explore All<br />
               <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)", color: "transparent" }}>Car Models</span>
             </h1>
             <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", maxWidth: 500, lineHeight: 1.75, fontFamily: "'Barlow',sans-serif" }}>
               Browse Pakistan&apos;s top locally-assembled and imported cars. Configure colours, compare specs and find your perfect ride — all in one place.
             </p>
             <div style={{ display: "flex", gap: 36, marginTop: 30 }}>
               {[{ v: "8+", l: "Car Brands" }, { v: "200+", l: "Configurations" }, { v: "15+", l: "Dealerships" }, { v: "Free", l: "No Account Needed" }].map(s => (
                 <div key={s.l}>
                   <div style={{ fontSize: 22, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, color: "#fff" }}>{s.v}</div>
                   <div style={{ fontSize: 10.5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)" }}>{s.l}</div>
                 </div>
               ))}
             </div>
           </div>
         </div>
 
         <div style={{ padding: "22px 68px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.012)", backdropFilter: "blur(12px)", position: "sticky", top: 70, zIndex: 50 }}>
           <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
             <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
               <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.28)", fontSize: 15 }}>🔍</span>
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by brand or model…" style={{ width: "100%", padding: "10px 12px 10px 38px", fontSize: 13, fontFamily: "'Barlow',sans-serif", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", outline: "none", transition: "border-color 0.2s" }}
                 onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.35)"}
                 onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
               />
             </div>
             <div style={{ display: "flex", gap: 7 }}>
               {FILTERS.map(f => (
                 <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: filter === f ? "#fff" : "rgba(255,255,255,0.05)", color: filter === f ? "#000" : "rgba(255,255,255,0.48)", border: filter === f ? "1px solid #fff" : "1px solid rgba(255,255,255,0.09)", borderRadius: 8, cursor: "pointer", transition: "all 0.22s", boxShadow: filter === f ? "0 0 14px rgba(255,255,255,0.18)" : "none" }}>{f}</button>
               ))}
             </div>
             <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "8px 14px", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.1em", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.55)", cursor: "pointer", outline: "none" }}>
               {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Barlow',sans-serif", flexShrink: 0 }}>{list.length} results</span>
           </div>
         </div>
 
         <div style={{ maxWidth: 1280, margin: "0 auto", padding: "46px 68px 80px" }}>
           {list.length === 0
             ? <div style={{ textAlign: "center", paddingTop: 80, color: "rgba(255,255,255,0.22)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, letterSpacing: "0.1em" }}>No cars match your search</div>
             : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 26 }}>
                 {list.map(c => <CarCard key={c.id} car={c} />)}
               </div>
           }
         </div>
       </div>
     </>
   );
 }
