import dynamic from "next/dynamic";
import { SectionParallax } from "@/components/SectionParallax";

const Hero = dynamic(() => import("@/components/Hero"));
const About = dynamic(() => import("@/components/About"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const Works = dynamic(() => import("@/components/Works"));
const Services = dynamic(() => import("@/components/Services"));
const Process = dynamic(() => import("@/components/Process"));
const Supasection = dynamic(() => import("@/components/Supasection"));
const Reachus = dynamic(() => import("@/components/Reachus"));
import {
  type HomepageSectionKey,
} from "@/lib/admin/homepageSections";
import {
  getHero,
  getAbout,
  getHomepageSectionOrder,
  getWorks,
  getWorksMeta,
  getServices,
  getServicesMeta,
  getProcessSteps,
  getProcessMeta,
  getReachus,
  getWhyChooseUs,
  getSupasection,
} from "@/lib/queries";

export const revalidate = 604800; // 7 days in seconds

export default async function Home() {
  // Fetch all sections in parallel
  const [
    hero,
    about,
    why,
    works,
    worksMeta,
    services,
    servicesMeta,
    processSteps,
    processMeta,
    supasection,
    reachus,
    sectionOrder,
  ] = await Promise.all([
    getHero(),
    getAbout(),
    getWhyChooseUs(),
    getWorks(),
    getWorksMeta(),
    getServices(),
    getServicesMeta(),
    getProcessSteps(),
    getProcessMeta(),
    getSupasection(),
    getReachus(),
    getHomepageSectionOrder(),
  ]);

  const sectionContent = {
    hero: <Hero data={hero} />,
    about: <About data={about} />,
    why: <WhyChooseUs data={why} />,
    works: (
      <Works
        data={works}
        featuredCount={worksMeta.featured_count}
        showViewAll={true}
        label={worksMeta.homepage_label}
        heading={worksMeta.homepage_heading}
      />
    ),
    services: <Services data={services} meta={servicesMeta} />,
    process: <Process data={processSteps} meta={processMeta} />,
    supasection: <Supasection data={supasection} />,
    reachus: <Reachus data={reachus} />,
  } as const;

  const strengthByKey = {
    hero: 80,
    about: 100,
    why: 0,
    works: 0,
    services: 45,
    process: 45,
    supasection: 0,
    reachus: 30,
  } as const;

  const classNameByKey = {
    hero: undefined,
    about: "cv-auto",
    why: "cv-auto",
    works: undefined,
    services: "cv-auto",
    process: "cv-auto",
    supasection: undefined,
    reachus: "cv-auto",
  } as const;

  return (
    <div className="flex flex-col">
      {/* Semantic Server-Rendered Content for AI Agents, Screen Readers, and No-JS Crawlers */}
      <section className="sr-only" aria-label="Portfolio Summary and Structured Content">
        <header>
          <h1>talhairfandev — Talha Irfan | Full-Stack Web Developer & Creative Engineer</h1>
          <p>
            Welcome to the official portfolio and personal brand of talhairfandev (Talha Irfan), a full-stack web developer and creative software engineer specializing in Next.js, React, TypeScript, Supabase, and high-performance interactive user interfaces. Crafting bespoke web applications, scalable digital products, and brand-first visual systems for forward-thinking clients worldwide.
          </p>
        </header>

        <article>
          <h2>About Talha Irfan</h2>
          <p>
            {about?.description || "Senior full-stack developer blending software engineering rigor with refined visual art direction. Specialized in building fast, accessible, and conversion-focused web applications with modern web technologies including Next.js App Router, React 19, TypeScript, Node.js, and Supabase PostgreSQL."}
          </p>
          <p>
            With over five years of dedicated experience delivering digital products, Talha crafts resilient full-stack systems with a focus on code maintainability, serverless scaling, and sub-second performance. Every project is approached with an architecture-first mindset, ensuring clean separations between UI components, database operations, and external API integrations.
          </p>
        </article>

        <article>
          <h2>Core Technologies & Architecture Standards</h2>
          <p>Modern engineering stack selected for speed, developer ergonomics, and rock-solid production reliability:</p>
          <ul>
            <li><strong>Frontend Architecture:</strong> Next.js App Router, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide Icons.</li>
            <li><strong>Interactive Motion & 3D:</strong> GSAP (GreenSock Animation Platform), ScrollTrigger, Framer Motion, Lenis Smooth Scroll, HTML5 Canvas, WebGL.</li>
            <li><strong>Backend & Cloud Database:</strong> Supabase, PostgreSQL, Row-Level Security (RLS) policies, Server Actions, Next.js Edge Middleware, REST & GraphQL APIs.</li>
            <li><strong>Performance & SEO Engineering:</strong> Static Site Generation (SSG), Incremental Static Regeneration (ISR), WebP/AVIF image optimization, Structured Data (JSON-LD), Agentic Discovery protocols (llms.txt, Markdown content negotiation).</li>
          </ul>
        </article>

        <article>
          <h2>Services & Technical Capabilities</h2>
          <p>Comprehensive digital services from conceptual discovery and design systems to full-stack implementation and launch optimization.</p>
          <ul>
            {services.map((svc) => (
              <li key={svc.id}>
                <h3>{svc.title}</h3>
                <p>{svc.description}</p>
                {svc.tags && svc.tags.length > 0 && (
                  <p>Key Deliverables: {svc.tags.join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Featured Works & Case Studies</h2>
          <p>A curated selection of modern digital experiences, e-commerce architectures, and SaaS applications delivered with precision and performance.</p>
          <ul>
            {works.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>Client / Domain: {item.client}</p>
                <p>{item.summary}</p>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Development Process</h2>
          <p>A proven, four-step engineering methodology engineered for reliability, transparency, and rapid delivery.</p>
          <ol>
            {processSteps.map((step) => (
              <li key={step.id}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </article>

        <article>
          <h2>Why Choose Talha Irfan</h2>
          <p>
            {why?.testimonial_text || "Partnering with ambitious founders and engineering teams to transform bold ideas into robust, high-performance digital products that scale seamlessly and convert visitors into long-term customers."}
          </p>
          <p>
            Revenue Impact: {why?.revenue_stat} {why?.revenue_label}. Scale: {why?.scale_stat} {why?.scale_description}.
          </p>
          <p>
            Clients receive clean, well-tested TypeScript code, comprehensive Git revision history, modular component structures, and thorough deployment documentation.
          </p>
        </article>

        <footer>
          <h2>Contact & Availability</h2>
          <p>
            Available for select freelance contracts, technical consulting, and full-stack development engagements worldwide.
          </p>
          <p>Official Website: https://talhairfandev.me</p>
          <p>Contact Form: https://talhairfandev.me/#contact</p>
          <p>Email: talhairfan.dev@gmail.com</p>
          <p>GitHub: https://github.com/talhairfandev</p>
          <p>LinkedIn: https://www.linkedin.com/in/talha-irfan-a98808252/</p>
          <p>Twitter / X: https://x.com/talhafrompak</p>
          <p>Instagram: https://www.instagram.com/talhairfandev</p>
        </footer>
      </section>

      {sectionOrder.map((key: HomepageSectionKey, index: number) => (
        <SectionParallax
          key={key}
          zIndex={10 + index}
          strength={strengthByKey[key]}
          className={classNameByKey[key]}
        >
          {sectionContent[key]}
        </SectionParallax>
      ))}
    </div>
  );
}

