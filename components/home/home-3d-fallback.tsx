'use client'

export default function Home3DFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-primary" role="presentation">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(var(--color-accent),0.16),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(var(--color-secondary),0.08),transparent_64%)]" />
      <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/15 motion-safe:animate-[spin_16s_linear_infinite] lg:h-[26rem] lg:w-[26rem]" />
      <div className="absolute left-1/2 top-1/2 h-[13rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/20 motion-safe:animate-[spin_10s_linear_infinite_reverse] lg:h-[18rem] lg:w-[18rem]" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-secondary/55">
        Loading interactive visual
      </div>
    </div>
  )
}
