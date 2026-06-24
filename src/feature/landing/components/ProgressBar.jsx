export default function ProgressBar({ activeIndex, total }) {
  const pct = total > 1 ? (activeIndex / (total - 1)) * 100 : 0;

  return (
    <>
      <div className="landing-progress-bar" style={{ width: `${pct}%` }} />
      <div className="landing-phase-dots">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`landing-phase-dot${
              i === activeIndex ? " active" : i < activeIndex ? " done" : ""
            }`}
          />
        ))}
      </div>
    </>
  );
}
