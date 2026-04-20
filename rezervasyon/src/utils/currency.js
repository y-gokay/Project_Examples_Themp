import { APP_CONSTANTS } from "./constants";

/**
 * Para birimini formatlar
 * @param {number|string} amount - Formatlanacak miktar
 * @param {boolean} showSymbol - Para birimi sembolünü göster (varsayılan: true)
 * @returns {string} Formatlanmış para birimi
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || amount === "") {
    return showSymbol ? `${APP_CONSTANTS.CURRENCY_SYMBOL}0` : "0";
  }

  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return showSymbol ? `${APP_CONSTANTS.CURRENCY_SYMBOL}0` : "0";
  }

  const formattedAmount = numericAmount.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return showSymbol
    ? `${APP_CONSTANTS.CURRENCY_SYMBOL}${formattedAmount}`
    : formattedAmount;
};

/**
 * Para birimi sembolünü döndürür
 * @returns {string} Para birimi sembolü
 */
export const getCurrencySymbol = () => {
  return APP_CONSTANTS.CURRENCY_SYMBOL;
};
