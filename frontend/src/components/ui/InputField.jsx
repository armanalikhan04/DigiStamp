function InputField({
  as = "input",
  label,
  hint,
  className = "",
  inputClassName = "",
  children,
  ...props
}) {
  const Field = as;

  return (
    <label className={`block min-w-0 ${className}`}>
      {label && (
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </span>
      )}
      <Field
        className={`block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 ${inputClassName}`}
        {...props}
      >
        {children}
      </Field>
      {hint && <span className="mt-2 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export default InputField;
