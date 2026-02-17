export const createPageUrl = (name: string): string => {
  return `/${name.replace(/\s+/g, "").toLowerCase()}`;
};

export const formatNumber = (value: number | undefined, digits = 0): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
};
