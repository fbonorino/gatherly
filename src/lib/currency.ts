function formatter(fractionDigits: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

const wholeFormatter = formatter(0);
const centsFormatter = formatter(2);

export function formatCurrency(amount: number, { cents = false } = {}) {
  return (cents ? centsFormatter : wholeFormatter).format(amount);
}
