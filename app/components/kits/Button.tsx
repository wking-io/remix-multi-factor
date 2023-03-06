import type { ComponentPropsWithRef } from "react";
import Action from "~/components/impl/Action";

type Variant = {
  variant?: keyof typeof variants;
};

const variants = {
  orange: {
    wrapper: "border-orange-900 bg-orange-600 hover:bg-orange-800",
    body: "bg-orange-400 text-white",
  },
} as const;

const baseClasses =
  "rounded-[10px] border-[3px] pb-1 transition-all hover:pb-0 hover:pt-1";

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
        className={`${body} flex items-center rounded-lg py-2 px-4 text-sm font-bold`}
      >
        {children}
      </div>
    </Action>
  );
}
