let enabled = true;

export const isEnabled = () => enabled;
export const setEnabled = (value = true) => enabled = !!value;
