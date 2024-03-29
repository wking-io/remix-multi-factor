import type { FormProps as RFormProps } from "@remix-run/react";
import type {
  ChangeEvent,
  ComponentPropsWithRef,
  KeyboardEvent} from "react";
import {
  useEffect,
  useRef,
} from "react";

import { Popover, Transition } from "@headlessui/react";
import {
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { Form as RForm, useLocation } from "@remix-run/react";
import { forwardRef, Fragment, useState } from "react";
import { useRootLoaderData } from "~/root";
import type { PropsWithClassName } from "~/types";

export type FormProps = RFormProps & {
  /**
   * Allows the passing of a fetcher.Form
   * @default RemixForm
   */
  as?: typeof RForm;
  /**
   * Used on routes with multiple actions to identify the submitted form.
   * @default undefined
   */
  actionId?: string;
  /**
   * Tells the action where to send a successful response
   * @default undefined
   */
  redirectTo?: string;
};

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
    ref
  ) => {
    const { pathname } = useLocation();
    const { csrf } = useRootLoaderData();
    const ThisForm = as || RForm;
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
    );
  }
);

Form.displayName = "FormKit.Form";
export default Form;

export const Label = forwardRef(
  (
    { className, ...props }: React.ComponentProps<"label">,
    ref: React.ForwardedRef<HTMLLabelElement>
  ) => (
    <label
      {...props}
      ref={ref}
      className={`block text-sm font-medium ${className ?? ""}`}
    />
  )
);

Label.displayName = "FormKit.Label";

export function FieldError({
  className,
  name,
  errors,
}: PropsWithClassName<{ name: string; errors?: { _errors?: string[] } }>) {
  if (!errors?._errors || !errors?._errors?.length) return null;

  return (
    <div
      className={`rounded-md bg-danger-100 py-2 px-3 text-sm text-danger-700 ${className}`}
      id={`${name}-error`}
    >
      {errors._errors.length > 1 ? (
        <ul className="flex list-disc flex-col pl-2">
          {errors._errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p>{errors._errors[0]}</p>
      )}
    </div>
  );
}

export const FieldInfo = forwardRef(
  (
    { className, children, ...props }: React.ComponentProps<"button">,
    ref: React.ForwardedRef<HTMLButtonElement>
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
  )
);

FieldInfo.displayName = "FormKit.FieldInfo";

export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithRef<"input"> & { colors?: string; inputClassName?: string }
>(
  (
    {
      className,
      inputClassName = "",
      colors = "border-emerald-900 bg-emerald-200 text-emerald-900",
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={`${colors} ${className} rounded-[10px] border-[3px] pb-1 transition-all focus-within:pt-1 focus-within:pb-0`}
      >
        <input
          ref={ref}
          className={`${inputClassName} w-full rounded-lg border-0 bg-white`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "FormKit.Input";

export const Checkbox = forwardRef(
  (
    { className, ...props }: React.ComponentProps<"input">,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => (
    <input
      {...props}
      type="checkbox"
      ref={ref}
      className={`h-4 w-4 rounded border text-brand focus:ring-brand focus:ring-offset-[rgb(var(--bg-base))]
        ${className ?? ""}
      `}
    />
  )
);

Checkbox.displayName = "FormKit.Checkbox";

export const Password = forwardRef(
  (
    {
      className,
      inputClassName = "",
      colors = "border-emerald-900 bg-emerald-200 text-emerald-900",
      ...props
    }: Omit<React.ComponentProps<"input">, "type"> & {
      colors?: string;
      inputClassName?: string;
    },
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div
        className={`${colors} ${className} group relative rounded-[10px] border-[3px] pb-1 transition-all focus-within:pt-1 focus-within:pb-0`}
      >
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          ref={ref}
          className={`${inputClassName} w-full rounded-lg border-0 bg-white`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1.5 shrink-0 rounded p-1 transition hover:text-cyan-500 focus:text-cyan-400 focus:outline-none group-focus-within:top-2.5"
        >
          <EyeIcon className={`${showPassword ? "hidden" : ""} h-5 w-5`} />
          <EyeSlashIcon
            className={`${!showPassword ? "hidden" : ""} h-5 w-5`}
          />
        </button>
      </div>
    );
  }
);

Password.displayName = "FormKit.Password";

export function TOTPCodeInput({
  colors = "border-teal-900 bg-teal-200 text-teal-900",
  inputClassName = "placeholder:text-teal-600/40",
}: {
  colors?: string;
  inputClassName?: string;
}) {
  const [value, setValue] = useState<string>("");
  const [refs] = useState([
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]);

  useEffect(() => {
    const refToFocus = refs?.[value.length];
    if (refToFocus && refToFocus.current) refToFocus.current.focus();
  }, [refs, value]);

  const updateValue = (pos: number) => (e: ChangeEvent<HTMLInputElement>) =>
    setValue((current) => {
      if (current.length === 0 || current.length === pos - 1) {
        return `${current}${e.target.value}`;
      } else if (current.length >= pos) {
        const newValue = current.split("");
        newValue[pos] = e.target.value;
        return newValue.join("");
      }

      return current;
    });

  const deleteValue = (pos: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setValue((current) => {
        if (current.length > 0 && current.length === pos) {
          return current.slice(0, pos - 1);
        }

        return current;
      });
    }
  };

  const focusCurrentDigit = () => {
    const currentDigit = refs[value.length];
    if (currentDigit && currentDigit.current) currentDigit.current.focus();
  };

  return (
    <>
      <input type="hidden" name="token" value={value} />
      <fieldset className="mt-2 flex gap-2">
        {refs.map((ref, i) => (
          <label key={`digit-${i}`} onClick={focusCurrentDigit}>
            <Input
              type="text"
              className={`${value.length !== i ? "pointer-events-none" : ""}`}
              inputClassName={`${inputClassName} text-4xl font-bold text-center`}
              value={value.charAt(i)}
              onChange={updateValue(i)}
              onKeyUp={deleteValue(i)}
              placeholder={`${i + 1}`}
              maxLength={1}
              ref={ref}
              colors={colors}
            />
          </label>
        ))}
      </fieldset>
    </>
  );
}
