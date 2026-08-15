import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Talha Irfan — Full-Stack Web Developer",
    short_name: "Talha Irfan",
    description:
      "Full-Stack Web Developer specializing in Next.js, React, Node.js, and Supabase.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
