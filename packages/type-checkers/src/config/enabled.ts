import { singleValueFactory } from '@actualwave/closure-value';

const { get, set: setEnabled } = singleValueFactory<boolean>(true, (value) => !!value);

/** Returns whether type-checking proxy wrapping is globally enabled. */
const isEnabled = (): boolean => get() ?? true;

export { isEnabled, setEnabled };
