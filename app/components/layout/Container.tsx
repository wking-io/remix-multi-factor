import type { ComponentPropsWithoutRef } from "react";
import type { Tag } from "~/types";

export default function Container<TTag extends Tag = "div">({
  as,
  className,
  children,
  maxWidth = "max-w-7xl",
  ...props
}: { as?: TTag } & ComponentPropsWithoutRef<TTag> & { maxWidth?: string }) {
  const Wrapper = as || "div";
  return (
    <Wrapper
      {...props}
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidth} ${
        className ?? ""
      }`}
    >
      {children}
    </Wrapper>
  );
}
