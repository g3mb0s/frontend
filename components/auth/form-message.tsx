interface FormMessageProps {
  type: "error" | "success";
  children: string;
}

export function FormMessage({ type, children }: FormMessageProps) {
  const className =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <p className={`rounded-md border px-3 py-2 text-sm leading-5 ${className}`}>
      {children}
    </p>
  );
}
