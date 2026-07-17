function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
