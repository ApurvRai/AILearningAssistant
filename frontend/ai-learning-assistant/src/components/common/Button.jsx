import React from "react";

const Button = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  size = "md",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100 whitespace-nowrap";

  const variantStyles = {
    primary:
      "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline:
      "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  };

  const sizeStyles = {
    sm: "px-4 h-9 text-xs",
    md: "px-5 h-11 text-sm",
  };

  return (
    <button
      type={type}
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
