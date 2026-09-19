import type { NextConfig } from "next";

const config: NextConfig = {
  allowedDevOrigins: ["app", "notary772-dev-app-1"],
  poweredByHeader: false,
  images: { qualities: [90] },
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};
export default config;
