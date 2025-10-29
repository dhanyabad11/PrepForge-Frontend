import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have types
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})(nextConfig);
