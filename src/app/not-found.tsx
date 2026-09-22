import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-6 py-24 bg-background text-foreground">
      <div className="max-w-md w-full text-center flex flex-col items-center">
        <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          [ 404 ]
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-foreground mb-3">
          Page not found
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed font-sans">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-medium text-xs transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2.5 rounded-full border border-border text-foreground font-medium text-xs hover:bg-muted transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/sitemap.xml"
            className="inline-flex items-center px-4 py-2.5 rounded-full border border-border text-foreground font-medium text-xs hover:bg-muted transition-colors"
          >
            Sitemap
          </Link>
          <Link
            href="/llms.txt"
            className="inline-flex items-center px-4 py-2.5 rounded-full border border-border text-foreground font-medium text-xs hover:bg-muted transition-colors"
          >
            llms.txt
          </Link>
        </div>
      </div>
    </div>
  );
}
