import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

function getParam(req: NextRequest, key: string, fallback: string) {
  const value = req.nextUrl.searchParams.get(key)?.trim();
  return value || fallback;
}

export function GET(req: NextRequest) {
  const title = getParam(req, "title", siteConfig.name);
  const description = getParam(req, "description", siteConfig.description);
  const label = getParam(req, "label", siteConfig.name);
  const path = getParam(req, "path", "/");
  const host = req.nextUrl.host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080102",
          color: "#ffffff",
          padding: "70px",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(200,16,46,0.38), rgba(255,255,255,0.02) 45%, rgba(10,80,130,0.28))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 460,
            height: 460,
            background: "rgba(200,16,46,0.22)",
            borderRadius: 460,
            transform: "translate(120px, -160px)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 18,
                background: "#c8102e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 900,
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{siteConfig.name}</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.74)" }}>
                Security-first engineering
              </div>
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.24)",
              borderRadius: 999,
              padding: "12px 22px",
              color: "rgba(255,255,255,0.82)",
              fontSize: 20,
            }}
          >
            {label}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: title.length > 54 ? 64 : 74,
              lineHeight: 1.02,
              margin: 0,
              maxWidth: 980,
              letterSpacing: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.78)",
              margin: 0,
              maxWidth: 980,
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(255,255,255,0.66)",
            fontSize: 22,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span>{host}</span>
          <span>{path}</span>
        </div>
      </div>
    ),
    size
  );
}
