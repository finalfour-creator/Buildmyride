import Image from "next/image";

const cars = [
  {
    img: "/car-image-1.png",
    name: "Urban Pulse",
    year: "2026",
    body: "Sedan",
    hp: "320 BHP",
  },
  {
    img: "/car-image-2.png",
    name: "Aero Knight",
    year: "2025",
    body: "Coupe",
    hp: "285 BHP",
  },
  {
    img: "/car-image-3.png",
    name: "Trail Nova",
    year: "2024",
    body: "SUV",
    hp: "300 BHP",
  },
];

export default function CarGallerySection() {
  return (
    <section className="ssec ssec-cars" id="sec-cars">
      <div className="scont">
        <div className="stag">// Feature Cars — GALLERY</div>
        <h2 className="stitle">
          Pick Your
          <br /> Ride Identity
        </h2>
        <p className="ssub">
          Swipe through iconic silhouettes. Each build is fully interactive in 3D.
        </p>

        <div className="car-grid">
          {cars.map((c) => (
            <article key={c.img} className="car-card">
              <div className="car-img">
                <Image
                  src={c.img}
                  alt={c.name}
                  width={900}
                  height={600}
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 420px"
                />
              </div>
              <div className="car-meta">
                <div className="car-name">{c.name}</div>
                <div className="car-row">
                  <span className="car-chip">{c.body}</span>
                  <span className="car-chip">{c.year}</span>
                </div>
                <div className="car-hp">{c.hp}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

