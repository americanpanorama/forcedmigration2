export const formatNumber = function(num, decimal) {
  decimal = (decimal) ? decimal : 0;
  if (num < 1000000 && num >= 1000) {
    return Math.round(num /100) / 10  + 'K';
  }
  return Math.round(num);
};

export const roughNumber = function(num) {
  if (num >= 1000) {
    // round to the nearest 100
    return Math.round(num / 100) * 100;
  } else if (num >= 100) {
    // round to the nearest 50
    return Math.round(num / 50) * 50;
  } else if (num >= 10) {
    // round to the nearest 5
    return Math.round(num / 5) * 5;
  }

  return Math.round(num);
};