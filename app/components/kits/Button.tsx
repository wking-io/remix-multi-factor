import type { ComponentPropsWithRef } from "react";
import Action from "~/components/impl/Action";

type Variant = {
  variant?: keyof typeof variants;
};

const variants = {
  red: {
    wrapper: "border-red-900 bg-red-600 hover:bg-red-800",
    body: "bg-red-400 text-white",
  },
  orange: {
    wrapper: "border-orange-900 bg-orange-600 hover:bg-orange-800",
    body: "bg-orange-400 text-white",
  },
  cyan: {
    wrapper: "border-cyan-900 bg-cyan-600 hover:bg-cyan-800",
    body: "bg-cyan-400 text-white",
  },
  sky: {
    wrapper: "border-sky-900 bg-sky-600 hover:bg-sky-800",
    body: "bg-sky-400 text-white",
  },
  blue: {
    wrapper: "border-blue-900 bg-blue-600 hover:bg-blue-800",
    body: "bg-blue-400 text-white",
  },
} as const;

const baseClasses =
  "block rounded-[10px] border-[3px] pb-1 transition-all hover:pb-0 hover:pt-1";

export default function Button({
  children,
  variant = "orange",
  className,
  ...props
}: ComponentPropsWithRef<typeof Action> & Variant) {
  const { wrapper, body } = variants[variant];
  return (
    <Action
      {...props}
      className={`${baseClasses} ${wrapper} ${className ?? ""}`}
    >
      <div
        className={`${body} flex items-center justify-center rounded-lg py-2 px-4 text-sm font-bold`}
      >
        {children}
      </div>
    </Action>
  );
}
