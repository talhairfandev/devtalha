"use client";

import Link from "next/link";
import MediaRenderer from "@/components/ui/MediaRenderer";
import React, { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LiquidButton } from "./ui/LiquidButton";
import BlurText from "./BlurText";
import type { WorksItem } from "@/types/content";
import { BASE_REVEAL, REVEAL_VIEWPORT } from "@/lib/motion";
import { useMagnetic } from "@/hooks/useMagnetic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type WorkCardData = {
  id: string;
  title: string;
  client: string;
  imageUrl: string;
  hoverImageUrl: string;
};

type WorksProps = {
  data?: WorksItem[] | null;
  featuredCount?: number;
  sectionId?: string;
  label?: string;
  heading?: string;
  showViewAll?: boolean;
};

// ---------------------------------------------------------------------------
// Desktop: horizontal-pinned premium gallery panel
// ---------------------------------------------------------------------------
function GalleryPanel({
  work,
  index,
}: {
  work: WorkCardData;
  index: number;
}) {
  return (
    <article
      data-panel
      data-index={index}
      className="gsap-works-panel group relative shrink-0 h-[64vh] w-[80vw] sm:w-[60vw] lg:w-[44vw] xl:w-[38vw] [perspective:1400px]"
    >
      <div
        data-panel-inner
        className="relative h-full w-full rounded-3xl overflow-hidden bg-neutral-950 border border-white/10 cursor-pointer shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] [transform-style:preserve-3d] will-change-transform"
      >
        <Link
          href={`/projects/${work.id}`}
          className="block w-full h-full relative"
          data-cursor="view"
          aria-label={`Open ${work.title} project details`}
        >
          {/* Media with its own parallax layer */}
          <div className="absolute inset-0 overflow-hidden bg-muted">
            <div data-panel-media className="absolute inset-0 scale-[1.22] will-change-transform">
              <MediaRenderer
                src={work.imageUrl}
                alt={work.title}
                fill
                priority={false}
                className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.05]"
                videoClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.05]"
                sizes="(max-width: 1024px) 60vw, 38vw"
                quality={85}
              />
            </div>
            {/* Gradient scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35 pointer-events-none" />
            {/* Animated sheen sweep on hover */}
            <div className="absolute -inset-x-full inset-y-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          </div>

          {/* Animated corner brackets */}
          <span className="absolute top-5 left-5 w-6 h-6 border-t border-l border-white/40 group-hover:w-9 group-hover:h-9 group-hover:border-white transition-all duration-500 pointer-events-none" />
          <span className="absolute top-5 right-5 w-6 h-6 border-t border-r border-white/40 group-hover:w-9 group-hover:h-9 group-hover:border-white transition-all duration-500 pointer-events-none" />
          <span className="absolute bottom-5 left-5 w-6 h-6 border-b border-l border-white/40 group-hover:w-9 group-hover:h-9 group-hover:border-white transition-all duration-500 pointer-events-none" />
          <span className="absolute bottom-5 right-5 w-6 h-6 border-b border-r border-white/40 group-hover:w-9 group-hover:h-9 group-hover:border-white transition-all duration-500 pointer-events-none" />

          {/* Top meta bar */}
          {work.client ? (
            <div className="relative z-10 flex items-center justify-end p-7 sm:p-9">
              <span className="text-white/60 font-mono text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {work.client}
              </span>
            </div>
          ) : null}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-4 p-7 sm:p-9">
            <div className="overflow-hidden">
              <span className="block text-white/50 font-mono text-[9px] font-bold uppercase tracking-[0.3em] mb-2">
                Project
              </span>
              <h3
                data-panel-title
                className="text-white text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[0.95]"
              >
                {work.title}
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70 group-hover:text-white transition-colors">
                View
              </span>
              <div className="w-12 h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-md flex items-center justify-center text-white group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                <span className="text-sm font-mono group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          </div>

          {/* Focus ring on hover */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/0 group-hover:ring-white/25 transition-all duration-500 pointer-events-none" />
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Mobile: touch-swipe card with GSAP entrance
// ---------------------------------------------------------------------------
function MobileProjectCard({
  work,
}: {
  work: WorkCardData;
}) {
  return (
    <div className="gsap-works-mobile-card snap-center w-[85vw] sm:w-[380px] shrink-0 h-[440px] rounded-2xl overflow-hidden bg-neutral-950 border border-white/15 relative flex flex-col justify-between p-6 group cursor-pointer shadow-lg">
      <Link
        href={`/projects/${work.id}`}
        className="w-full h-full relative flex flex-col justify-between"
        aria-label={`Open ${work.title} project details`}
      >
        <div className="absolute -m-6 inset-0 w-[calc(100%+3rem)] h-[calc(100%+3rem)] overflow-hidden bg-muted">
          <MediaRenderer
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(max-width: 640px) 85vw, 380px"
            quality={80}
            className="object-cover"
            videoClassName="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />
        </div>

        {work.client ? (
          <div className="relative z-10 flex items-center justify-end">
            <span className="text-white/80 font-mono text-[10px] font-medium tracking-widest uppercase bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 truncate max-w-[140px]">
              {work.client}
            </span>
          </div>
        ) : null}

        <div className="relative z-10 flex items-end justify-between gap-3">
          <div>
            <span className="text-white/60 font-mono text-[9px] font-bold uppercase tracking-widest block mb-1">
              PROJECT
            </span>
            <h3 className="text-white text-2xl font-bold tracking-tight leading-tight">
              {work.title}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <span className="text-xs font-mono font-bold">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Works({
  data,
  featuredCount,
  sectionId = "work",
  label = "[ SELECTED PROJECTS ]",
  heading = "Projects.",
  showViewAll = true,
}: WorksProps) {
  const works: WorkCardData[] =
    data && data.length > 0
      ? data.map((w) => ({
          id: w.id,
          title: w.title,
          client: w.client,
          imageUrl: w.image_url,
          hoverImageUrl: w.hover_image_url,
        }))
      : [];

  const visibleWorks =
    typeof featuredCount === "number" ? works.slice(0, featuredCount) : works;

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useMagnetic(ctaRef, 0.25);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (visibleWorks.length === 0) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // --- Desktop: horizontal pinned scroll gallery -----------------------
      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };
          if (!isDesktop || reduceMotion) return;

          const track = trackRef.current;
          const pin = pinRef.current;
          if (!track || !pin) return;

          const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
          if (panels.length === 0) return;

          const getScrollDistance = () => track.scrollWidth - window.innerWidth;

          // Velocity-driven skew for a kinetic, "premium" feel.
          const skewSetter = gsap.quickTo(track, "skewX", {
            duration: 0.4,
            ease: "power3.out",
          });
          const proxy = { skew: 0 };

          const horizontal = gsap.to(track, {
            x: () => -getScrollDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                // Progress bar
                if (progressRef.current) {
                  gsap.set(progressRef.current, { scaleX: self.progress });
                }
                // Skew from scroll velocity
                const v = gsap.utils.clamp(-12, 12, self.getVelocity() / -260);
                if (Math.abs(v) > Math.abs(proxy.skew)) {
                  proxy.skew = v;
                  skewSetter(v);
                  gsap.to(proxy, {
                    skew: 0,
                    duration: 0.6,
                    ease: "power3.out",
                    overwrite: true,
                    onUpdate: () => skewSetter(proxy.skew),
                  });
                }
              },
            },
          });

          // Per-panel: 3D depth, media parallax, title reveal.
          panels.forEach((panel) => {
            const inner = panel.querySelector<HTMLElement>("[data-panel-inner]");
            const media = panel.querySelector<HTMLElement>("[data-panel-media]");
            const title = panel.querySelector<HTMLElement>("[data-panel-title]");

            // Media parallax inside frame.
            if (media) {
              gsap.fromTo(
                media,
                { xPercent: -10 },
                {
                  xPercent: 10,
                  ease: "none",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: horizontal,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  },
                }
              );
            }

            // 3D carousel rotation: panels rotate in from the sides toward flat at center.
            if (inner) {
              gsap.fromTo(
                inner,
                { rotationY: 14, z: -140, scale: 0.9, autoAlpha: 0.5 },
                {
                  rotationY: 0,
                  z: 0,
                  scale: 1,
                  autoAlpha: 1,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: horizontal,
                    start: "left 92%",
                    end: "center 52%",
                    scrub: true,
                  },
                }
              );
              // Exit rotation to the other side after passing center.
              gsap.fromTo(
                inner,
                { rotationY: 0 },
                {
                  rotationY: -14,
                  ease: "power2.in",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: horizontal,
                    start: "center 48%",
                    end: "right left",
                    scrub: true,
                  },
                }
              );
            }

            // Title mask reveal.
            if (title) {
              gsap.fromTo(
                title,
                { yPercent: 120, autoAlpha: 0 },
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  ease: "power3.out",
                  duration: 0.8,
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: horizontal,
                    start: "left 80%",
                    toggleActions: "play none none reverse",
                  },
                }
              );
            }
          });

          // Header intro
          gsap.from("[data-works-header]", {
            y: 40,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            },
          });
        }
      );

      // --- Mobile: staggered entrance for the swipe carousel ---------------
      mm.add(
        {
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isMobile, reduceMotion } = context.conditions as {
            isMobile: boolean;
            reduceMotion: boolean;
          };
          if (!isMobile || reduceMotion) return;

          const cards = gsap.utils.toArray<HTMLElement>(".gsap-works-mobile-card");
          if (cards.length === 0) return;

          gsap.from(cards, {
            y: 40,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: mobileTrackRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        }
      );
    }, sectionRef);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [visibleWorks.length]);

  if (visibleWorks.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-background select-none"
      id={sectionId}
    >
      {/* Section Header */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-14 md:pt-28">
        <div
          data-works-header
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16"
        >
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={REVEAL_VIEWPORT}
              transition={BASE_REVEAL}
              className="text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground block mb-3"
            >
              {label}
            </motion.span>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-medium tracking-tighter leading-none">
              <BlurText
                text={heading}
                delay={60}
                animateBy="letters"
                direction="bottom"
                className="inline-flex"
              />
            </h2>
          </div>

          {/* Desktop Scroll Indicator */}
          <div className="hidden md:flex items-center gap-3 text-muted-foreground/70 text-xs font-mono font-bold uppercase tracking-widest">
            <span>SCROLL TO EXPLORE</span>
            <motion.span
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center gap-2 text-muted-foreground/80 text-[10px] font-mono font-bold uppercase tracking-widest">
            <span>SWIPE TO EXPLORE</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT: Horizontal touch swipe carousel */}
      <div
        ref={mobileTrackRef}
        className="flex md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 px-4 pb-14"
      >
        {visibleWorks.map((work) => (
          <MobileProjectCard
            key={work.id}
            work={work}
          />
        ))}
      </div>

      {/* DESKTOP LAYOUT: GSAP horizontal pinned gallery */}
      <div ref={pinRef} className="hidden md:block relative w-full overflow-hidden h-screen">

        {/* Scroll progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 z-20">
          <div
            ref={progressRef}
            className="h-full w-full origin-left scale-x-0 bg-foreground/70"
          />
        </div>

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35))]" />

        <div className="relative z-10 flex h-full items-center">
          <div
            ref={trackRef}
            className="flex items-center gap-10 lg:gap-16 pl-[8vw] pr-[8vw] will-change-transform"
          >
            {visibleWorks.map((work, index) => (
              <GalleryPanel
                key={work.id}
                work={work}
                index={index}
              />
            ))}

            {/* End CTA panel inside the horizontal track */}
            {showViewAll && (
              <div
                data-panel
                className="shrink-0 h-[64vh] w-[70vw] sm:w-[50vw] lg:w-[34vw] rounded-3xl border border-white/10 bg-neutral-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-8"
              >
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                  MORE EXPERIMENTS & WORKS
                </span>
                <h3 className="text-2xl lg:text-4xl font-medium tracking-tight mb-8 text-foreground">
                  Discover the complete project archive
                </h3>
                <div ref={ctaRef} className="inline-block">
                  <Link href="/projects">
                    <LiquidButton variant="secondary" size="default" rounded="full">
                      Explore More Works →
                    </LiquidButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile bottom CTA */}
      {showViewAll && (
        <div className="flex md:hidden flex-col items-center text-center pb-14 px-4">
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-4 block">
            MORE EXPERIMENTS & WORKS
          </span>
          <h3 className="text-xl font-medium tracking-tight mb-8 text-foreground">
            Discover the complete project archive
          </h3>
          <Link href="/projects">
            <LiquidButton variant="secondary" size="default" rounded="full">
              Explore More Works →
            </LiquidButton>
          </Link>
        </div>
      )}
    </section>
  );
}
