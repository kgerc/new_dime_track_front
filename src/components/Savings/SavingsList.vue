<template>
          <q-list bordered separator v-if="!loadingSavings">
        <q-item-label v-if="currentMonthEntries.length > 0" header>{{ t("savings") }}</q-item-label>

        <template v-for="entry in currentMonthEntries" :key="entry.id">
          <q-slide-item @right="removeSavingGoal(entry.id)">
            <template v-slot:right>
              <q-btn flat dense color="negative" icon="delete" @click="removeSavingGoal(entry.id)" />
            </template>

            <q-item clickable @click="toggleExpand(entry.id)">
              <q-item-section>
                <div class="row items-center">
                  <q-icon 
                    :name="getSavingStatusIcon(entry)" 
                    :color="getSavingStatusColor(entry)" 
                    class="q-mr-sm" size="sm"
                  />
                  <div>
                    <q-item-label class="text-weight-bold">{{ entry.title }}</q-item-label>
                    <q-item-label caption v-if="entry.amount">
                      {{ formatCurrency(entry.currentAmount, entry.currency, true) }} / {{ formatCurrency(entry.amount, entry.currency, true) }}
                    </q-item-label>
                    <q-item-label caption v-else>
                      {{ formatCurrency(entry.currentAmount, entry.currency, true) }} ({{ t("noGoal") }})
                    </q-item-label>
                    <q-linear-progress
                      v-if="entry.amount"
                      :value="getProgress(entry)"
                      :color="getProgressColor(entry)"
                      class="q-mt-xs"
                      rounded
                    />
                  </div>
                  <q-icon 
                    v-if="expandedSavingId === entry.id"
                    name="edit" 
                    size="sm" 
                    color="primary" 
                    style="margin-left: 12px;" 
                    @click.stop="openDialog(entry)"
                    clickable
                  />
                </div>
              </q-item-section>

              <q-item-section side class="text-weight-bold text-positive">
                {{ formatCurrency(entry.currentMonthAmountChange, entry.currency) }}
              </q-item-section>
            </q-item>
          </q-slide-item>

          <q-slide-transition>
            <div v-if="expandedSavingId === entry.id">
              <q-item style="margin-left: 5px;max-width: 80px;">
                <q-item-section style="margin-bottom: 8px;">
                  <q-icon name="subdirectory_arrow_right" size="sm"/>
                </q-item-section>
                <q-item-section style="margin-left: -25px;">
                  <q-item-label header>{{ t("contributions") }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-list dense>
                <q-item v-for="contribution in getCurrentMonthContributionsByGoalId(entry.id)" :key="contribution.id" 
                  style="margin-left: 35px;" clickable @click="openSavingContributionDialog(contribution)"> 
                  <q-item-section>
                    <q-item-label>
                      {{ formatCurrency(contribution.amount, contribution.currency) }} 
                      <span class="text-grey-7">({{ formatDate(contribution.contributionDate) }})</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="!isAnyGoalContribution(entry.id)" style="margin-left: 33px;">
                  <q-item-section>{{ t("noContributionsYet") }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-slide-transition>
        </template>
      </q-list>
  </template>

<script setup>
import { ref, computed, onMounted, watch, toRefs } from 'vue';
import { useQuasar } from 'quasar'
import { format } from 'date-fns';
import { storeToRefs } from 'pinia'
import { useSavingsStore } from 'src/stores/savingsStore'
import { useBalancesStore } from 'src/stores/balancesStore'
import { useThemeStore } from 'src/stores/themeStore';
import { useLangStore } from "src/stores/langStore"
import { amountColor } from 'src/helpers/amountColor.js'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import SavingGoalDialog from 'src/components/Savings/SavingGoalDialog.vue'
import SavingContributionDialog from 'src/components/Savings/SavingContributionDialog.vue'

const $q = useQuasar()
const currentPage = ref(1)
const savingsStore = useSavingsStore()
const { entries } = storeToRefs(savingsStore)
const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);
const balancesStore = useBalancesStore()
const { hasInitialized, reloadSavingsDictionary, reloadIncomeExpensesDictionary } = storeToRefs(balancesStore)
const { t } = useLangStore();

// Date management
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()
const selectedDay = ref(null)    // For day filtering
const selectedDate = ref(null);
const searchQuery = ref('')
const isCalendarOpen = ref(false)
// Expense Editing
const isDialogOpen = ref(false)
const selectedSavingGoal = ref(null)
const selectedSavingContribution = ref(null)
let loadingSavings = ref(false)
const itemsPerPage = 10  // Number of entries per page
const isNewSavingGoal = ref(false)
const isNewSavingContribution = ref(false)
const isContributionDialogOpen = ref(false)
const expandedSavingId = ref(null)
const props = defineProps({
  entries: Array,
  loadingSavings: Boolean,
  selectedYear: Number,
  selectedMonth: Number
})
const { selectedYear, selectedMonth } = toRefs(props)

// Max page calculation
const maxPage = computed(() => {
  return Math.ceil(currentMonthEntries.value.length / itemsPerPage)
})


// Fetch incomes on mount
onMounted(async () => {
  if (!hasInitialized.value) {
    loadingSavings.value = true
    await savingsStore.fetchSavingGoals()
    loadingSavings.value = false
    extendSavingGoalModel()
  }
})

const currentMonthEntries = computed(() => {
  return entries.value.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch;
  })
})

