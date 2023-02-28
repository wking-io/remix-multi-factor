import { invariant } from "~/utils/invariant"

type Method = "post" | "put" | "patch" | "delete"

function isMethod(input: string): input is Method {
	return ["post", "put", "patch", "delete"].includes(input)
}

export function getFormDetails(formData: FormData) {
	const method = formData.get("_method")
	invariant(typeof method === "string", "method not found on request.")
	invariant(isMethod(method), "method not a valid method.")
	const action = formData.get("_action")
	invariant(typeof action === "string", "action not found on request.")

	return { method, action }
}

/**
 * @returns domain URL (without a ending slash)
 */
export function getDomainUrl(request: Request) {
	const host =
		request.headers.get("X-Forwarded-Host") ?? request.headers.get("host")
	if (!host) {
		throw new Error("Could not determine domain URL.")
	}
	const protocol = host.includes("localhost") ? "http" : "https"
	return `${protocol}://${host}`
}

const DEFAULT_REDIRECT = "/"

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect: string = DEFAULT_REDIRECT,
) {
	if (!to || typeof to !== "string") {
		return defaultRedirect
	}

	if (!to.startsWith("/") || to.startsWith("//")) {
		return defaultRedirect
	}

	return to
}
