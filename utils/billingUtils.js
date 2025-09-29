// utils/billingUtils.js
export const MEAL_PRICES = {
  half: 45,
  full: 60
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculate bill amount for given meal counts
 */
export const calculateBillAmount = (halfMealCount = 0, fullMealCount = 0) => {
  const halfCost = halfMealCount * MEAL_PRICES.half;
  const fullCost = fullMealCount * MEAL_PRICES.full;
  return {
    halfMealCost: halfCost,
    fullMealCost: fullCost,
    totalAmount: halfCost + fullCost
  };
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Get month name from number
 */
export const getMonthName = (monthNumber) => {
  return MONTHS[monthNumber - 1] || 'Unknown';
};

/**
 * Get billing status color classes
 */
export const getBillingStatusClasses = (status) => {
  const statusClasses = {
    paid: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    partial: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    pending: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    }
  };
  
  return statusClasses[status] || statusClasses.pending;
};

/**
 * Calculate billing statistics for admin dashboard
 */
export const calculateBillingStats = (bills = []) => {
  return bills.reduce((stats, bill) => {
    stats.totalBills++;
    stats.totalAmount += bill.total_amount || 0;
    stats.totalPaid += bill.paid_amount || 0;
    stats.totalDue += bill.due_amount || 0;
    stats.totalMeals += (bill.half_meal_count || 0) + (bill.full_meal_count || 0);
    
    switch (bill.status) {
      case 'paid':
        stats.paidBills++;
        break;
      case 'partial':
        stats.partialBills++;
        break;
      case 'pending':
        stats.pendingBills++;
        break;
    }
    
    return stats;
  }, {
    totalBills: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
    totalMeals: 0,
    paidBills: 0,
    partialBills: 0,
    pendingBills: 0
  });
};

/**
 * Calculate user billing summary
 */
export const calculateUserBillingStats = (userBills = []) => {
  const stats = userBills.reduce((acc, bill) => {
    acc.totalBilled += bill.total_amount || 0;
    acc.totalPaid += bill.paid_amount || 0;
    acc.totalDue += bill.due_amount || 0;
    acc.totalMeals += (bill.half_meal_count || 0) + (bill.full_meal_count || 0);
    return acc;
  }, {
    totalBilled: 0,
    totalPaid: 0,
    totalDue: 0,
    totalMeals: 0
  });

  // Get last bill amount
  const sortedBills = userBills.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  stats.lastBillAmount = sortedBills[0]?.total_amount || 0;
  
  return stats;
};

/**
 * Validate payment amount
 */
export const validatePaymentAmount = (amount, maxAmount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Please enter a valid amount' };
  }
  
  if (numAmount > maxAmount) {
    return { valid: false, error: `Amount cannot exceed ₹${maxAmount.toFixed(2)}` };
  }
  
  return { valid: true, error: null };
};

/**
 * Get date range for a month
 */
export const getMonthDateRange = (month, year) => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  return { startDate, endDate };
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Generate bill summary text
 */
export const generateBillSummary = (bill) => {
  const totalMeals = (bill.half_meal_count || 0) + (bill.full_meal_count || 0);
  const monthName = getMonthName(bill.month);
  
  return `${totalMeals} meal${totalMeals !== 1 ? 's' : ''} in ${monthName} ${bill.year} - ₹${(bill.total_amount || 0).toFixed(2)}`;
};

/**
 * Check if bill is overdue (for future implementation)
 */
export const isBillOverdue = (bill, gracePeriodDays = 30) => {
  if (bill.status === 'paid') return false;
  
  const billDate = new Date(bill.year, bill.month, 1); // First day of the bill month
  const dueDate = new Date(billDate.setMonth(billDate.getMonth() + 1)); // Next month
  const overdueDate = new Date(dueDate.setDate(dueDate.getDate() + gracePeriodDays));
  
  return new Date() > overdueDate;
};