const currentMonthContributions = computed(() => {
  const contributions = currentMonthEntries.value
    .reduce((acc, goal) => acc.concat(goal.savingContributions), []);
  return contributions.filter(entry => {
    const entryDate = new Date(entry.contributionDate)
    const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value && entryDate.getFullYear() === selectedYear.value
    
    const isDayMatch = selectedDay.value == null || 
    (entryDate.getMonth() === selectedMonth.value && 
    entryDate.getFullYear() === selectedYear.value &&
    entryDate.getDate() === selectedDay.value)
    
    return isMonthYearMatch && isDayMatch;
  })
})

const previousMonthContributions = computed(() => {
  const contributions = currentMonthEntries.value
    .reduce((acc, goal) => acc.concat(goal.savingContributions), []);

  return contributions.filter(entry => {
    const entryDate = new Date(entry.contributionDate);
    
    const isBeforeSelectedMonth =
      entryDate.getFullYear() < selectedYear.value ||
      (entryDate.getFullYear() === selectedYear.value && entryDate.getMonth() < selectedMonth.value);

    return isBeforeSelectedMonth;
  });
});


function getCurrentMonthContributionsByGoalId(id) {
  return currentMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
}

function isAnyGoalContribution(id) {
  const contributions = currentMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
  return contributions && contributions.length > 0;
}

function getTotalGoalBalanceFromCurrentMonth(id) {
  return currentMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
    .reduce((acc, { amount }) => acc + amount, 0)
}

function getTotalGoalBalanceFromPreviousMonth(id) {
  return previousMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
    .reduce((acc, { amount }) => acc + amount, 0)
}

const totalBalance = computed(() => {
  return currentMonthContributions.value.reduce((acc, { amount }) => acc + amount, 0)
})

function extendSavingGoalModel() {
  currentMonthEntries.value.forEach(goal => {
    goal.currentAmount = getTotalGoalBalanceFromPreviousMonth(goal.id) + getTotalGoalBalanceFromCurrentMonth(goal.id)
    goal.currentMonthAmountChange = getTotalGoalBalanceFromCurrentMonth(goal.id)
    goal.status = setCurrentProgressStatus(goal.currentAmount, goal.amount)
  })
}

watch([selectedMonth, selectedYear], () => {
  extendSavingGoalModel()
});

function extendSavingGoalModelForNewSavingGoal(newSavingGoal) {
  newSavingGoal.currentAmount = 0
  newSavingGoal.status = setCurrentProgressStatus(newSavingGoal.currentAmount, newSavingGoal.amount)
}

