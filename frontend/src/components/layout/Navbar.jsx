function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E3A8A]">
            DigiStamp
          </h1>
          <p className="text-xs font-medium text-slate-500">
            AI-powered digital agreement platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
            Secure session
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-700">Welcome, Arman</p>
            <p className="text-xs text-slate-500">Verified workspace</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A8A] text-sm font-bold text-white shadow-sm">
            A
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
