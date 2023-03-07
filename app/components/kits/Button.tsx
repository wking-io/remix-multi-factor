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
  lime: {
    wrapper: "border-lime-900 bg-lime-600 hover:bg-lime-800",
    body: "bg-lime-400 text-white",
  },
  limeAlt: {
    wrapper: "border-lime-900 bg-lime-300 hover:bg-lime-400",
    body: "bg-lime-200 text-lime-900",
  },
  teal: {
    wrapper: "border-teal-900 bg-teal-600 hover:bg-teal-800",
    body: "bg-teal-400 text-white",
  },
  tealAlt: {
    wrapper: "border-teal-900 bg-teal-300 hover:bg-teal-400",
    body: "bg-teal-200 text-teal-900",
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
  indigo: {
    wrapper: "border-indigo-900 bg-indigo-600 hover:bg-indigo-800",
    body: "bg-indigo-400 text-white",
  },
  indigoAlt: {
    wrapper: "border-indigo-900 bg-indigo-300 hover:bg-indigo-400",
    body: "bg-indigo-200 text-indigo-900",
  },
  pink: {
    wrapper: "border-pink-900 bg-pink-600 hover:bg-pink-800",
    body: "bg-pink-400 text-white",
  },
  pinkAlt: {
    wrapper: "border-pink-900 bg-pink-300 hover:bg-pink-400",
    body: "bg-pink-200 text-pink-900",
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
