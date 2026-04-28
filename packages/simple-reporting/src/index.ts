export type Reporter = (
  action: string,
  name: string,
  requiredTypeString: string,
  actualTypeString: string
) => void;

export { constructErrorString } from './utils';
export { ConsoleErrorReporter, ConsoleWarnReporter } from './console';
export { ThrowErrorReporter } from './error';
