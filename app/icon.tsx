import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

function Icon() {
  const icon = new ImageResponse(
    <div
      style={{
        alignItems: "center",
        display: "flex",
        fontSize: 26,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      🧱
    </div>,
    {
      ...size,
      emoji: "twemoji",
    },
  );

  return icon;
}

export default Icon;
