import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/queries";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://talhairfandev.me";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "talhairfandev — Talha Irfan | Full-Stack Web Developer & Creative Engineer",
    template: "%s | talhairfandev",
  },
  description:
    "Official portfolio of talhairfandev (Talha Irfan) — Full-Stack Web Developer & Creative Engineer specializing in Next.js, React, Node.js, and Supabase. Building high-performance, modern web applications.",
  keywords: [
    "talhairfandev",
    "Talha Irfan",
    "talhairfandev portfolio",
    "Talha Irfan Web Developer",
    "talhairfandev.me",
    "Full-Stack Web Developer",
    "Creative Engineer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "Supabase Developer",
    "TypeScript Developer",
    "Frontend Engineer",
    "Web Developer Portfolio",
    "UI/UX Web Developer",
  ],
  authors: [{ name: "Talha Irfan (talhairfandev)", url: siteUrl }],
  creator: "Talha Irfan",
  publisher: "talhairfandev",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "talhairfandev — Talha Irfan",
    title: "talhairfandev — Talha Irfan | Full-Stack Web Developer & Creative Engineer",
    description:
      "Official portfolio of talhairfandev (Talha Irfan) — Full-Stack Web Developer & Creative Engineer specializing in Next.js, React, Node.js, and Supabase.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "talhairfandev — Talha Irfan Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "talhairfandev — Talha Irfan | Full-Stack Web Developer",
    description:
      "Full-Stack Web Developer & Creative Engineer specializing in Next.js, React, Node.js, and Supabase.",
    images: ["/api/og"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "llms-txt": `${siteUrl}/llms.txt`,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["WebSite", "Brand"],
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "talhairfandev",
      alternateName: [
        "Talha Irfan",
        "Talha Irfan — Portfolio",
        "talhairfandev portfolio",
        "talhairfandev.me",
        "Talha Irfan Dev"
      ],
      headline: "talhairfandev — Personal Brand & Portfolio of Talha Irfan",
      description: "Official portfolio and personal brand of Talha Irfan (talhairfandev) — Full-Stack Web Developer & Creative Engineer specializing in Next.js, React, TypeScript, and Supabase.",
      inLanguage: "en-US",
      sameAs: [
        "https://github.com/talhairfandev",
        "https://www.linkedin.com/in/talha-irfan-a98808252/",
        "https://x.com/talhafrompak",
        "https://www.instagram.com/talhairfandev"
      ],
      publisher: {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Talha Irfan",
        alternateName: "talhairfandev",
        jobTitle: "Full-Stack Web Developer & Creative Engineer",
        url: siteUrl,
      },
      creator: {
        "@id": `${siteUrl}/#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Talha Irfan",
      alternateName: ["talhairfandev", "Talha Irfan Portfolio", "Talha Irfan Web Developer", "Talha Irfan Dev"],
      url: siteUrl,
      email: "mailto:talhairfan.dev@gmail.com",
      jobTitle: "Full-Stack Web Developer & Creative Engineer",
      brand: {
        "@id": `${siteUrl}/#website`,
      },
      sameAs: [
        "https://github.com/talhairfandev",
        "https://www.linkedin.com/in/talha-irfan-a98808252/",
        "https://x.com/talhafrompak",
        "https://www.instagram.com/talhairfandev"
      ],
      knowsAbout: [
        "Next.js",
        "React",
        "Node.js",
        "TypeScript",
        "Supabase",
        "Tailwind CSS",
        "Web Development",
        "Frontend Engineering",
        "Creative Development",
        "GSAP",
        "Framer Motion"
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Web Development Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Full-Stack Web Application Development",
              description: "Building production-ready, scalable web applications with Next.js, React, Node.js, and Supabase.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Frontend Architecture & Animated Experiences",
              description: "Crafting modern user interfaces with Framer Motion, GSAP, Tailwind CSS, and responsive layouts.",
            },
          },
        ],
      },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profilepage`,
      url: siteUrl,
      name: "talhairfandev — Talha Irfan Portfolio",
      mainEntity: {
        "@id": `${siteUrl}/#person`,
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const defaultTheme = settings?.default_theme || "light";

  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preconnect & DNS-Prefetch to essential origins */}
        <link rel="preconnect" href="https://fregldukggdkbemysbho.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fregldukggdkbemysbho.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('portfolio-visited') === 'true') {
                  document.documentElement.classList.add('visited');
                }
              } catch (e) {}
              try {
                const savedTheme = localStorage.getItem('portfolio-theme');
                const theme = savedTheme || '${defaultTheme}';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="relative antialiased bg-background text-foreground overflow-x-hidden font-sans"
      >
        <ThemeProvider defaultTheme={defaultTheme}>
          <div className="relative min-h-screen w-full">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
