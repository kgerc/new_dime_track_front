export function formatCurrency(amount, currency, skipSign = false) {
    // Determine the sign and absolute value of the amount
    const sign = amount >= 0 ? "+" : "-";
    const absAmount = Math.abs(amount);
  
    // Format the number with two decimal places and commas
    const formattedAmount = absAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  
    // Remove the default currency symbol and add custom formatting
    return skipSign 
      ? `${formattedAmount} ${currency}`
      : `${sign} ${formattedAmount} ${currency}`;
  }

export function getCurrencySymbol(currency) {
    const currencyMap = {
      USD: "$",
      EUR: "€",
      PLN: "zł",
      GBP: "£",
      JPY: "¥",
      CHF: "CHF",
      CAD: "C$",
      AUD: "A$",
      CNY: "¥",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr"
    };
    return currencyMap[currency] || currency; // Fallback to currency code if symbol not found
  }