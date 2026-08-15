import type { Metadata } from "next";
import { getWorks, getWorksMeta } from "@/lib/queries";
import ProjectsClient from "@/components/projects/ProjectsClient";

export const metadata: Metadata = {
  title: "Selected Projects",
  description:
    "Explore full-stack web applications, frontend projects, and interactive digital experiences created by Talha Irfan.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Selected Projects | Talha Irfan",
    description:
      "Explore full-stack web applications, frontend projects, and interactive digital experiences created by Talha Irfan.",
    url: "/projects",
    images: [
      {
        url: "/api/og?title=Selected%20Projects&subtitle=Explore%20Full-Stack%20Web%20Applications%20%26%20Design%20Systems",
        width: 1200,
        height: 630,
        alt: "Selected Projects — Talha Irfan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected Projects | Talha Irfan",
    description:
      "Explore full-stack web applications, frontend projects, and interactive digital experiences created by Talha Irfan.",
    images: ["/api/og?title=Selected%20Projects&subtitle=Explore%20Full-Stack%20Web%20Applications%20%26%20Design%20Systems"],
  },
};

export const revalidate = 604800; // 7 days

export default async function ProjectsPage() {
  const [works, worksMeta] = await Promise.all([getWorks(), getWorksMeta()]);

  const worksData = works.map((w) => ({
    id: w.id,
    title: w.title,
    client: w.client,
    imageUrl: w.image_url,
    hoverImageUrl: w.hover_image_url,
  }));

  const heading = worksMeta?.archive_heading || "Selected Projects.";

  return <ProjectsClient worksData={worksData} heading={heading} />;
}
