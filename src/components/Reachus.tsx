"use client";

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import type { ReachSocial, ReachusSection } from "@/types/content";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";
import MediaRenderer from "@/components/ui/MediaRenderer";

export default function Reachus({ data }: { data?: ReachusSection | null }) {
  const { prefersReducedMotion, isMobile, allowParallax } = useMotionPreferences();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Global trigger to open modal from anywhere (Navbar, Footer, Hash)
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#contact") {
        setIsModalOpen(true);
      }
    };

    window.addEventListener("open-contact-modal", handleOpenModal);
    window.addEventListener("hashchange", checkHash);
    checkHash();

    return () => {
      window.removeEventListener("open-contact-modal", handleOpenModal);
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  // Extract data from props
  const label = data?.label?.trim() ?? '';
  const marqueeText = data?.heading?.trim() ?? '';
  const email = data?.email?.trim() ?? '';
  const officeTitle = data?.office_title?.trim() ?? '';
  const officeLine1 = data?.office_line_1?.trim() ?? '';
  const officeLine2 = data?.office_line_2?.trim() ?? '';
  const officeLine3 = data?.office_line_3?.trim() ?? '';
  const inquiryTitle = data?.inquiry_title?.trim() ?? '';
  const inquiryText = data?.inquiry_text?.trim() ?? '';
  const backgroundMedia = data?.background_image_url ?? '';
  const portraitMedia = data?.portrait_image_url ?? '';
  const socials: ReachSocial[] = data?.socials ?? [];

  const sectionRef = useRef<HTMLElement>(null);

  // Multi-Layer Scroll Parallax targeting BOTH images
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Image 1: Villa Background Image Translation
  const bgY = useTransform(
    smoothProgress,
    [0, 1],
    !allowParallax ? ["0%", "0%"] : (isMobile ? ["-5%", "5%"] : ["-10%", "10%"])
  );

  // Image 1: Villa Background Image Zoom Parallax
  const bgScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    !allowParallax ? [1, 1, 1] : (isMobile ? [1.08, 1.14, 1.20] : [1.10, 1.18, 1.25])
  );

  // Marquee Box & Crosshairs Parallax
  const containerY = useTransform(
    smoothProgress,
    [0, 1],
    !allowParallax ? [0, 0] : (isMobile ? [5, -5] : [15, -15])
  );

  // Image 2: Foreground Portrait Card Frame Translation
  const cardY = useTransform(
    smoothProgress,
    [0, 1],
    !allowParallax ? [0, 0] : (isMobile ? [-15, 15] : [-40, 40])
  );

  // Image 2: Parallax Movement INSIDE the Portrait Card image frame
  const portraitImageY = useTransform(
    smoothProgress,
    [0, 1],
    !allowParallax ? ["0%", "0%"] : (isMobile ? ["-5%", "5%"] : ["-10%", "10%"])
  );

  // Image 2: Subtle scale shift inside the Portrait Card
  const portraitImageScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    !allowParallax ? [1, 1, 1] : [1.1, 1.15, 1.2]
  );

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-0 py-0 md:px-6 md:py-6 w-full">
      <section
        id="contact"
        className="min-h-[140vh] md:min-h-[150vh] relative overflow-hidden section-dark select-none rounded-none md:rounded-lg border-0 border-transparent md:border md:border-white/15 shadow-none md:shadow-2xl"
        ref={sectionRef}
      >
        {/* Image 1: Villa Background Image with Parallax & Subtle Zoom */}
        {backgroundMedia ? (
          <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
            <motion.div
              className="absolute -inset-y-[12%] -inset-x-[2%] z-0"
              style={{
                y: bgY,
                scale: bgScale
              }}
            >
              <MediaRenderer
                src={backgroundMedia}
                alt="Villa Background"
                fill
                className="object-cover"
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 1920px, 100vw"
                quality={90}
              />
            </motion.div>
          </div>
        ) : null}

        {/* Dark Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-black/20 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-0 pointer-events-none" />

        {/* Absolute Dead Center Zone for Marquee Box & Crosshairs */}
        <motion.div
          className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[78vw] md:w-[52vw] max-w-[720px] h-[140px] md:h-[175px] flex items-center justify-center pointer-events-none"
          style={{ y: containerY }}
        >

          {/* 4 Corner Plus (+) Crosshairs */}
          <span className="absolute top-0 left-0 text-white text-2xl md:text-3xl font-light leading-none select-none -translate-x-1/2 -translate-y-1/2 z-30">+</span>
          <span className="absolute bottom-0 left-0 text-white text-2xl md:text-3xl font-light leading-none select-none -translate-x-1/2 translate-y-1/2 z-30">+</span>
          <span className="absolute top-0 right-0 text-white text-2xl md:text-3xl font-light leading-none select-none translate-x-1/2 -translate-y-1/2 z-30">+</span>
          <span className="absolute bottom-0 right-0 text-white text-2xl md:text-3xl font-light leading-none select-none translate-x-1/2 translate-y-1/2 z-30">+</span>

          {/* Sliding Marquee */}
          <div
            className="w-full overflow-hidden flex items-center whitespace-nowrap relative z-10 pointer-events-none select-none h-full"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)'
            }}
          >
            <motion.div
              className="flex gap-16 whitespace-nowrap items-center"
              animate={prefersReducedMotion ? {} : { x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: isMobile ? 26 : 42,
                repeat: Infinity
              }}
            >
              <div className="flex gap-16 whitespace-nowrap text-6xl md:text-8xl lg:text-[112px] font-medium tracking-tight text-white leading-none">
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
              </div>
              <div className="flex gap-16 whitespace-nowrap text-6xl md:text-8xl lg:text-[108px] font-medium tracking-tight text-white leading-none">
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
                <span>{marqueeText}</span>
              </div>
            </motion.div>
          </div>

          {/* Image 2: Centered Floating Portrait Card with Parallax Frame AND Internal Image Parallax */}
          <motion.div
            className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ y: cardY }}
          >
            <div
              className="relative w-[145px] h-[200px] md:w-[230px] md:h-[320px] rounded-md md:rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Internal Image Parallax inside the card frame */}
              <div className="w-full h-full relative overflow-hidden select-none pointer-events-none">
                {portraitMedia ? (
                  <motion.div
                    className="absolute -inset-y-[10%] inset-x-0 w-full h-[120%]"
                    style={{
                      y: portraitImageY,
                      scale: portraitImageScale
                    }}
                  >
                    <MediaRenderer
                      src={portraitMedia}
                      alt="Contact Portrait"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 500px, 500px"
                      quality={90}
                    />
                  </motion.div>
                ) : null}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </motion.div>

        {/* Bottom Action Trigger: Positioned at section base */}
        <div className="absolute z-30 bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <button
            onClick={handleContactClick}
            className="group flex flex-col items-center cursor-pointer text-white/90 hover:text-white transition-colors"
          >
            <div className="flex items-start gap-1 text-xs md:text-sm font-normal tracking-wide text-white select-none">
              <span>Contact Now</span>
              <span className="text-[9px] relative top-0.5 leading-none">⌝</span>
            </div>
            <div className="w-[160px] md:w-[210px] h-[1px] bg-white/60 mt-1.5 relative overflow-hidden">
              <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500 ease-out" />
            </div>
          </button>
        </div>
      </section>

      {/* Render modal directly into document.body via Portal to escape parent CSS transforms */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {isModalOpen && (
                <motion.div
                  className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-2xl [perspective:1200px]"
                  onClick={() => setIsModalOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-950/95 border border-white/20 rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_25px_100px_-15px_rgba(0,0,0,0.95)] backdrop-blur-3xl p-6 sm:p-10 md:p-14"
                    initial={{ opacity: 0, scale: 0.8, y: 70, rotateX: 12, filter: "blur(16px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.85, y: 40, rotateX: -8, filter: "blur(12px)" }}
                    transition={{
                      type: "spring",
                      damping: 24,
                      stiffness: 280,
                      mass: 0.8
                    }}
                  >
                    {/* Pulsing Ambient Spotlight */}
                    <motion.div
                      className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-full blur-3xl pointer-events-none"
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.3, 0.6, 0.3],
                        rotate: [0, 90, 0]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Close Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(false)}
                      aria-label="Close modal"
                      className="absolute top-5 right-5 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full transition-all duration-200 z-50 cursor-pointer border border-white/15 hover:border-white/40 flex items-center gap-2 text-xs font-medium tracking-wider uppercase select-none shadow-lg"
                    >
                      <span>Close</span>
                      <X size={15} className="text-white" />
                    </motion.button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 relative z-10">

                      {/* Left Column */}
                      <div className="flex flex-col justify-between gap-8">
                        <motion.div
                          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className="flex flex-col gap-4"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                            {inquiryTitle || "INQUIRIES"}
                          </span>
                          <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white font-display leading-[1.1]">
                            Let's shape your idea.
                          </h3>
                          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                            {inquiryText || "For new projects, collaborations, and partnership questions:"}
                          </p>
                        </motion.div>

                        {email ? (
                          <motion.div
                            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col gap-2"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                              DIRECT EMAIL
                            </span>
                            <div className="flex items-center gap-3 flex-wrap">
                              <a
                                href={`mailto:${email}`}
                                className="inline-flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-white hover:text-white/70 transition-colors border-b border-white/20 pb-1.5 group"
                              >
                                {email}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                              </a>
                              <button
                                onClick={handleCopyEmail}
                                title="Copy email to clipboard"
                                className="text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                {copied ? (
                                  <>
                                    <Check size={14} className="text-emerald-400" />
                                    <span className="text-emerald-400 font-medium">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        ) : null}
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col gap-8 justify-between md:border-l md:border-white/10 md:pl-10">

                        {/* Office Info */}
                        {(officeTitle || officeLine1 || officeLine2 || officeLine3) ? (
                          <motion.div
                            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {officeTitle ? (
                              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block">
                                {officeTitle}
                              </span>
                            ) : null}
                            <p className="text-white/80 text-sm leading-relaxed font-light">
                              {[officeLine1, officeLine2, officeLine3].filter(Boolean).map((line, idx, arr) => (
                                <React.Fragment key={idx}>
                                  {line}
                                  {idx < arr.length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          </motion.div>
                        ) : null}

                        {/* Socials */}
                        <motion.div
                          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="flex flex-col gap-3"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1 block">
                            FIND US
                          </span>
                          <div className="flex flex-col gap-2.5">
                            {socials.map((social, i) => (
                              <motion.a
                                key={social.name}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35, delay: 0.35 + i * 0.06, ease: "easeOut" }}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors group"
                              >
                                <span>{social.name}</span>
                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </motion.a>
                            ))}
                          </div>
                        </motion.div>

                      </div>

                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
}
