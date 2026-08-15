import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic title & subtitle from query parameters
    const title = searchParams.get("title") || "Talha Irfan";
    const subtitle =
      searchParams.get("subtitle") || "Full-Stack Web Developer — Next.js, React, Node.js & Supabase";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0a0a0a",
            padding: "80px 100px",
            fontFamily: "sans-serif",
            color: "#ffffff",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.07) 2px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        >
          {/* Top Brand Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
              }}
            />
            <span
              style={{
                fontSize: "24px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Talha Irfan Portfolio
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "1000px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 30 ? "56px" : "68px",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "28px",
                fontWeight: 400,
                lineHeight: 1.4,
                color: "#cbd5e1",
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom Footer Tags */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {["Next.js", "React", "Node.js", "Supabase", "TypeScript"].map((tech) => (
              <div
                key={tech}
                style={{
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#e2e8f0",
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Failed to generate OG image";
    return new Response(errorMessage, { status: 500 });
  }
}
