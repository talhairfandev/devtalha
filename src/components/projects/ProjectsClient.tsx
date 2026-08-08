"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

type ProjectItem = {
  id: string;
  title: string;
  client: string;
  imageUrl: string;
  hoverImageUrl: string;
};

type ProjectsClientProps = {
  worksData: ProjectItem[];
  heading: string;
};

export default function ProjectsClient({ worksData, heading }: ProjectsClientProps) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 sm:pb-32 font-sans selection:bg-foreground selection:text-background">

      {/* Top Header Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-foreground/10 pt-24 sm:pt-28 pb-5 sm:pb-6 mb-8 sm:mb-12"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground group cursor-pointer"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Back To Home
          </Link>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-muted-foreground/60 uppercase font-mono">
            Total Projects: {worksData.length}
          </span>
        </div>
      </motion.header>

      {/* Title Block */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mb-10 sm:mb-16">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground/80 block mb-3 sm:mb-4 uppercase font-mono"
        >
          [ ARCHIVE ]
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 35, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.85,
            delay: 0.15,
            ease: [0.25, 1, 0.5, 1]
          }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[0.9] sm:leading-[0.84] md:leading-[0.8] lg:leading-[0.76] text-foreground break-words"
        >
          {heading}
        </motion.h1>
      </section>

      {/* Portfolio Grid Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
          {worksData.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15 + index * 0.07,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <Link
                href={`/projects/${work.id}`}
                className="group block w-full text-left cursor-pointer"
                data-cursor="view"
                aria-label={`Open ${work.title} project details`}
              >
                {/* Premium Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-card rounded-xl border border-foreground/10 shadow-md sm:shadow-lg mb-4 sm:mb-6">
                  <Image
                    src={work.imageUrl}
                    alt={work.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={85}
                  />
                  {/* Soft Hover Tint overlay */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Details Row */}
                <div className="flex justify-between items-baseline px-1 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase block mb-1 font-mono truncate">
                      {work.client}
                    </span>
                    <h3 className="text-lg sm:text-xl font-medium tracking-tight text-foreground group-hover:text-muted-foreground transition-colors duration-300 truncate">
                      {work.title}
                    </h3>
                  </div>
                  <span className="text-[9px] font-bold font-mono tracking-widest text-muted-foreground/60 uppercase group-hover:text-foreground transition-colors duration-300 shrink-0">
                    [ VIEW ]
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {worksData.length === 0 && (
          <div className="text-center py-24 text-sm text-muted-foreground font-medium">
            No projects added yet.
          </div>
        )}
      </div>

    </div>
  );
}
