import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectDetailClient from "@/components/projects/ProjectDetailClient";

import { getWorkById, getWorks } from "@/lib/queries";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 604800;

export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((work) => ({ id: work.id }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getWorkById(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const title = project.title;
  const description =
    project.summary ||
    `Detailed case study and project showcase for ${project.title} developed by Talha Irfan.`;
  const ogImageUrl =
    project.image_url ||
    `/api/og?title=${encodeURIComponent(project.title)}&subtitle=${encodeURIComponent(
      project.summary || "Case study by Talha Irfan"
    )}`;

  return {
    title: project.title,
    description: description,
    alternates: {
      canonical: `/projects/${id}`,
    },
    openGraph: {
      type: "article",
      title: `${title} | Talha Irfan`,
      description: description,
      url: `/projects/${id}`,
      siteName: "Talha Irfan Portfolio",
      images: [
        {
          url: ogImageUrl,
          alt: `${title} — Project Showcase`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Talha Irfan`,
      description: description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getWorkById(id);

  if (!project) {
    notFound();
  }

  const works = await getWorks();
  const currentIndex = works.findIndex((w) => w.id === id);
  const nextProject = currentIndex !== -1 && works.length > 1
    ? works[(currentIndex + 1) % works.length]
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://talha-irfan.vercel.app";

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.title,
        description: project.summary || `Project showcase for ${project.title}`,
        url: `${siteUrl}/projects/${project.id}`,
        image: project.image_url,
        author: {
          "@type": "Person",
          name: "Talha Irfan",
          url: siteUrl,
        },
        ...(project.client ? { provider: { "@type": "Organization", name: project.client } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: `${siteUrl}/projects`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: `${siteUrl}/projects/${project.id}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <ProjectDetailClient project={project} nextProject={nextProject} />
    </>
  );
}


