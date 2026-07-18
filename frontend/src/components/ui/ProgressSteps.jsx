function ProgressSteps({ steps = [], current = 0 }) {
  return (
    <div
      className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 md:[grid-template-columns:repeat(var(--step-count),minmax(0,1fr))]"
      style={{ "--step-count": steps.length }}
    >
      {steps.map((step, index) => {
        const isActive = index === current;
        const isDone = index < current;

        return (
          <div key={step} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isDone || isActive
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-white text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {index + 1}
            </span>
            <span className={`text-sm font-semibold ${isActive ? "text-[#1E3A8A]" : "text-slate-600"}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ProgressSteps;
