import { Link, LinkProps } from "@remix-run/react";
import { PropsWithChildren } from "react";
import { PropsWithClassName } from "~/types";

export default function Panel({
  children,
  color = "border-emerald-900 bg-emerald-200 text-emerald-900",
  className,
}: PropsWithChildren<PropsWithClassName<{ color?: string }>>) {
  return (
    <div className={`${className} ${color} rounded-[20px] border-[3px] pb-2`}>
      {children}
    </div>
  );
}

export function PanelLink({
  children,
  color = "border-emerald-900 bg-emerald-200 text-emerald-900",
  className,
  ...props
}: PropsWithChildren<PropsWithClassName<{ color?: string } & LinkProps>>) {
  return (
    <Link
      className={`${className} ${color} rounded-[20px] border-[3px] pb-2 transition-all hover:pb-0 hover:pt-2`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function PanelBody({
  children,
  className = "bg-white",
}: PropsWithChildren<PropsWithClassName<{}>>) {
  return <div className={`${className} rounded-2xl`}>{children}</div>;
}
