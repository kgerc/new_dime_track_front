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
                  <q-btn v-close-popup label="Whole month" color="primary" flat :class="{'bg-primary text-white': !selectedDay}" @click="resetToWholeMonth" />
                  <q-btn v-close-popup label="Close" color="primary" flat />
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
      <!-- Savings List -->
      <q-list bordered separator>
        <q-item-label header>Savings</q-item-label>

        <template v-for="saving in savingsList" :key="saving.id">
          <!-- Main Saving Item -->
          <q-item clickable @click="toggleExpand(saving.id)">
            <q-item-section>
              <div class="row items-center">
                <q-icon 
                  :name="getSavingStatusIcon(saving)" 
                  :color="getSavingStatusColor(saving)" 
                  class="q-mr-sm" size="sm"
                />
                <div>
                  <!-- Saving Title -->
                  <q-item-label class="text-weight-bold">{{ saving.title }}</q-item-label>
                  <!-- Amounts -->
                  <q-item-label caption v-if="saving.goalAmount">
                    {{ formatCurrency(saving.currentAmount) }} / {{ formatCurrency(saving.goalAmount) }}
                  </q-item-label>
                  <q-item-label caption v-else>
                    {{ formatCurrency(saving.currentAmount) }} (No Goal)
                  </q-item-label>
                  <!-- Progress Bar -->
                  <q-linear-progress
                    v-if="saving.goalAmount"
                    :value="getProgress(saving)"
                    :color="getProgressColor(saving)"
                    class="q-mt-xs"
                    rounded
                  />
                </div>
              </div>
            </q-item-section>
            <q-item-section side class="text-weight-bold text-positive">
              {{ formatCurrency(saving.currentAmount) }}
            </q-item-section>
          </q-item>

          <!-- Smooth Sliding Contributions List -->
          <q-slide-transition>
            <div v-if="expandedSavingId === saving.id">
              <q-item style="margin-left: 5px;max-width: 80px;" >
                <q-item-section style="margin-bottom: 8px;">
                  <q-icon name="subdirectory_arrow_right" size="sm"/>
                </q-item-section>
                <q-item-section style="margin-left: -25px;">
                  <q-item-label header>Contributions</q-item-label>
                </q-item-section>
              </q-item>
              <q-list dense>
                <q-item v-for="contribution in getContributions(saving.id)" :key="contribution.id" 
                  style="margin-left: 35px;" clickable> 
                  <q-item-section>
                    <q-item-label>
                      {{ formatCurrency(contribution.amount) }} 
                      <span class="text-grey-7">({{ formatDate(contribution.date) }})</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="getContributions(saving.id).length === 0" style="margin-left: 33px;">
                  <q-item-section>No contributions yet.</q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-slide-transition>
        </template>
      </q-list>
    </div>

    <!-- Footer: Balance & Add New Expense -->
    <q-footer class="bg-white">
      <div class="q-pa-xs flex flex-center">
        <q-pagination
          v-model="currentPage"
          :max="3"
          input
        />
      </div>
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">Balance</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance) }}
        </div>
      </div>

      <q-form class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
        <div class="row items-center q-pr-md">
          <q-btn icon="add" label="New Contribution" color="white" flat  class="q-mr-sm" @click="isContributionDialogOpen = true"/>
          <q-btn icon="savings" label="New Saving Goal" color="white" flat class="q-mr-sm" @click="isDialogOpen = true"/>
        </div>
        <div class="col">
          <q-input v-model="searchQuery" outlined dense bg-color="white" placeholder="Search savings" class="q-mb-sm"></q-input>
        </div>
      </q-form>
    </q-footer>
    <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingIncomes">
      <q-spinner
        color="primary"
        size="3em"
        :thickness="2"
      />
      <span class="q-mt-xs">Loading savings...</span>
    </div>
    <SavingGoalDialog
      v-model="isDialogOpen"
      :savingGoal="selectedSavingGoal"
      :isNewSavingGoal="true"
      @save="handleSavingGoalSave"
    />
    <SavingContributionDialog 
      v-model="isContributionDialogOpen" 
      @save="addContribution" 
      :isNewSavingContribution="true"
    />
  </q-page>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { format } from 'date-fns';