function setCurrentProgressStatus(currentAmount, goalAmount) {
  if (currentAmount >= goalAmount) {
        return "completed";
    } else if (currentAmount >= goalAmount * 0.3) {
        return "on_track";
    } else {
        return "behind";
    }
}


function removeSavingGoal(id) {
  savingsStore.removeSavingGoal(id)
  // Toast notification for removing an expense
  $q.notify({
    message: 'Saving Goal deleted successfully!',
    color: 'negative',
    position: 'top-right',
    timeout: 2000
  })
}

function openDialog(savingGoal) {
  selectedSavingGoal.value = { ...savingGoal }  // Copy to avoid direct mutation
  isNewSavingGoal.value = false
  isDialogOpen.value = true
}

function openSavingContributionDialog(savingContribution) {
  selectedSavingContribution.value = { ...savingContribution }  // Copy to avoid direct mutation
  isNewSavingContribution.value = false
  isContributionDialogOpen.value = true
}

function openNewSavingContributionDialog() {
  selectedSavingGoal.value = null // Copy to avoid direct mutation
  isNewSavingContribution.value = true
  isContributionDialogOpen.value = true
}

function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
}

function openNewSavingGoalDialog() {
  selectedSavingGoal.value = null  // Clear previous data
  isNewSavingGoal.value = true
  isDialogOpen.value = true
}

function resetToWholeMonth() {
  selectedDay.value = null // Reset to no day filter (whole month)
  selectedDate.value = null // Reset to no day filter (whole month)
  isCalendarOpen.value = false
}
function getSavingStatusIcon(saving) {
  return saving.status === "completed" ? "check_circle" 
        : saving.status === "behind" ? "error"
        : "hourglass_top";
}
function getSavingStatusColor(saving) {
  return saving.status === "completed" ? "green-6" 
        : saving.status === "behind" ? "red-6"
        : "orange-6";
}
function getProgress(saving) {
  return saving.currentAmount / saving.amount;
}
function getProgressColor(saving) {
  return saving.status === "completed" ? "green"
        : saving.status === "behind" ? "red"
        : "orange";
}
function toggleExpand(savingId) {
  expandedSavingId.value = expandedSavingId.value === savingId ? null : savingId;
}
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
async function handleSavingGoalSave(savingGoal) {
  extendSavingGoalModelForNewSavingGoal(savingGoal)
  if (isNewSavingGoal.value) {
    await handleNewSavingGoal(savingGoal)
  } else {
    await handleUpdateSavingGoal(savingGoal)
  }
}

async function handleUpdateSavingGoal(updatedSavingGoal) {
  await savingsStore.updateSavingGoal(updatedSavingGoal)  // Call store action to update API and local store
  $q.notify({
    message: 'Saving goal edited successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function handleNewSavingGoal(savingGoal) {
  await savingsStore.addSavingGoal(savingGoal)
  isDialogOpen.value = false  // Close dialog after saving
  $q.notify({
    message: 'Saving goal added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function handleSavingContributionSave(savingContribution) {
  if (isNewSavingContribution.value) {
    await handleNewSavingContribution(savingContribution)
  } else if (savingContribution){
    await handleUpdateSavingContribution(savingContribution)
  } else {
    isContributionDialogOpen.value = false; 
    extendSavingGoalModel()
    $q.notify({
      message: 'Saving contribution deleted successfully!',
      color: 'positive',
      position: 'top-right',
      timeout: 2000
    });
  }
  reloadSavingsDictionary.value = true
  reloadIncomeExpensesDictionary.value = true
}

async function handleUpdateSavingContribution(updatedSavingContribution) {
  await savingsStore.updateSavingContribution(updatedSavingContribution)  // Call store action to update API and local store
  extendSavingGoalModel()
  $q.notify({
    message: 'Saving contribution edited successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function handleNewSavingContribution(savingContribution) {
  await savingsStore.addSavingContribution(savingContribution)
  isContributionDialogOpen.value = false  // Close dialog after saving
  extendSavingGoalModel()
  $q.notify({
    message: 'Saving contribution added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

</script>