export default function LoadingOverlay() {
  return (
    <div id="sound-overlay">
      <div className="ls-grid" />
      <div className="ls-content">
        <svg className="ls-icon" viewBox="0 0 60 80" fill="none">
          <defs>
            <linearGradient id="boltG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#ff6600" />
            </linearGradient>
          </defs>
          <polygon
            points="34,0 10,44 30,44 26,80 50,36 30,36"
            fill="url(#boltG)"
            style={{ filter: "drop-shadow(0 0 10px #ff8800)" }}
          />
        </svg>
        <div className="ls-title">System Initiating</div>
        <p className="ls-sub">
          Welcome to the BuildMyRide showroom configuration terminal. Prepare your
          audio and display for an immersive 3D experience with real-time sound
          synthesis.
        </p>
        <button className="load-btn" id="btn-enter" type="button">
          LOAD EXPERIENCES
        </button>
      </div>
    </div>
  );
}
