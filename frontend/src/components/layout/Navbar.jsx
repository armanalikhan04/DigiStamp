function Navbar({ onMenuClick }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#2563EB] hover:text-[#1E3A8A] lg:hidden"
          >
            <span className="block h-0.5 w-5 rounded-full bg-current before:block before:h-0.5 before:w-5 before:-translate-y-1.5 before:rounded-full before:bg-current before:content-[''] after:block after:h-0.5 after:w-5 after:translate-y-1 after:rounded-full after:bg-current after:content-['']" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#1E3A8A] sm:text-xl">
              DigiStamp
            </h1>
            <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
              AI-powered digital agreement platform
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
            Secure session
          </div>

          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-700">Welcome, Arman</p>
            <p className="text-xs text-slate-500">Verified workspace</p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A8A] text-sm font-bold text-white shadow-sm sm:h-11 sm:w-11">
            A
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
