<template>
  <q-page>
    <div class="row justify-between items-center q-my-md q-gutter-sm">
      <div style="width: 24px;"></div>

      <div class="row justify-center items-center col" style="margin-left: 60px;">
        <q-btn icon="arrow_back" flat @click="prevMonth" />
        <q-btn flat @click="toggleCalendar" class="q-mx-md">
          <div class="text-h6" style="min-width: 170px; text-align: center;">
            {{ currentMonthName }} {{ selectedYear }}
          </div>
          <q-popup-proxy cover transition-show="scale" transition-hide="scale" anchor="top middle" :offset="[0, 10]">
            <q-date 
              v-model="selectedDate" 
              mask="YYYY-MM-DD" 
              :default-year="selectedYear" 
              :default-month="selectedMonth + 1"
              @update:model-value="updateMonthYear" 
              bordered 
              minimal 
              class="shadow-2 rounded-borders">
                <div class="row items-center justify-between">
                  <q-btn v-close-popup :label="t('wholeMonth')" color="primary" flat :class="{'bg-primary text-white': !selectedDay}" @click="resetToWholeMonth" />
                  <q-btn v-close-popup :label="t('close')" color="primary" flat />
                </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <q-btn icon="arrow_forward" flat @click="nextMonth" />
      </div>

      <q-icon name="sort" size="md" style="margin-right:10px;" color="primary"/>
      <q-icon name="filter_alt" size="md" style="margin-right:25px;" color="primary"/>
    </div>

    <div class="q-pa-md" style="margin-top: -20px;">
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
    </div>

    <q-footer :class="footerClasses">
      <div :class="isDarkMode ? 'q-pa-xs flex flex-center pagination-dark' : 'q-pa-xs flex flex-center'">
        <q-pagination
          v-if="currentMonthEntries.length > 0"
          v-model="currentPage"
          :max="maxPage"
          input
        />
      </div>
      <div :class="isDarkMode ? 'row q-mb-sm q-px-md q-py-sm thin-border' : 'row q-mb-sm q-px-md q-py-sm shadow-up-3'">
        <div class="col" :class="titleClasses">{{ t("savingsSum") }}</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance, 'PLN') }}
        </div>
      </div>

      <q-form class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary justify-between" :class="formClasses" style="margin-left: -1px;">
        <div class="row items-center q-pr-md">
          <q-btn icon="add" :label="t('newContribution')" color="white" flat class="q-mr-sm" @click="openNewSavingContributionDialog" />
          <q-btn icon="savings" :label="t('newSavingGoal')" color="white" flat class="q-mr-sm" @click="openNewSavingGoalDialog" />
        </div>
        <div class="row items-center justify-end col-auto"  style="margin-bottom: -5px;">
          <q-input 
            v-model="searchQuery" 
            outlined 
            dense 
            :class="searchClasses"
            style="width: 400px;" 
            :placeholder="t('searchSavings')"
            class="q-mb-sm"
          />
        </div>
      </q-form>
    </q-footer>

    <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingSavings">
      <q-spinner color="primary" size="3em" :thickness="2" />
      <span class="q-mt-xs">{{ t('loadingSavings') }}</span>
    </div>

    <div v-if="currentMonthEntries.length === 0 && !loadingSavings" class="q-pa-md flex flex-center column" style="margin-right: 30px;">
      <q-icon name="savings" size="4em" color="grey-6" />
      <div class="text-h6 text-grey-6 q-mt-md">{{ t('noSavingsThisMonth') }}</div>
    </div>

    <SavingGoalDialog
      v-model="isDialogOpen"
      :savingGoal="selectedSavingGoal"
      :isNewSavingGoal="isNewSavingGoal"
      @save="handleSavingGoalSave"
    />
    <SavingContributionDialog 
      v-model="isContributionDialogOpen" 
      @save="handleSavingContributionSave" 
      :isNewSavingContribution="isNewSavingContribution"
      :savingContribution="selectedSavingContribution"
    />
  </q-page>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
const selectedYear = ref(currentYear);
const selectedMonth = ref(currentMonth);
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

const currentMonthName = computed(() =>
  format(new Date(selectedYear.value, selectedMonth.value), 'MMMM')
);

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

function prevMonth() {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
}

function nextMonth() {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
}

function updateMonthYear(date) {
  const newDate = new Date(date);
  selectedYear.value = newDate.getFullYear();
  selectedMonth.value = newDate.getMonth();
  selectedDay.value = newDate.getDate();
  isCalendarOpen.value = false;
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

const footerClasses = computed(() =>  isDarkMode.value ? 'bg-dark text-white' : 'bg-white text-dark');

// Example: For the title in the summary section
const titleClasses = computed(() => isDarkMode.value ? 'text-white' : 'text-grey-7');

// For the form, switch the background accordingly:
const formClasses = computed(() => isDarkMode.value ? 'bg-grey-9' : 'bg-primary');

const searchClasses = computed(() => isDarkMode.value ? 'bg-grey-9' : 'bg-white');
</script>
