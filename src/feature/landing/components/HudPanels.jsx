export default function HudPanels() {
  return (
    <>
      <div className="hud-panel" id="hud-left">
        <div className="hud-lbl">// GARAGE STATE</div>
        <div className="hud-row"><span>LEVEL 01</span><span className="hud-val" id="lv1">ACTIVE</span></div>
        <div className="hpbar"><div className="hpfill" id="pb1" style={{ width: "100%" }} /></div>
        <div className="hud-row" style={{ marginTop: 8 }}>
          <span>LEVEL 02</span>
          <span className="hud-val" id="lv2" style={{ color: "rgba(232,234,246,.28)" }}>LOCKED</span>
        </div>
        <div className="hpbar"><div className="hpfill" id="pb2" style={{ width: "0%" }} /></div>
        <div className="hud-row" style={{ marginTop: 8 }}>
          <span>LEVEL 03</span>
          <span className="hud-val" id="lv3" style={{ color: "rgba(232,234,246,.28)" }}>LOCKED</span>
        </div>
        <div className="hpbar"><div className="hpfill" id="pb3" style={{ width: "0%" }} /></div>
      </div>

      <div className="hud-panel" id="hud-right">
        <div className="hud-lbl">// TELEMETRY SPECS</div>
        <div className="srow">
          <div className="slbl">AERO LOAD</div>
          <div className="sbar"><div className="sfill" id="sf-aero" style={{ width: "65%" }} /></div>
        </div>
        <div className="srow">
          <div className="slbl">ENGINE TEMP</div>
          <div className="sbar"><div className="sfill" id="sf-temp" style={{ width: "42%" }} /></div>
        </div>
        <div className="srow">
          <div className="slbl">POWER OUTPUT</div>
          <div className="sbar"><div className="sfill" id="sf-power" style={{ width: "80%" }} /></div>
        </div>
      </div>
    </>
  );
}
