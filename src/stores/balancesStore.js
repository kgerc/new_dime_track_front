import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useBalancesStore = defineStore('balances', () => {
  const entries = ref([])
  const balanceDict = ref({});

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

  function createBalanceDictionary(expenses, incomes) {
    const yearsInEntries = new Set(entries.value.map(({ year }) => Number(year)));

    entries.value.forEach(({ year, month, amount }) => {
        if (!balanceDict.value[year]) {
            balanceDict.value[year] = Array.from({ length: 12 }, () => 0);
        }
        balanceDict.value[year][month - 1] = amount;
    });
    
    // Check if 2024 exists but 2025 doesn't
    if (yearsInEntries.has(2024) && !yearsInEntries.has(2025)) {
        const lastMonth2024Value = balanceDict.value[2024]?.[11] || 0; // December 2024 value
        balanceDict.value[2025] = Array.from({ length: 12 }, () => lastMonth2024Value);
    }

    // Fill missing months with the previous month's balance
    Object.keys(balanceDict.value).forEach(year => {
        const isPrecedingYear = yearsInEntries.has(year - 1)
        const yearlyExpenses = expenses
          .filter(entry => {
            const entryDate = new Date(entry.paymentDate)
            const isYearMatch = entryDate.getFullYear() == year
          
            return isYearMatch;
          })
        const yearlyIncomes = incomes
          .filter(entry => {
            const entryDate = new Date(entry.incomeDate)
            const isYearMatch = entryDate.getFullYear() == year
          
            return isYearMatch;
          })
        for (let month = 0; month <= 11; month++) {
            // if given month balance is 0 set value from the previous month
            if (balanceDict.value[year][month] === 0) {
              balanceDict.value[year][month] = balanceDict.value
              [month === 0 && isPrecedingYear ? year -1 : year][month === 0 && isPrecedingYear ? 11 : month - 1];
            }
            // apply expenses
            const monthlyExpensesSum = yearlyExpenses
              .filter(entry => {
                const entryDate = new Date(entry.paymentDate)
                const isMonthMatch = entryDate.getMonth() == month
              
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
        }
    });
  }

  return { 
    entries, balanceDict, createBalanceDictionary, 
     fetchBalances, addBalance, updateBalance }
})