import { storeToRefs } from 'pinia'
import { useIncomesStore } from 'src/stores/incomesStore'
import { amountColor } from 'src/helpers/amountColor.js'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { getIncomeIcon, getIncomeColor } from 'src/helpers/incomeUtils.js'
import SavingGoalDialog from 'src/components/Savings/SavingGoalDialog.vue'
import SavingContributionDialog from 'src/components/Savings/SavingContributionDialog.vue'

const $q = useQuasar()
const currentPage = ref(1)
const incomesStore = useIncomesStore()
const { entries, categories, totalBalance } = storeToRefs(incomesStore)

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
let loadingIncomes = ref(false)
const itemsPerPage = 10  // Number of entries per page
const isNewIncome = ref(false)
const isContributionDialogOpen = ref(false)

const incomeCategoriesCount = computed(() => categories.value.length);

const currentMonthName = computed(() =>
  format(new Date(selectedYear.value, selectedMonth.value), 'MMMM')
);

// Fetch incomes on mount
onMounted(async () => {

})

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

function addContribution() {

}

function removeIncome(id) {
  incomesStore.removeIncome(id)
  // Toast notification for removing an expense
  $q.notify({
    message: 'Saving Goal deleted successfully!',
    color: 'negative',
    position: 'top-right',
    timeout: 2000
  })
}

function openDialog(income) {
  selectedSavingGoal.value = { ...income }  // Copy to avoid direct mutation
  isNewIncome.value = false
  isDialogOpen.value = true
}

function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
}

function openNewIncomeDialog() {
  selectedSavingGoal.value = null  // Clear previous data
  isNewIncome.value = true
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
function   getSavingStatusColor(saving) {
  return saving.status === "completed" ? "green-6" 
        : saving.status === "behind" ? "red-6"
        : "orange-6";
}
function getProgress(saving) {
  return saving.currentAmount / saving.goalAmount;
}
function getProgressColor(saving) {
  return saving.status === "completed" ? "green"
        : saving.status === "behind" ? "red"
        : "orange";
}
function toggleExpand(savingId) {
  expandedSavingId.value = expandedSavingId.value === savingId ? null : savingId;
}
function getContributions(savingId) {
  return contributionsList.filter(c => c.savingId === savingId);
}
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
async function handleSavingGoalSave(income) {
  console.log('SAVED!')
}
const expandedSavingId = ref(null)
const savingsList = [
      {
        id: 1,
        title: "Vacation Fund",
        goalAmount: 5000,
        currentAmount: 3200,
        status: "in-progress" // "in-progress", "completed", "behind"
      },
      {
        id: 2,
        title: "Emergency Fund",
        goalAmount: 10000,
        currentAmount: 10000,
        status: "completed"
      },
      {
        id: 3,
        title: "New Laptop",
        goalAmount: 1500,
        currentAmount: 700,
        status: "behind"
      },
      {
        id: 5,
        title: "Other",
        goalAmount: 10000,
        currentAmount: 3000,
        status: "behind"
      }
  ]
const contributionsList = [
    { id: 1, savingId: 1, amount: 500, date: "2025-03-10" },
    { id: 2, savingId: 1, amount: 300, date: "2025-02-20" },
    { id: 3, savingId: 2, amount: 5000, date: "2024-12-01" },
    { id: 4, savingId: 3, amount: 200, date: "2025-03-01" },
    { id: 5, savingId: 3, amount: 500, date: "2025-02-15" },
    { id: 6, savingId: 4, amount: 1000, date: "2025-01-10" },
    { id: 7, savingId: 4, amount: 2500, date: "2025-02-05" }
  ]
</script>
