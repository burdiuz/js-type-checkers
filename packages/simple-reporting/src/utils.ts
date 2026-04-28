export const constructErrorString = (
  action: string,
  name: string,
  required: string,
  received: string
): string => `${action}Error on "${name}" instead of "${required}" received "${received}"`;
