export const lerp = (a, b, t) => a + (b - a) * t;

export const lerpArr = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

export const lerpColor = (target, dest, t) => {
  target.r = lerp(target.r, dest.r, t);
  target.g = lerp(target.g, dest.g, t);
  target.b = lerp(target.b, dest.b, t);
};
