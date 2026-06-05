export const PART_KEYS = ["engine", "body", "wheels", "exhaust"];

export const PART_LABELS = {
  engine: "Engine",
  body: "Body Kit",
  wheels: "Wheels",
  exhaust: "Exhaust",
};

export const PART_ICONS = {
  engine:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="8" width="14" height="10" rx="1"/><path d="M3 12h2M19 12h2M9 8V5h6v3"/></svg>',
  body:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 16l2-5h14l2 5M5 16h14M7 16v2M17 16v2"/></svg>',
  wheels:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/></svg>',
  exhaust:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="18" cy="14" r="3"/><path d="M3 11h12M3 14h12"/></svg>',
};

export const PARTS_DATA = {
  engine: [
    {
      id: "atmospheric",
      name: "Atmospheric V8",
      sub: "5.2L naturally aspirated",
      stat: "640 HP",
      modelPath: null,
    },
    {
      id: "twin-turbo",
      name: "Twin-Turbo V6",
      sub: "3.8L forced induction",
      stat: "720 HP",
      modelPath: null,
    },
    {
      id: "hybrid",
      name: "Hybrid Stack",
      sub: "Electrified V8 system",
      stat: "880 HP",
      modelPath: null,
    },
  ],
  body: [
    {
      id: "stealth",
      name: "Stealth Kit",
      sub: "Subdued aero panels",
      stat: "+8% downforce",
      modelPath: null,
    },
    {
      id: "track",
      name: "Track Kit",
      sub: "Race splitter + canards",
      stat: "+22% downforce",
      modelPath: null,
    },
    {
      id: "wide",
      name: "Wide-body",
      sub: "Flared arches",
      stat: "+15% grip",
      modelPath: null,
    },
  ],
  wheels: [
    {
      id: "five-spoke",
      name: "Five-Spoke Forged",
      sub: "20-inch forged aluminum",
      stat: "−6kg unsprung",
      modelPath: null,
    },
    {
      id: "multi-spoke",
      name: "Multi-Spoke",
      sub: "21-inch flow-formed",
      stat: "−3kg unsprung",
      modelPath: null,
    },
    {
      id: "carbon",
      name: "Carbon Mono",
      sub: "21-inch carbon weave",
      stat: "−9kg unsprung",
      modelPath: null,
    },
  ],
  exhaust: [
    {
      id: "stealth-exhaust",
      name: "Stealth Quad",
      sub: "Subdued resonance",
      stat: "Refined tone",
      modelPath: null,
    },
    {
      id: "titanium",
      name: "Titanium Race",
      sub: "Open-pipe titanium",
      stat: "Aggressive tone",
      modelPath: null,
    },
    {
      id: "ceramic",
      name: "Ceramic Sport",
      sub: "Ceramic-coated mids",
      stat: "Balanced tone",
      modelPath: null,
    },
  ],
};

export const PART_PRICES = {
  engine: { atmospheric: 18000, "twin-turbo": 24000, hybrid: 38000 },
  body: { stealth: 8000, track: 14000, wide: 12000 },
  wheels: { "five-spoke": 6000, "multi-spoke": 7500, carbon: 12000 },
  exhaust: { "stealth-exhaust": 4500, titanium: 9500, ceramic: 6800 },
};
