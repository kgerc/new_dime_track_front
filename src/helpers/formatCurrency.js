export function formatCurrency(amount, skipSign = false) {
    // Determine the sign and absolute value of the amount
    const sign = amount >= 0 ? "+" : "-";
    const absAmount = Math.abs(amount);
  
    // Format the number with two decimal places and commas
    const formattedAmount = absAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  
    // Remove the default currency symbol and add custom formatting
    return skipSign 
      ? `$ ${formattedAmount.replace("$", "").trim()}`
      : `${sign} $ ${formattedAmount.replace("$", "").trim()}`
  }