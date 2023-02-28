/**
 * Fun fact: The tiny-invariant npm package [strips out custom error messages
 * in production][1], which came as a surprise.
 *
 * To avoid such surprises, this module includes invariant functions that are
 * even smaller and simpler than those found in tiny-invariant.
 *
 * [1]: <https://github.com/alexreardon/tiny-invariant/blob/dd02d1ef59d580f29b0e058e76676b0b9feadb03/src/tiny-invariant.ts#L18-L21>
 */

/**
 * Invariant function that throws an `Error` with a generic error message.
 *
 * (It is better to use `invariant` so error messages are more helpful.)
 */
export function invariantNoMsg(condition: unknown): asserts condition {
  if (condition) return;
  throw new Error("Invariant failed");
}

/**
 * Invariant function that throws an `Error` with a custom error message.
 */
export function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (condition) return;
  throw new Error(message);
}
