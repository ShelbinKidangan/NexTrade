import Link from "next/link";
import {
  ArrowRight, Search, Sparkles, ShieldCheck, MessageSquare, FileText,
  Globe, Zap, BadgeCheck, Star, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Search,
    title: "AI-powered discovery",
    desc: "Find suppliers and partners with natural language. Semantic search over verified business catalogs.",
  },
  {
    icon: FileText,
    title: "Smart RFQs",
    desc: "Describe what you need. AI drafts structured RFQs and auto-matches you with the best-fit businesses.",
  },
  {
    icon: Sparkles,
    title: "AI catalog builder",
    desc: "Upload a PDF brochure. Claude extracts products, specs, and pricing into publishable listings.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & verification",
    desc: "Document-verified businesses, trust scores, and review-backed reputation on every profile.",
  },
  {
    icon: MessageSquare,
    title: "Real-time messaging",
    desc: "Thread conversations per RFQ, per order, or as general chat — with read receipts and attachments.",
  },
  {
    icon: Globe,
    title: "Cross-border ready",
    desc: "Currencies, delivery regions, and certifications surface naturally — no locked-in ecosystems.",
  },
];

const stats = [
  { label: "Verified businesses", value: "12,400+" },
  { label: "Countries represented", value: "48" },
  { label: "RFQs matched / month", value: "3,200" },
  { label: "Avg. response time", value: "4h" },
];

const testimonials = [
  {
    quote:
      "We replaced three legacy supplier directories with NexTrade. The AI matching alone saves our procurement team about 10 hours a week.",
    name: "Priya Ramaswamy",
    role: "Head of Procurement, FastPack Industries",
  },
  {
    quote:
      "Our first ten connections here turned into actual orders within a month. That never happened on IndiaMART or Alibaba.",
    name: "Rahul Desai",
    role: "CEO, Acme Metals Pvt. Ltd.",
  },
  {
    quote:
      "The verified badge and trust score give us credibility we never had as a mid-size supplier. It levels the playing field.",
    name: "Sunita Menon",
    role: "Director, TextileHub Exports",
  },
];

const logoRow = [
  "Acme Metals", "FastPack", "SteelWorks", "ElectroCore",
  "LogistiX", "Robotica", "SolarGrid", "MedEquip",
];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold">
              N
            </div>
            NexTrade
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link href="#features" className="px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors">Features</Link>
            <Link href="/search" className="px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors">Discover</Link>
            <a href="#features" className="px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              Get started <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent-subtle)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 lg:pt-24 lg:pb-28 text-center">
          <Badge variant="outline" className="gap-1 mb-4">
            <Sparkles className="size-3 text-accent" /> AI-native B2B network
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
            Where businesses find <span className="text-accent">each other.</span>
          </h1>
          <p className="mt-5 text-base lg:text-lg text-foreground-secondary max-w-2xl mx-auto">
            NexTrade is the LinkedIn for companies. Build a verified profile, list your catalog,
            discover partners with AI, and transact — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/register" />}>
              Create a free profile <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/search" />}>
              Explore businesses
            </Button>
          </div>
          <p className="mt-4 text-xs text-foreground-tertiary">
            No credit card required · Public profiles · 14-day Pro trial
          </p>

          {/* Search preview */}
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-card shadow-xl">
              <div className="h-9 border-b border-border px-3 flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-danger/60" />
                <div className="size-2.5 rounded-full bg-warning/60" />
                <div className="size-2.5 rounded-full bg-success/60" />
                <div className="flex-1 text-center text-[11px] text-foreground-tertiary">
                  nextrade.app / discover
                </div>
              </div>
              <div className="p-6">
                <div className="rounded-lg border border-border bg-background-secondary p-4 flex items-center gap-3 text-left">
                  <Search className="size-5 text-accent shrink-0" />
                  <div className="flex-1 text-sm text-foreground-secondary">
                    &quot;CNC machining, small batch, ISO 9001, ships to EU&quot;
                  </div>
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="size-3" /> AI
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-left">
                  {[
                    { name: "Acme Metals", score: 4.9, city: "Mumbai", verified: true },
                    { name: "PrecisionCast", score: 4.1, city: "Rajkot", verified: false },
                    { name: "SteelWorks Global", score: 4.6, city: "Pune", verified: true },
                  ].map((b) => (
                    <div
                      key={b.name}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex size-9 items-center justify-center rounded-md bg-background-secondary text-sm font-semibold text-foreground-secondary">
                          {b.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium truncate">{b.name}</span>
                            {b.verified && <BadgeCheck className="size-3 text-accent" />}
                          </div>
                          <div className="text-[10px] text-foreground-tertiary">{b.city}, IN</div>
                          <div className="flex items-center gap-0.5 text-[10px] text-foreground-secondary mt-0.5">
                            <Star className="size-2.5 fill-warning text-warning" /> {b.score}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo row */}
      <section className="border-y border-border bg-background-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-xs text-foreground-tertiary uppercase tracking-wide mb-4">
            Trusted by verified businesses across industries
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {logoRow.map((name) => (
              <span key={name} className="text-sm font-semibold text-foreground-tertiary">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">What you get</Badge>
          <h2 className="text-3xl font-semibold">Built for how businesses actually trade</h2>
          <p className="mt-3 text-sm text-foreground-secondary max-w-2xl mx-auto">
            No spam leads, no legacy directories, no locked ecosystems. Every company is a peer
            — list your catalog, get matched, negotiate, and transact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-border-strong hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent-subtle text-accent mb-3">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-base font-medium">{f.title}</h3>
              <p className="text-sm text-foreground-secondary mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-background-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-semibold">{s.value}</div>
                <div className="text-xs text-foreground-secondary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">How it works</Badge>
          <h2 className="text-3xl font-semibold">From registration to first order in days</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              n: "01",
              icon: Users,
              title: "Create your profile",
              desc: "Register your business, upload your logo, and auto-generate your catalog from a PDF brochure.",
            },
            {
              n: "02",
              icon: Zap,
              title: "Get discovered",
              desc: "AI matches your capabilities to buyers actively searching for exactly what you offer.",
            },
            {
              n: "03",
              icon: TrendingUp,
              title: "Transact & grow",
              desc: "Negotiate quotes, fulfill orders, earn reviews — and watch your trust score climb.",
            },
          ].map((step) => (
            <div key={step.n} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                  <step.icon className="size-5" />
                </div>
                <span className="font-heading text-2xl font-semibold text-foreground-tertiary">
                  {step.n}
                </span>
              </div>
              <h3 className="text-base font-medium">{step.title}</h3>
              <p className="text-sm text-foreground-secondary mt-2 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-background-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Loved by teams</Badge>
            <h2 className="text-3xl font-semibold">What early customers say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-6 flex flex-col"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="size-3.5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground-secondary leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-foreground-tertiary">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
          Ready to find your next partner?
        </h2>
        <p className="mt-3 text-sm text-foreground-secondary max-w-lg mx-auto">
          Join thousands of businesses building verified profiles and trading on NexTrade.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/register" />}>
            Create your profile <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            I already have an account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-heading font-semibold">
                <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-white text-xs font-bold">
                  N
                </div>
                NexTrade
              </div>
              <p className="text-xs text-foreground-secondary mt-2 max-w-xs">
                AI-native B2B platform — where businesses find each other.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Discover", "Pricing", "Roadmap"] },
              { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
              { title: "Resources", links: ["Docs", "Blog", "Help center", "Status"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-medium mb-3">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-xs text-foreground-secondary hover:text-foreground">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-foreground-tertiary">
              © 2026 NexTrade. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-foreground-tertiary">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
