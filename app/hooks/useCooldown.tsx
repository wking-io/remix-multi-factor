import { useCallback, useState } from "react";

/**
 * A reusable cooldown hook for changing a button label when text was copied to
 * the clipboard. Calls during cooldown will cancel the previous.
 *
 * @example
 * const [isCopied, startCooldown] = useCooldown()
 *
 * function onClick (e) {
 *   startCooldown();
 * }
 *
 * <span>{isCopied ? 'copied' : 'copy'}</span>
 */
export function useCooldown(): [boolean, () => void] {
  const [cooldown, setCooldown] = useState<NodeJS.Timeout>();

  const startCooldown = useCallback(() => {
    if (cooldown) clearTimeout(cooldown);

    setCooldown(
      setTimeout(() => {
        setCooldown(undefined);
      }, 3000)
    );
  }, [cooldown, setCooldown]);

  return [!!cooldown, startCooldown];
}
