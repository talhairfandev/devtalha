import { getWorks, getWorksMeta } from "@/lib/queries";
import ProjectsClient from "@/components/projects/ProjectsClient";

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
