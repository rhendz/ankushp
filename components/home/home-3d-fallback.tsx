'use client'

export default function Home3DFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-primary" role="presentation">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(var(--color-accent),0.18),transparent_56%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_64%,rgba(var(--color-secondary),0.11),transparent_67%)]" />

      <div className="absolute inset-0 opacity-70 mix-blend-screen">
        <div className="hero-visual-shape absolute left-1/2 top-[44%] h-[21rem] w-[21rem] -translate-x-[58%] -translate-y-1/2 rounded-[45%] bg-[rgba(var(--color-accent),0.16)] blur-[2px] motion-safe:animate-[hero-drift_14s_ease-in-out_infinite] lg:h-[30rem] lg:w-[30rem]" />
        <div className="hero-visual-shape absolute left-1/2 top-[53%] h-[17rem] w-[17rem] -translate-x-[18%] -translate-y-1/2 rounded-[42%] bg-[rgba(var(--color-secondary),0.12)] blur-[1px] motion-safe:animate-[hero-drift-reverse_11s_ease-in-out_infinite] lg:h-[24rem] lg:w-[24rem]" />
        <div className="hero-visual-shape absolute left-1/2 top-[50%] h-[14rem] w-[14rem] -translate-x-[2%] -translate-y-1/2 rounded-[40%] border border-secondary/20 motion-safe:animate-[hero-pulse_8s_ease-in-out_infinite] lg:h-[19rem] lg:w-[19rem]" />
      </div>

      <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/20 motion-safe:animate-[spin_20s_linear_infinite] lg:h-[27rem] lg:w-[27rem]" />
      <div className="absolute left-1/2 top-1/2 h-[13rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/25 motion-safe:animate-[spin_13s_linear_infinite_reverse] lg:h-[18rem] lg:w-[18rem]" />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.24em] text-secondary/55">
        Interactive Visual
      </div>
    </div>
  )
}
