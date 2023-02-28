import { Transition } from "@headlessui/react"
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	XMarkIcon,
} from "@heroicons/react/24/solid"
import { Fragment, ReactNode, useState } from "react"
import { Flash } from "~/utils/flash.server"

const iconBase = "w-5 h-5"
const iconMap: Record<Flash["messageType"], ReactNode> = {
	error: <ExclamationCircleIcon className={`${iconBase} text-danger`} />,
	warn: <ExclamationTriangleIcon className={`${iconBase} text-warning`} />,
	info: <InformationCircleIcon className={`${iconBase} text-brand`} />,
	success: <CheckCircleIcon className={`${iconBase} text-success`} />,
}

export default function Toast({ messageType, message }: Flash) {
	const [open, setOpen] = useState(true)
	return (
		<Transition
			as={Fragment}
			show={open}
			enter="ease-out duration-300"
			enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			enterTo="opacity-100 translate-y-0 sm:scale-100"
			leave="ease-in duration-200"
			leaveFrom="opacity-100 translate-y-0 sm:scale-100"
			leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		>
			<div className="relative flex gap-2 rounded-lg border bg-base p-4 shadow-xl">
				<button
					onClick={() => setOpen(false)}
					className="absolute top-0 right-0 p-2"
				>
					<span className="sr-only">close flash message</span>
					<XMarkIcon className="h-4 w-4"></XMarkIcon>
				</button>
				<div className="shrink-0">{iconMap[messageType]}</div>
				<div className="grid gap-1 text-sm">
					<h4 className="font-bold text-primary">{message.heading}</h4>
					<p>{message.description}</p>
				</div>
			</div>
		</Transition>
	)
}
