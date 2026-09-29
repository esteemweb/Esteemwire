// The mark: a strip of ribbon folded into an E, drawn as five flat faces
// (two of them the shadowed folds) in a 312 × 431 box, traced from
// logo/esteemwire logo.jpeg. Drawn by components/Mark.tsx; given depth by
// components/Mark3D.tsx. Paint order is
// array order: the bottom band first, the tip last.

export type Face = {
  name: string;
  /** Polygon, y down. */
  points: [number, number][];
  /** Gradient stops, from → to. */
  colors: [string, string];
  /** Gradient axis in bounding-box units: x1 y1 → x2 y2. */
  axis: [number, number, number, number];
};

export const MARK = { width: 312, height: 431 } as const;

export const faces: Face[] = [
  { name: "bot", points: [[2,205],[307,342],[311,429],[4,299]], colors: ["#6a52f0", "#cfe9ff"], axis: [0, 0, 1, 1] },
  { name: "fold2", points: [[44,171],[146,212],[84,242],[2,205]], colors: ["#3f05c9", "#6a3cf7"], axis: [0, 0, 1, 0] },
  { name: "mid", points: [[2,69],[131,113],[267,176],[271,262],[2,154]], colors: ["#5b2af0", "#9cb0ff"], axis: [0, 0, 1, 1] },
  { name: "fold1", points: [[2,69],[195,0],[195,87],[131,113]], colors: ["#4a12d6", "#6e3dff"], axis: [0, 0, 1, 0] },
  { name: "tip", points: [[195,0],[273,36],[274,105],[195,87]], colors: ["#a463ff", "#7f4dff"], axis: [0, 0, 1, 1] },
];

/** The wordmark as it is set in the logo: lowercase, light, widely spaced. */
export const WORDMARK = "esteemwire";
