  export function getExpenseIcon(entry, currentDate, currentMonth, currentYear) {
    if (entry.isPaid) return 'check_circle';  // Paid: Green check
    const entryDate = new Date(entry.paymentDate);
  
    if (
      entryDate.getFullYear() === currentYear &&
      entryDate.getMonth() === currentMonth &&
      currentDate >= entryDate.setDate(entryDate.getDate() - 3)
    ) {
      return 'warning';  // Unpaid in current month and 3 days before: Red warning
    } else if (entryDate > currentDate) {
      return 'schedule';  // Unpaid in future: Grey schedule
    }
    
    return 'warning';  // Fallback for unpaid past expenses (optional)
  }
  
  export function getExpenseIconColor(entry, currentDate, currentMonth, currentYear) {
    if (entry.isPaid) return 'positive';  // Paid: Green
    const entryDate = new Date(entry.paymentDate);
    if (
      entryDate.getFullYear() === currentYear &&
      entryDate.getMonth() === currentMonth &&
      currentDate >= entryDate.setDate(entryDate.getDate() - 3)
    ) {
      return 'red';  // Unpaid in current month and 3 days before: Red
    } else if (entryDate > currentDate) {
      return 'grey';  // Unpaid in future: Grey
    }
    
    return 'red';  // Fallback color for unpaid past expenses (optional)
  }

  export function getIncomingUnpaidExpenses(expenses, todayDate) {
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() + 3);
    return expenses
      .filter(expense => {
        const dueDate = new Date(expense.paymentDate);
        return dueDate <= targetDate && !expense.isPaid;
      })
      .map(expense => ({ id: expense.id, title: expense.title }));
  }