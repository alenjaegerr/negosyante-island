import { ImageResponse } from "next/og";

export const alt = "Negosyante Island social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top left, rgba(34, 211, 238, 0.32), transparent 32%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.28), transparent 30%), linear-gradient(180deg, #020617 0%, #081122 100%)",
          color: "#f8fafc",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: "1120px",
            height: "550px",
            borderRadius: "40px",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            background: "rgba(15, 23, 42, 0.72)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            backdropFilter: "blur(18px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  background: "linear-gradient(135deg, rgba(0, 132, 209, 0.45), rgba(15, 23, 42, 0.9))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: 900,
                }}
              >
                NI
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "15px", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(165, 243, 252, 0.9)", fontWeight: 800 }}>
                  Negosyante Island
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>Social media + culture analytics</div>
              </div>
            </div>
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "rgba(226, 232, 240, 0.92)",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Live on Vercel
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", flex: 1, minHeight: 0 }}>
            <div
              style={{
                flex: 1.15,
                borderRadius: "32px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "linear-gradient(180deg, rgba(8, 15, 33, 0.95), rgba(15, 23, 42, 0.7))",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ fontSize: "17px", color: "rgba(186, 230, 253, 0.86)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Trending snapshot
                </div>
                <div style={{ fontSize: "32px", lineHeight: 1.08, fontWeight: 800, maxWidth: "620px" }}>
                  Explore what people are talking about, who&apos;s verified, and what&apos;s moving the island.
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                {[
                  ["🔥 Trending", "Fast-moving conversations and signals"],
                  ["🏝️ Island Forums", "Questions, ideas, and local knowledge"],
                  ["✅ Verified", "Businesses and experts you can trust"],
                  ["📈 Insights", "Analytics for growth and discovery"],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    style={{
                      borderRadius: "22px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      background: "rgba(255, 255, 255, 0.06)",
                      padding: "18px",
                      minHeight: "118px",
                      width: "48%",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: 800 }}>{title}</div>
                    <div style={{ marginTop: "10px", fontSize: "17px", lineHeight: 1.35, color: "rgba(226, 232, 240, 0.82)" }}>{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                width: "300px",
                borderRadius: "32px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(8, 15, 33, 0.72))",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ fontSize: "15px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(165, 243, 252, 0.82)", fontWeight: 800 }}>
                Share preview
              </div>
              <div
                style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "rgba(255, 255, 255, 0.06)",
                  height: "210px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ height: "34px", background: "rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "6px", padding: "0 12px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#fb7185" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#fbbf24" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#34d399" }} />
                </div>
                <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "rgba(34, 211, 238, 0.22)" }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "15px", fontWeight: 800 }}>Negosyante Island</div>
                      <div style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.72)" }}>Homepage snapshot</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Trending", "Forums", "Verified"].map((chip) => (
                      <div
                        key={chip}
                        style={{
                          padding: "7px 10px",
                          borderRadius: "999px",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {chip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "16px", lineHeight: 1.45, color: "rgba(226, 232, 240, 0.78)" }}>
                A clean, branded snapshot that looks good in Facebook, X, and messaging previews.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
