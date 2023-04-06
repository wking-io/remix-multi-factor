import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import type {
  ComponentPropsWithoutRef,
  FC,
  PropsWithChildren,
  SVGProps,
} from "react";

type Flash = {
  message: string;
  kind: "error" | "info" | "success" | "warning";
};

const flashMessageIcons: Record<
  Flash["kind"],
  FC<PropsWithChildren<SVGProps<SVGSVGElement>>>
> = {
  error: XCircleIcon,
  info: ExclamationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
};

const flashMessageClassNames: Record<Flash["kind"], [string, string]> = {
  error: ["text-danger-800", "bg-danger"],
  info: ["text-info-800", "bg-info"],
  success: ["text-success-800", "bg-success"],
  warning: ["text-warning-700", "bg-warning"],
};

/**
 * Displays flash messages
 */
export function FlashMessage({
  message,
  kind,
}: Flash & ComponentPropsWithoutRef<"div">) {
  const Icon = flashMessageIcons[kind];
  const [iconClass, bgClass] = flashMessageClassNames[kind];

  return (
    <div className={`rounded-lg text-white shadow ${bgClass}`}>
      <div className="relative flex flex-row px-4">
        <Icon className={`mt-3 h-6 w-6 shrink-0 ${iconClass}`} />
        <div className="h-full flex-auto p-3">{message}</div>
      </div>
    </div>
  );
}

export type TKeyedFlash = { key: string; flash: Flash };

export function KeyedFlash({
  flashKey,
  flash,
  ...props
}: {
  flashKey: string;
  flash?: TKeyedFlash;
} & ComponentPropsWithoutRef<"div">) {
  return flash && flashKey === flash.key ? (
    <FlashMessage {...props} {...flash.flash} />
  ) : null;
}
