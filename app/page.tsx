import Link from 'next/link'

const modules = [
  {
    title: 'Expiry management',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 9h16" />
        <path d="M12 12v4l2.5 1.5" />
      </svg>
    ),
  },
  {
    title: 'ED Project document',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M10 12h5M10 16h5" />
      </svg>
    ),
  },
  {
    title: 'Temperature monitoring system',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 5a2 2 0 0 1 4 0v8.2a4.5 4.5 0 1 1-4 0z" />
        <path d="M12 8v8" />
        <path d="M17.5 6.5c1 .4 1.8 1.2 2.2 2.2M18 3c1.8.7 3.3 2.2 4 4" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_34%),linear-gradient(145deg,#f8fbff_0%,#eef5ff_52%,#e4efff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-7 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0b2d62] text-white shadow-[0_10px_30px_rgba(11,45,98,0.18)]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.01em] text-[#0b2d62] sm:text-base">
                Pharmacy Management Program
              </p>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="rounded-xl bg-[#0b2d62] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,45,98,0.2)] transition hover:bg-[#123e7d] focus:outline-none focus:ring-2 focus:ring-[#0b2d62]/30 focus:ring-offset-2"
          >
            Sign in
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-14 sm:py-16 lg:py-20">
          <div className="mb-10 max-w-2xl sm:mb-12">
            <div className="mb-5 h-1.5 w-14 rounded-full bg-[#1d4f91]" />
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#071d42] sm:text-5xl lg:text-6xl">
              Pharmacy Management Program
            </h1>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {modules.map((module) => (
              <Link
                key={module.title}
                href="/auth/login"
                className="group flex min-h-56 flex-col justify-between rounded-[28px] border border-white/80 bg-white/75 p-7 shadow-[0_18px_50px_rgba(13,52,100,0.09)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(13,52,100,0.14)] focus:outline-none focus:ring-2 focus:ring-[#1d4f91]/30"
              >
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#eaf2ff] text-[#1556a8] transition group-hover:bg-[#0b2d62] group-hover:text-white">
                  {module.icon}
                </div>

                <div className="flex items-end justify-between gap-4">
                  <h2 className="max-w-[85%] text-xl font-semibold leading-snug tracking-[-0.02em] text-[#0a2550]">
                    {module.title}
                  </h2>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d9e7fb] text-[#1556a8] transition group-hover:border-[#0b2d62] group-hover:bg-[#0b2d62] group-hover:text-white">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
