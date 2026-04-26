"use client";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export default function SismobButton({
  children,
  loading,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    secondary: "bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-gray-100",
    danger:
      "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-red-100",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        relative flex items-center justify-center gap-2 
        px-8 py-4 rounded-2xl font-black transition-all 
        active:scale-95 disabled:opacity-50 shadow-xl
        ${variants[variant]} ${props.className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span className="text-[10px] uppercase tracking-widest">
            Processando
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
