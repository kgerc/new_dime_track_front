import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useSavingsStore = defineStore('savings', () => {
  const entries = ref([])

  async function fetchSavingGoals() {
    try {
      const response = await api.get('/savings/goals') // Uses the Axios instance
      entries.value = response.data
    } catch (error) {
      console.error('Error fetching saving goals:', error)
    }
  }

  async function addSavingGoal(savingGoal) {
    try {
      const response = await api.post('/savings/goal', savingGoal)
      if (response.status === 201 || response.status === 200) { 
        entries.value.push(savingGoal)
      } else {
        console.error('Failed to add saving goals: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding saving goals:', error)
    }
  }

  async function removeSavingGoal(id) {
    try {
      const response = await api.delete(`/savings/goal/${id}`)
      if (response.status === 201 || response.status === 200) { 
        entries.value = entries.value.filter(entry => entry.id !== id)
      } else {
        console.error('Failed to remove saving goals: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error deleting saving goals:', error)
    }
  }

  async function updateSavingGoal(updatedSavingGoal) {
    try {
      const response = await api.put(`/savings/goal/${updatedSavingGoal.id}`, updatedSavingGoal)
      if (response.status === 200) {
        const index = entries.value.findIndex(entry => entry.id === updatedSavingGoal.id)
        if (index !== -1) {
          entries.value[index] = { ...updatedSavingGoal }
        }
      } else {
        console.error('Failed to update saving goals:', response.status)
      }
    } catch (error) {
      console.error('Error updating saving goal:', error)
    }
  }

  async function addSavingContribution(savingContribution) {
    try {
      const response = await api.post('/savings/contribution', savingContribution)
      if (response.status === 201 || response.status === 200) { 
        const index = entries.value.findIndex(entry => entry.id === savingContribution.savingGoal.id)
        if (index !== -1) {
          entries.value[index].savingContributions.push(savingContribution)
        }
      } else {
        console.error('Failed to add saving contribution: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding saving contribution:', error)
    }
  }

  async function updateSavingContribution(updatedContribution) {
    try {
      const updatedContributionDto = {
        id: updatedContribution.id,
        amount: updatedContribution.amount,
        currency: updatedContribution.currency,
        contributionDate: updatedContribution.contributionDate,
        savingGoalId: updatedContribution.savingGoal.id
      };
    
      const response = await api.put(`/savings/contribution/${updatedContribution.id}`, updatedContributionDto)
      if (response.status === 200) {
        const index = entries.value.findIndex(entry => entry.id === updatedContribution.savingGoal.id)
        if (index !== -1) {
            const contributionIndex = entries.value[index].savingContributions
              .findIndex(entry => entry.id === updatedContribution.id)
            entries.value[index].savingContributions[contributionIndex] = { ...updatedContribution }
        }
      } else {
        console.error('Failed to update saving contribution:', response.status)
      }
    } catch (error) {
      console.error('Error updating saving contribution:', error)
    }
  }

  async function removeSavingContribution(savingContribution) {
    try {
      const response = await api.delete(`/savings/contribution/${savingContribution.id}`)
      if (response.status === 201 || response.status === 200) { 
        const index = entries.value.findIndex(entry => entry.id === savingContribution.savingGoal.id)
        if (index !== -1) {
          entries.value[index].savingContributions = 
          entries.value[index].savingContributions.filter(entry => entry.id !== savingContribution.id)
        }
      } else {
        console.error('Failed to remove saving contribution: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error deleting saving contribution:', error)
    }
  }

  return { 
    entries,
    fetchSavingGoals, addSavingGoal, removeSavingGoal, updateSavingGoal,
    addSavingContribution, updateSavingContribution, removeSavingContribution }
})
