export default function SwipeIndicators() {
  return (
    <>
      <div className="swipe-ind" id="swipe-ext">
        <div className="dpill" />
        <div className="sarrow">{"→"}</div>
        <div>INTERIOR</div>
      </div>
      <div className="swipe-ind" id="swipe-int">
        <div className="dpill" />
        <div className="sarrow">{"←"}</div>
        <div>EXTERIOR</div>
      </div>
    </>
  );
}
