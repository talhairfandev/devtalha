"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  ChevronDown,
  ArrowUp,
  CheckCircle2
} from "lucide-react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";

import MediaRenderer from "@/components/ui/MediaRenderer";
import type { WorksItem } from "@/types/content";

type ProjectDetailClientProps = {
  project: WorksItem;
  nextProject: WorksItem | null;
};

export default function ProjectDetailClient({ project, nextProject }: ProjectDetailClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll states for floating back-to-top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset scroll on project change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [project.id]);

  // Gallery Setup
  const rawGallery = Array.isArray(project.gallery_images)
    ? project.gallery_images.filter((img): img is string => Boolean(img && img.trim()))
    : [];
  const imageSet = [project.image_url, ...rawGallery].filter((img): img is string => Boolean(img && img.trim()));

  // Dynamic Scope
  const scopeItems = Array.isArray(project.scope) ? project.scope.filter((item) => Boolean(item && item.title)) : [];
  const [activeAccordion, setActiveAccordion] = useState<number | null>(scopeItems.length > 0 ? 0 : null);

  // Lightbox Modal State
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveImageIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % imageSet.length : null));
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + imageSet.length) % imageSet.length : null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIndex, imageSet.length]);

  useEffect(() => {
    setZoomLevel(1);
  }, [activeImageIndex]);

  const projectYear = project.created_at ? new Date(project.created_at).getFullYear() : null;

  return (
    <main ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-blue-600 selection:text-white relative font-sans pb-24">
      
      {/* 1. HERO HEADER & OVERVIEW SECTION (Wide max-w-7xl layout) */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">

          {/* Top Breadcrumb & Live Link Bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between gap-4 border-b border-border/20 pb-4"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Selection</span>
            </Link>

            {project.project_url && (
              <a
                href={project.project_url.startsWith('http') ? project.project_url : `https://${project.project_url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Visit Live Site</span>
                <ExternalLink size={14} />
              </a>
            )}
          </motion.div>

          {/* 2-Column Split Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Title, Tags & Author (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Tags & Client Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap items-center gap-2.5"
              >
                {project.client && (
                  <span className="px-3.5 py-1.5 rounded-full bg-foreground/10 text-foreground text-xs font-mono font-bold tracking-widest uppercase">
                    Client: {project.client}
                  </span>
                )}
                <span className="px-3.5 py-1.5 rounded-full border border-border/40 text-muted-foreground text-xs font-mono font-medium tracking-wider uppercase">
                  UI/UX & Web Architecture
                </span>
                {projectYear && (
                  <span className="px-3.5 py-1.5 rounded-full bg-border/20 text-muted-foreground text-xs font-mono">
                    Year: {projectYear}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 35, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.85,
                  delay: 0.16,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.02] break-words"
              >
                {project.title}
              </motion.h1>

              {/* Author Profile Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3.5 pt-6 border-t border-border/20 mt-2"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 relative border border-white/20 shrink-0 shadow-md">
                  <Image
                    src="/assets/3d/pp.png"
                    alt="Talha Irfan"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-foreground">Talha Irfan</h4>
                    <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/20" />
                  </div>
                  <p className="text-xs text-muted-foreground">Full-Stack & Interactive Motion Designer</p>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Project Overview Box & Specs (4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-card/60 border border-border/40 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden"
            >
              {/* Subtle ambient accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-blue-500 uppercase block mb-3">
                  PROJECT BRIEF
                </span>
                <p className="text-sm sm:text-base font-normal leading-relaxed text-foreground/90">
                  {project.summary || `A high-impact case study showcasing design system engineering, interactive animations, and responsive web development for ${project.title}.`}
                </p>
              </div>

              <div className="border-t border-border/30 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">Client</span>
                  <span className="font-semibold text-foreground">{project.client || "Confidential"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">Role</span>
                  <span className="font-semibold text-foreground">Lead Engineer</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">Year</span>
                  <span className="font-semibold text-foreground">{projectYear || "2025"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-0.5">Services</span>
                  <span className="font-semibold text-foreground">Design & Code</span>
                </div>
              </div>

              {project.project_url && (
                <a
                  href={project.project_url.startsWith('http') ? project.project_url : `https://${project.project_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors shadow-md mt-2"
                >
                  <span>Launch Website</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </motion.div>

          </div>

        </div>
      </section>

      {/* 2. FULL-WIDTH SHOWCASE CANVAS GRID (Wide max-w-7xl) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 my-10 sm:my-16">
        <div className="flex flex-col gap-8 md:gap-12">
          {imageSet.map((img, idx) => {
            const isHero = idx === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 45, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.75,
                  delay: isHero ? 0.3 : 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-full overflow-hidden rounded-xl md:rounded-2xl border border-border/40 shadow-2xl bg-card group cursor-pointer ${
                  isHero ? "ring-1 ring-white/10" : ""
                }`}
              >
                <div className={`relative w-full ${isHero ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[16/10] sm:aspect-[16/9]"}`}>
                  <MediaRenderer
                    src={img}
                    alt={`${project.title} showcase exhibit ${idx + 1}`}
                    fill
                    priority={isHero}
                    quality={90}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    videoClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  />
                </div>

                {/* Hover Expand Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md text-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl">
                    <Maximize2 size={14} />
                    <span>Expand Exhibit Visual</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. DELIVERABLES SECTION */}
      {scopeItems.length > 0 && (
        <section className="py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto my-12 border-t border-b border-border/20">
          <div className="flex flex-col gap-6 max-w-4xl">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-blue-500 uppercase block mb-2">
                PROJECT DELIVERABLES
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Scope of Work & Technical Execution
              </h3>
            </div>

            <div className="space-y-3.5 w-full">
              {scopeItems.map((item, idx) => {
                const isOpen = activeAccordion === idx;
                return (
                  <div
                    key={idx}
                    className={`border border-border/30 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? "bg-card/70 border-foreground/30 shadow-md" : "bg-transparent hover:border-border/60"}`}
                  >
                    <button
                      onClick={() => setActiveAccordion(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer gap-4"
                    >
                      <span className="text-sm sm:text-base font-semibold text-foreground">{item.title}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-muted-foreground"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground px-4 sm:px-5 pb-5 pt-1">
                            {item.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. NEXT PROJECT BANNER (Wide max-w-7xl) */}
      {nextProject && (
        <section className="py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <Link
            href={`/projects/${nextProject.id}`}
            className="group relative w-full overflow-hidden rounded-2xl border border-border/30 bg-card p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-foreground/30 shadow-xl block"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-blue-500 uppercase">
                NEXT PROJECT CASE STUDY
              </span>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground group-hover:text-blue-500 transition-colors">
                {nextProject.title}
              </h3>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Client: {nextProject.client}
              </p>
            </div>

            <div className="w-14 h-14 rounded-full border border-border/40 flex items-center justify-center text-foreground group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
              <ChevronRight size={24} />
            </div>
          </Link>
        </section>
      )}

      {/* 5. FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/40 text-foreground text-xs font-mono font-bold shadow-2xl hover:bg-foreground hover:text-background transition-all cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp size={14} />
              <span>TOP</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
          >
            {/* Close Overlay */}
            <div className="absolute inset-0" onClick={() => setActiveImageIndex(null)} />

            {/* Header controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
              <span className="text-white/60 font-mono text-xs">
                Exhibit {activeImageIndex + 1} / {imageSet.length}
              </span>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                  className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setActiveImageIndex(null)}
                  className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Image Viewer */}
            <div className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center overflow-hidden pointer-events-none">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ scale: zoomLevel }}
                drag={zoomLevel > 1}
                className="relative w-full h-full pointer-events-auto flex items-center justify-center"
              >
                <MediaRenderer
                  src={imageSet[activeImageIndex]}
                  alt="Gallery exhibit detail"
                  fill
                  quality={90}
                  sizes="90vw"
                  priority
                  className="object-contain select-none"
                  videoClassName="w-full h-full max-h-[75vh] object-contain"
                  controls={true}
                  muted={true}
                  loop={true}
                  autoPlay={true}
                />
              </motion.div>
            </div>

            {/* Prev / Next controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 pointer-events-auto">
              <button
                onClick={() => setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + imageSet.length) % imageSet.length : null))}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % imageSet.length : null))}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}