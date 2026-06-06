export default function MainHeader() {
  return (
    <header id="main-header">
      <div className="logo">BUILDMYRIDE</div>
      <div className="nav-ctrl">
        <button className="cbtn" id="btn-dim" type="button">DIM / ILLUMINATE</button>
        <button className="cbtn" id="btn-mute" type="button">MUTE SOUND</button>
      </div>
    </header>
  );
}
