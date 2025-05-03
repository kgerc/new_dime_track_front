import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useBalancesStore = defineStore('balances', () => {
  const entries = ref([])
  const balanceDict = ref({});
  const savingsBalanceDict = ref({})
  const hasInitialized = ref(false)
  const reloadIncomeExpensesDictionary = ref(false)
  const reloadSavingsDictionary = ref(false)

  async function fetchBalances() {
    try {
      const response = await api.get('/balances') // Uses the Axios instance
      entries.value = response.data
    } catch (error) {
      console.error('Error fetching balances:', error)
    }
  }

  async function addBalance(balance) {
    try {
      const response = await api.post('/balances', balance)
      if (response.status === 201 || response.status === 200) { 
        // Only push if response is successful
        entries.value.push(balance)
      } else {
        console.error('Failed to add balance: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding balance:', error)
    }
  }

  async function updateBalance(updatedBalance) {
    try {
      const response = await api.put(`/balances/${updatedBalance.id}`, updatedBalance)
      if (response.status === 200) {
        const index = entries.value.findIndex(exp => exp.id === updatedBalance.id)
        if (index !== -1) {
          entries.value[index] = { ...updatedBalance }
        }
      } else {
        console.error('Failed to update balance:', response.status)
      }
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  function createIncomeExpensesBalanceDictionary(expenses, incomes, savings,
     countUnpaidExpenses, currentYearLimits) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    if (reloadIncomeExpensesDictionary.value) {
      balanceDict.value = {}
    }
    const contributionsToDeductFromBalance = savings
      .reduce((acc, goal) => acc.concat(goal.savingContributions), [])
      .filter(con => con.deductFromIncomeBalance);
    const yearsInEntries = new Set(entries.value.map(({ year }) => Number(year)));

    entries.value.forEach(({ year, month, amount }) => {
        if (!balanceDict.value[year]) {
            balanceDict.value[year] = Array.from({ length: 12 }, () => 0);
        }
        balanceDict.value[year][month - 1] = amount;
    });
    
    // Check if 2024 exists but 2025 doesn't, and add 2025 if necessary
    if (yearsInEntries.has(2024) && !yearsInEntries.has(2025)) {
      balanceDict.value[2025] = Array.from({ length: 12 }, () => 0);
    }

    // Fill missing months with the previous month's balance
    Object.keys(balanceDict.value).forEach(year => {
        const isPrecedingYear = yearsInEntries.has(year - 1)
        const yearlyExpenses = expenses
          .filter(entry => {
            const entryDate = new Date(entry.paymentDate)
            const isYearMatch = entryDate.getFullYear() == year
          
            return isYearMatch && (countUnpaidExpenses || entry.isPaid);
          })
        const yearlyIncomes = incomes
          .filter(entry => {
            const entryDate = new Date(entry.incomeDate)
            const isYearMatch = entryDate.getFullYear() == year
          
            return isYearMatch && (countUnpaidExpenses || entry.isReceived);
          })
        const yearlyContributions = contributionsToDeductFromBalance
          .filter(entry => {
            const entryDate = new Date(entry.contributionDate)
            const isYearMatch = entryDate.getFullYear() == year
          
            return isYearMatch;
          })
        for (let month = 0; month <= 11; month++) {
            // if given month balance is 0 set value from the previous month
            if (balanceDict.value[year][month] === 0) {
              balanceDict.value[year][month] = balanceDict.value
              [month === 0 && isPrecedingYear ? year -1 : year][month === 0 && isPrecedingYear ? 11 : month === 0 ? month : month - 1];
            }
            // apply expenses
            const monthlyExpensesSum = yearlyExpenses
              .filter(entry => {
                const entryDate = new Date(entry.paymentDate)
                const isMonthMatch = entryDate.getMonth() == month
                if (countUnpaidExpenses && entry.expenseCategory && 
                  entryDate.getFullYear() == currentYear &&
                  entryDate.getMonth() > currentMonth) {
                  return
                }
                return isMonthMatch;
              }).reduce((acc, { amount }) => acc + amount, 0)
            balanceDict.value[year][month] += monthlyExpensesSum
            // apply incomes
            const monthlyIncomesSum = yearlyIncomes
            .filter(entry => {
              const entryDate = new Date(entry.incomeDate)
              const isMonthMatch = entryDate.getMonth() == month
            
              return isMonthMatch;
            }).reduce((acc, { amount }) => acc + amount, 0)
          balanceDict.value[year][month] += monthlyIncomesSum
          // apply contributions to deduct from incomes balance
          const monthlyContributionsSum = yearlyContributions
          .filter(entry => {
            const entryDate = new Date(entry.contributionDate)
            const isMonthMatch = entryDate.getMonth() == month
          
            return isMonthMatch;
          }).reduce((acc, { amount }) => acc + amount, 0)
          balanceDict.value[year][month] -= monthlyContributionsSum
          if (currentYearLimits && countUnpaidExpenses)  {
            const monthlyLimitsSum = currentYearLimits
              .filter(l => {
                const isMonthYearMatch = l.month === month && l.year == year
                return isMonthYearMatch
              }).reduce((acc, { limit }) => acc + limit, 0)
            balanceDict.value[year][month] -= monthlyLimitsSum
          }
        }
    });
  }

  function createSavingsBalanceDictionary(savings) {
    if (reloadSavingsDictionary.value) {
      savingsBalanceDict.value = {}
    }
    const contributions = savings
    .reduce((acc, goal) => acc.concat(goal.savingContributions), []);
    const yearsInEntries = new Set(entries.value.map(({ year }) => Number(year)));

    entries.value.forEach(({ year, month, amount }) => {
        if (!savingsBalanceDict.value[year]) {
          savingsBalanceDict.value[year] = Array.from({ length: 12 }, () => 0);
        }
        savingsBalanceDict.value[year][month - 1] = 0;
    });
    
    // Check if 2024 exists but 2025 doesn't, and add 2025 if necessary
    if (yearsInEntries.has(2024) && !yearsInEntries.has(2025)) {
      savingsBalanceDict.value[2025] = Array.from({ length: 12 }, () => 0);
    }

    // Fill missing months with the previous month's balance
    Object.keys(savingsBalanceDict.value).forEach(year => {
        const isPrecedingYear = yearsInEntries.has(year - 1)
        const yearlyContributions = contributions
          .filter(entry => {
            const entryDate = new Date(entry.contributionDate)
            const isYearMatch = entryDate.getFullYear() == year
          
            return isYearMatch;
          })
        for (let month = 0; month <= 11; month++) {
            // if given month balance is 0 set value from the previous month
            if (savingsBalanceDict.value[year][month] === 0) {
              savingsBalanceDict.value[year][month] = savingsBalanceDict.value
              [month === 0 && isPrecedingYear ? year -1 : year][month === 0 && isPrecedingYear ? 11 : month === 0 ? month : month - 1];
            }
            // apply contributions
            const monthlyContributionsSum = yearlyContributions
              .filter(entry => {
                const entryDate = new Date(entry.contributionDate)
                const isMonthMatch = entryDate.getMonth() == month
              
                return isMonthMatch;
              }).reduce((acc, { amount }) => acc + amount, 0)
            savingsBalanceDict.value[year][month] += monthlyContributionsSum
        }
    });
    if (!hasInitialized.value) {
      hasInitialized.value = true;
    }
  }

  return { 
    entries, balanceDict, createIncomeExpensesBalanceDictionary, savingsBalanceDict,
    createSavingsBalanceDictionary, fetchBalances, addBalance, updateBalance, hasInitialized,
    reloadSavingsDictionary, reloadIncomeExpensesDictionary }
})