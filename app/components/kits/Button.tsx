import type { ComponentPropsWithRef } from "react"
import Action from "~/components/impl/Action"

type Variant = {
	variant?: keyof typeof variants
}

const variants = {
	primary:
		"border-transparent text-white bg-brand hover:bg-brand-dark focus:ring-brand-500/50 hover:shadow-lg",
	secondary:
		"border-transparent text-white bg-brand-dark hover:bg-brand focus:ring-brand/50 hover:shadow-lg",
	danger:
		"border-transparent text-white bg-danger hover:bg-danger-hover focus:ring-danger/50",
	ghost:
		"border-transparent bg-brand-light/30 text-brand hover:bg-brand-light/40",
} as const

const baseClasses =
	"flex items-center gap-2 font-display font-semibold inline-flex justify-center items-center px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 select-none disabled:bg-opacity-60 disabled:pointer-events-none transition"

export default function Button({
	children,
	variant = "primary",
	className,
	...props
}: ComponentPropsWithRef<typeof Action> & Variant) {
	return (
		<Action
			{...props}
			className={`${baseClasses} ${variants[variant]} ${className ?? ""}`}
		>
			{children}
		</Action>
	)
}
