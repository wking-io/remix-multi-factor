import type { FormProps as RFormProps } from "@remix-run/react"
import type { ComponentPropsWithRef } from "react"

import { Popover, Transition } from "@headlessui/react"
import {
	EyeIcon,
	EyeSlashIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/solid"
import { Form as RForm, useLocation } from "@remix-run/react"
import { forwardRef, Fragment, useState } from "react"
import { useRootLoaderData } from "~/root"
import type { PropsWithClassName } from "~/types"

export type FormProps = RFormProps & {
	/**
	 * Allows the passing of a fetcher.Form
	 * @default RemixForm
	 */
	as?: typeof RForm
	/**
	 * Used on routes with multiple actions to identify the submitted form.
	 * @default undefined
	 */
	actionId?: string
	/**
	 * Tells the action where to send a successful response
	 * @default undefined
	 */
	redirectTo?: string
}

const Form = forwardRef<HTMLFormElement, FormProps>(
	(
		{
			children,
			as,
			className,
			actionId,
			redirectTo,
			method = "post",
			...props
		},
		ref,
	) => {
		const { pathname } = useLocation()
		const { csrf } = useRootLoaderData()
		const ThisForm = as || RForm
		return (
			<ThisForm
				{...props}
				method={method === "get" ? "get" : "post"}
				className={className}
				ref={ref}
			>
				<input type="hidden" name="_referrer" value={pathname} />
				<input type="hidden" name="_csrf" value={csrf} />
				<input type="hidden" name="_method" value={method} />

				{actionId ? (
					<input type="hidden" name="_action" value={actionId} />
				) : null}
				{redirectTo ? (
					<input type="hidden" name="_redirectTo" value={redirectTo} />
				) : null}
				{children}
			</ThisForm>
		)
	},
)

Form.displayName = "FormKit.Form"
export default Form

export const Label = forwardRef(
	(
		{ className, ...props }: React.ComponentProps<"label">,
		ref: React.ForwardedRef<HTMLLabelElement>,
	) => (
		<label
			{...props}
			ref={ref}
			className={`block text-sm font-medium text-gray-700 ${className ?? ""}`}
		/>
	),
)

Label.displayName = "FormKit.Label"

export function FieldError({
	className,
	name,
	errors,
}: PropsWithClassName<{ name: string; errors?: { _errors?: string[] } }>) {
	if (!errors?._errors || !errors?._errors?.length) return null

	return (
		<div
			className={`rounded-md bg-danger-100 py-2 px-3 text-sm text-danger-700 ${className}`}
			id={`${name}-error`}
		>
			{errors._errors.length > 1 ? (
				<ul className="flex list-disc flex-col pl-2">
					{errors._errors.map(error => (
						<li key={error}>{error}</li>
					))}
				</ul>
			) : (
				<p>{errors._errors[0]}</p>
			)}
		</div>
	)
}

export const FieldInfo = forwardRef(
	(
		{ className, children, ...props }: React.ComponentProps<"button">,
		ref: React.ForwardedRef<HTMLButtonElement>,
	) => (
		<Popover className="relative leading-none">
			<Popover.Button title="See details">
				<span className="sr-only">See field details</span>
				<InformationCircleIcon
					className="h-3 w-3 text-secondary/50 hover:text-brand"
					aria-hidden
				/>
			</Popover.Button>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-200"
				enterFrom="opacity-0 translate-y-1"
				enterTo="opacity-100 translate-y-0"
				leave="transition ease-in duration-150"
				leaveFrom="opacity-100 translate-y-0"
				leaveTo="opacity-0 translate-y-1"
			>
				<Popover.Panel className="absolute top-full left-0 mt-2">
					<div className="overflow-hidden rounded-lg border border-[rgb(var(--text-secondary))]/30 bg-layer-1 shadow-lg">
						{children}
					</div>
				</Popover.Panel>
			</Transition>
		</Popover>
	),
)

FieldInfo.displayName = "FormKit.FieldInfo"

const focusClassNames =
	"focus:border-brand focus:ring focus:ring-brand-light/50"
const borderColors = "border-[rgb(var(--text-secondary))]"
const inputClassNames = "w-full border rounded-md px-3 py-2 text-base"

export const Input = forwardRef<
	HTMLInputElement,
	ComponentPropsWithRef<"input">
>(({ className, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={`${inputClassNames} ${borderColors} ${focusClassNames} ${className}`}
			{...props}
		/>
	)
})

Input.displayName = "FormKit.Input"

export const Checkbox = forwardRef(
	(
		{ className, ...props }: React.ComponentProps<"input">,
		ref: React.ForwardedRef<HTMLInputElement>,
	) => (
		<input
			{...props}
			type="checkbox"
			ref={ref}
			className={`h-4 w-4 rounded border text-brand focus:ring-brand focus:ring-offset-[rgb(var(--bg-base))] ${borderColors}
        ${className ?? ""}
      `}
		/>
	),
)

Checkbox.displayName = "FormKit.Checkbox"

export const Password = forwardRef(
	(
		{ className, ...props }: Omit<React.ComponentProps<"input">, "type">,
		ref: React.ForwardedRef<HTMLInputElement>,
	) => {
		const [showPassword, setShowPassword] = useState(false)
		return (
			<div
				className={`flex flex-row rounded-md border p-1 focus-within:border-brand focus-within:ring focus-within:ring-brand-light/50 ${borderColors} ${
					className ?? ""
				}`}
			>
				<input
					{...props}
					type={showPassword ? "text" : "password"}
					ref={ref}
					className="block flex-1 appearance-none rounded-l-sm border-transparent px-2 py-1 focus:border-transparent focus:outline-none focus:ring-0"
				/>
				<button
					type="button"
					onClick={() => setShowPassword(prev => !prev)}
					className="shrink-0 rounded px-2 hover:bg-brand/10 focus:bg-brand-light/10 focus:outline-none"
				>
					<EyeIcon className={`${showPassword ? "hidden" : ""} h-5 w-5`} />
					<EyeSlashIcon
						className={`${!showPassword ? "hidden" : ""} h-5 w-5`}
					/>
				</button>
			</div>
		)
	},
)

Password.displayName = "FormKit.Password"
