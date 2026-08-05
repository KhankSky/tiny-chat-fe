import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "vi";
  const dictionary = getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#020617",
          color: "#f8fafc",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 540,
            height: 540,
            borderRadius: 9999,
            right: -120,
            top: -190,
            background: "#164e63",
            opacity: 0.65,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 9999,
            right: 75,
            bottom: -250,
            background: "#0e7490",
            opacity: 0.35,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", width: "62%", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 64,
                height: 64,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                background: "#22d3ee",
                color: "#082f49",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              C
            </div>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: 1 }}>Conyva</span>
          </div>
          <div style={{ display: "flex", marginTop: 70, fontSize: 56, fontWeight: 800, lineHeight: 1.15 }}>
            {dictionary.seo.socialHeadline}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#bae6fd" }}>
            {dictionary.seo.socialDescription}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "38%",
            gap: 18,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              borderRadius: 24,
              padding: "18px 24px",
              background: "#e0f2fe",
              color: "#0c4a6e",
              fontSize: 23,
              fontWeight: 600,
            }}
          >
            Let&apos;s practice today!
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-end",
              borderRadius: 24,
              padding: "18px 24px",
              background: "#22d3ee",
              color: "#083344",
              fontSize: 23,
              fontWeight: 600,
            }}
          >
            I&apos;m in!
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              borderRadius: 24,
              padding: "18px 24px",
              background: "#e0f2fe",
              color: "#0c4a6e",
              fontSize: 23,
              fontWeight: 600,
            }}
          >
            See you in the group.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
