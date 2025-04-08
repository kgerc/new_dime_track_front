<template>
  <q-page :class="isDarkMode ? 'black' : 'bg-grey-1'" style="margin-left: 20px;">
    <!-- Month/Year Filter & View Toggle -->
    <div class="row justify-between items-center q-my-md q-px-md">
      <div class="row items-center justify-center col" :style="{ 'margin-right': viewMode === 'monthly' ? '70px' : '-180px' }">
        <q-btn icon="arrow_back" flat @click="prevPeriod" />
        <div class="q-mx-md text-h6">
          {{ viewMode === 'monthly' ? `${currentMonthName} ${selectedYear}` : selectedYear }}
        </div>
        <q-btn icon="arrow_forward" flat @click="nextPeriod" />
      </div>
      <q-btn flat dense @click="toggleViewMode">
        {{ viewMode === 'monthly' ? t('switchToYearlyMode') : t('switchToMonthlyMode') }}
      </q-btn>
    </div>

    <!-- Compact Monthly Summary -->
    <div class="row q-col-gutter-md q-px-md q-mb-md">
      <!-- Income -->
      <q-card class="col-12 col-sm-4 q-pa-sm" style="border-radius: 16px; box-shadow: 0 1px 5px rgba(0,0,0,0.05);">
        <q-card-section>
          <div class="text-caption text-grey-6">{{ t('totalIncome') }}</div>
          <div class="text-h6 text-positive">{{ summary[0].value }}</div>
        </q-card-section>
      </q-card>

      <!-- Expenses -->
      <q-card class="col-12 col-sm-4 q-pa-sm" style="border-radius: 16px; box-shadow: 0 1px 5px rgba(0,0,0,0.05);">
        <q-card-section>
          <div class="text-caption text-grey-6">{{ t('totalExpenses') }}</div>
          <div class="text-h6 text-negative">{{ summary[1].value }}</div>
        </q-card-section>
      </q-card>

      <!-- Savings with progress -->
      <q-card class="col-12 col-sm-4 q-pa-sm" style="border-radius: 16px; box-shadow: 0 1px 5px rgba(0,0,0,0.05);">
        <q-card-section>
          <div class="text-caption text-grey-6">{{ t('totalSavings') }}</div>
          <div class="text-h6">{{ summary[2].value }}</div>
          <q-linear-progress
            size="8px"
            class="q-mt-sm"
            color="primary"
            :value="savingsPercent"
            rounded
          />
          <div class="text-caption q-mt-xs text-grey">
            {{ Math.round(savingsPercent * 100) }}% {{ t('ofIncomeSaved') }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Charts Section -->
    <div class="row q-col-gutter-md q-px-md">
      <!-- Spending Breakdown Pie Chart -->
      <q-card class="col-12 col-md-4 q-pa-sm" style="border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('spendingBreakdown') }}</div>
          <apexchart type="pie" height="250" :options="pieOptions" :series="pieSeries" />
        </q-card-section>
      </q-card>

      <!-- Income vs Expenses Bar Chart -->
      <q-card class="col-12 col-md-4 q-pa-sm" style="border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('incomeVsExpenses') }}</div>
          <apexchart type="bar" height="250" :options="barOptions" :series="barSeries" />
        </q-card-section>
      </q-card>

      <!-- Expense Limit Tracking -->
      <q-card class="col-12 col-md-4 q-pa-sm" style="border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('expenseLimitTracking') }}</div>
          <apexchart type="bar" height="250" :options="limitOptions" :series="limitSeries" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


<script setup>
import { ref, computed } from 'vue'
import ApexCharts from 'vue3-apexcharts'
import { useLangStore } from "src/stores/langStore"

const apexchart = ApexCharts
const { t } = useLangStore()
const isDarkMode = false // You can link this to your actual dark mode state

const viewMode = ref('monthly')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())

const monthNames = computed(() => [
  t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
  t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
])

