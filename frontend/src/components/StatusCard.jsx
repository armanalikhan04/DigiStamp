function StatusCard({ label, value, description, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-[#1E3A8A]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone]}`}>
        {label}
      </div>
      <p className="text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default StatusCard;
