const variants = {
  primary: "bg-[#1E3A8A] text-white hover:bg-[#172f72] shadow-blue-900/10",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:border-[#2563EB] hover:text-[#1E3A8A]",
  success: "bg-[#10B981] text-white hover:bg-emerald-600 shadow-emerald-900/10",
  warning: "bg-[#F59E0B] text-white hover:bg-amber-600 shadow-amber-900/10",
  danger: "bg-[#EF4444] text-white hover:bg-red-600 shadow-red-900/10",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
