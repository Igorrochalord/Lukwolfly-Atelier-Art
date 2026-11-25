import { ImageResponse } from "next/og";

export const alt = "Lukwolfly Atelier & Art";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b1215", color: "#ecf2ef", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#c6f24e" }}>FURSUITS · PELÚCIAS · ARTES</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>Lukwolfly</div>
          <div style={{ fontSize: 56, fontStyle: "italic", color: "#b79cff" }}>atelier & art</div>
        </div>
        <div style={{ display: "flex", height: 6, background: "#c6f24e", borderRadius: 3 }} />
      </div>
    ),
    size,
  );
}
