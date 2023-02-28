import type { PropsWithChildren } from "react"

const variants = {
	heading: "font-display text-2xl md:text-4xl font-bold text-primary",
	subheading: "font-display text-xl md:text-2xl font-bold text-primary",
	cardHeading: "font-display text-lg font-bold text-primary",
}

const variantMap: Record<keyof typeof variants, keyof JSX.IntrinsicElements> = {
	heading: "h1",
	subheading: "h2",
	cardHeading: "h2",
}

export function Text({
	children,
	variant,
	as,
}: PropsWithChildren<{
	variant: keyof typeof variants
	as?: keyof JSX.IntrinsicElements
}>) {
	const Base = as || variantMap[variant]
	return <Base className={variants[variant]}>{children}</Base>
}
