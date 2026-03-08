 "use client";
 
 export default function ARPage() {
   return (
     <>
       <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800;900&family=Barlow:wght@400;600&display=swap');
         *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
         html,body{background:#080808;}
       `}</style>
       <div style={{ minHeight: "100vh", background: "#080808" }}>
         <div style={{ padding: "110px 68px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
           <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
             <div style={{ width: 24, height: 1.5, background: "rgba(255,255,255,0.45)" }} />
             <span style={{ fontSize: 10.5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
               BuildMyRide · AR Preview
             </span>
           </div>
           <h1 style={{ fontSize: "clamp(40px,5vw,64px)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, lineHeight: 0.94, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#fff", marginBottom: 8 }}>
             AR Preview
           </h1>
           <p style={{ fontSize: 14, color: "rgba(255,255,255,0.44)", fontFamily: "'Barlow',sans-serif" }}>
             Coming soon. Place your configured car in your environment using your device camera.
           </p>
         </div>
 
         <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 68px 80px" }}>
           <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, background: "#0f0f0f", height: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.32)", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>
             AR View Placeholder
           </div>
         </div>
       </div>
     </>
   );
 }