const currentMonthName = computed(() => monthNames.value[selectedMonth.value])

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'monthly' ? 'yearly' : 'monthly'
}

const prevPeriod = () => {
  if (viewMode.value === 'monthly') {
    if (selectedMonth.value === 0) {
      selectedMonth.value = 11
      selectedYear.value--
    } else {
      selectedMonth.value--
    }
  } else {
    selectedYear.value--
  }
}

const nextPeriod = () => {
  if (viewMode.value === 'monthly') {
    if (selectedMonth.value === 11) {
      selectedMonth.value = 0
      selectedYear.value++
    } else {
      selectedMonth.value++
    }
  } else {
    selectedYear.value++
  }
}

const summary = ref([
  { label: t('totalIncome'), value: '$5,200' },
  { label: t('totalExpenses'), value: '$3,400' },
  { label: t('totalSavings'), value: '$1,800' }
])

const pieSeries = ref([1000, 900, 600, 400, 500])
const pieOptions = computed(() => ({
  labels: ['Rent', 'Groceries', 'Transport', 'Utilities', 'Entertainment'],
  title: {
    text: '',
    align: 'center',
    style: { fontSize: '14px' }
  },
  legend: {
    position: 'bottom'
  },
  responsive: [{ breakpoint: 480, options: { chart: { width: 300 } } }]
}))

const barSeries = ref([
  {
    name: 'Income',
    data: viewMode.value === 'monthly' ? [4800] : [4500, 4800, 5200, 5100]
  },
  {
    name: 'Expenses',
    data: viewMode.value === 'monthly' ? [3400] : [3200, 3500, 3400, 3600]
  }
])
const barOptions = computed(() => ({
  chart: { stacked: false },
  xaxis: {
    categories: viewMode.value === 'monthly'
      ? [monthNames.value[selectedMonth.value]]
      : ['Jan', 'Feb', 'Mar', 'Apr']
  },
  plotOptions: {
    bar: { horizontal: false, columnWidth: '50%' }
  },
  colors: ['#21BA45', '#DB2828']
}))

const lineSeries = ref([
  {
    name: 'Savings',
    data: viewMode.value === 'monthly' ? [1800] : [1300, 1500, 1800, 1900]
  }
])
const lineOptions = computed(() => ({
  xaxis: {
    categories: viewMode.value === 'monthly'
      ? [monthNames.value[selectedMonth.value]]
      : ['Jan', 'Feb', 'Mar', 'Apr']
  },
  stroke: { curve: 'smooth' },
  colors: ['#007BFF']
}))

// Limit Tracking Data
const limitSeries = ref([
  {
    name: 'Actual',
    data: [400, 250, 180]
  }
])

const limitOptions = ref({
  chart: {
    type: 'bar',
    stacked: false,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      dataLabels: {
        position: 'top'
      }
    }
  },
  xaxis: {
    categories: ['Food', 'Transport', 'Entertainment'],
    max: 500 // Set this to the highest limit for consistent scale
  },
  annotations: {
    xaxis: [
      { x: 500, borderColor: '#FF0000', label: { text: 'Limit', style: { color: '#fff', background: '#FF0000' } } },
      { x: 300, borderColor: '#FFA500', label: { text: 'Limit', style: { color: '#fff', background: '#FFA500' } } },
      { x: 200, borderColor: '#0088FE', label: { text: 'Limit', style: { color: '#fff', background: '#0088FE' } } }
    ]
  },
  colors: ['#007BFF'],
  dataLabels: {
    enabled: true,
    formatter: (val) => `$${val}`
  },
  grid: {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: false } }
  }
})

const savingsPercent = computed(() => {
  const income = parseFloat(summary.value[0].value.replace(/[^0-9.-]+/g,""))
  const savings = parseFloat(summary.value[2].value.replace(/[^0-9.-]+/g,""))
  return income ? savings / income : 0
})
</script>
