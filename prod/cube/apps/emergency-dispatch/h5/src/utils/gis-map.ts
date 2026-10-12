export function makeGisMapSvg(W: number, H: number): string {
  let s = `<rect width="${W}" height="${H}" fill="#E8ECF1"/>`;
  s += `<path d="M0,${Math.round(H * 0.55)} Q${Math.round(W * 0.45)},${Math.round(H * 0.44)} ${Math.round(W * 0.8)},${Math.round(H * 0.67)} Q${Math.round(W * 0.95)},${Math.round(H * 0.72)} ${W},${Math.round(H * 0.61)} L${W},${Math.round(H * 0.78)} Q${Math.round(W * 0.55)},${Math.round(H * 0.72)} ${Math.round(W * 0.35)},${Math.round(H * 0.8)} Q${Math.round(W * 0.15)},${Math.round(H * 0.88)} 0,${Math.round(H * 0.72)} Z" fill="#B8D4E8" opacity="0.7"/>`;
  s += `<rect x="0" y="${Math.round(H * 0.72)}" width="${W}" height="16" fill="#FFFFFF" stroke="#D1D5DB"/><line x1="0" y1="${Math.round(H * 0.72) + 8}" x2="${W}" y2="${Math.round(H * 0.72) + 8}" stroke="#FCD34D" stroke-width="1" stroke-dasharray="10,6"/>`;
  s += `<rect x="${Math.round(W * 0.48)}" y="0" width="14" height="${H}" fill="#FFFFFF" stroke="#D1D5DB"/>`;
  const bds = [
    { x: 20, y: 20, w: 50, h: 40 },
    { x: 80, y: 15, w: 40, h: 45 },
    { x: Math.round(W * 0.55), y: 25, w: 45, h: 50 },
    { x: Math.round(W * 0.75), y: 30, w: 40, h: 40 },
    { x: 25, y: Math.round(H * 0.45), w: 45, h: 40 },
    { x: Math.round(W * 0.55), y: Math.round(H * 0.5), w: 50, h: 45 },
  ];
  for (const b of bds) {
    s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#D4D8DD" stroke="#B0B8C1" rx="2"/>`;
  }
  s += `<text x="${Math.round(W / 2)}" y="${Math.round(H * 0.68)}" fill="#6B7280" font-size="9" text-anchor="middle">园区道路</text>`;
  return s;
}
