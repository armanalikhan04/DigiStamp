const variants = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  primary: "bg-blue-50 text-[#1E3A8A] ring-blue-100",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  danger: "bg-red-50 text-red-700 ring-red-100",
};

function StatusBadge({ children, variant = "default", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default StatusBadge;
