<template>
  <q-page style="margin-left: 20px;background-color: black;">
    <!-- Month/Year Filter & View Toggle -->
    <div class="row justify-between items-center q-my-md q-px-md">
      <div class="row items-center justify-center col" style="margin-right: -180px;">
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

    <!-- Summary Cards -->
    <div class="row q-col-gutter-sm" style="margin-left: 26px;">
      <div class="col-12 col-sm-4 q-px-xs q-mb-sm" style="width: 595px;">
        <q-card class="q-pa-sm full-height column justify-between" style="border-radius: 16px; box-shadow: 0 1px 5px rgba(0,0,0,0.1); height: 100%;">
          <q-card-section>
            <div class="text-caption text-grey-6">{{ t('totalIncome') }}</div>
            <div class="text-h6 text-positive font-weight-bold">{{ summary[0].value }}</div>
            <div class="q-mt-sm text-body2 text-grey-8" style="font-size: 14px;">
              {{ t('projectedIncome') }}: <span class="text-positive">5,500 zł</span>
            </div>
            <div class="text-body2 text-grey-6" style="font-size: 14px;">
              {{ t('incomeGrowth') }}: <span class="text-positive">+5% from last month</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4 q-px-xs q-mb-sm" style="width: 595px;">
        <q-card class="q-pa-sm full-height column justify-between" style="border-radius: 16px; box-shadow: 0 1px 5px rgba(0,0,0,0.1); height: 100%;">
          <q-card-section>
            <div class="text-caption text-grey-6">{{ t('totalExpenses') }}</div>
            <div class="text-h6 text-negative font-weight-bold">{{ summary[1].value }}</div>
            <div class="q-mt-sm text-body2 text-negative" style="font-size: 14px;">
              {{ t('overBudget') }}: <span class="text-negative">200 zł over budget</span>
            </div>
            <div class="text-body2 text-grey-6" style="font-size: 14px;">
              {{ t('expenseGrowth') }}: <span class="text-positive">+3% from last month</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4 q-px-xs q-mb-sm" style="width: 595px;">
        <q-card class="q-pa-sm full-height column justify-between" style="border-radius: 16px; box-shadow: 0 1px 5px rgba(0,0,0,0.1); height: 100%;">
          <q-card-section>
            <div class="text-caption text-grey-6">{{ t('totalSavings') }}</div>
            <div class="text-h6 font-weight-bold">{{ summary[2].value }}</div>
            <q-linear-progress size="8px" class="q-mt-sm" color="primary" :value="savingsPercent" rounded />
            <div class="text-body2 text-grey" style="font-size: 14px;">
              {{ Math.round(savingsPercent * 100) }}% {{ t('ofIncomeSaved') }}
            </div>
            <div class="text-body2 text-grey-8 q-mt-sm" style="font-size: 12px;">
              {{ t('remainingToGoals') }}: <span class="text-negative">1,000 zł left to save</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="activeTab" dense align="left" class="text-primary q-px-md" style="margin-left: 20px;">
      <q-tab name="all" label="All" />
      <q-tab name="overview" label="Overview" />
      <q-tab name="spending" label="Spending" />
      <q-tab name="income" label="Income" />
      <q-tab name="savings" label="Savings" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="q-px-md q-mt-md" style="background-color: black;">
      <q-tab-panel name="overview">
        <div class="row justify-center">
          <q-card class="col-12 col-md-7 q-pa-sm q-mb-md" style="max-width: 600px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeVsExpenses') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="barOptions" :series="barSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="spending">
        <div class="row justify-center">
          <q-card class="col-12 col-md-6 q-pa-sm q-mb-md" style="max-width: 500px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('spendingBreakdown') }}</div>
              <apexchart :key="chartKey" type="pie" height="250" :options="pieOptions" :series="pieSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-6 q-pa-sm q-mb-md" style="max-width: 500px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('expenseLimitTracking') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="limitOptions" :series="limitSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="income">
        <div class="row justify-center">
          <q-card class="col-12 col-md-7 q-pa-sm q-mb-md" style="max-width: 600px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeCategories') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="barOptions" :series="[barSeries[0]]" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="savings">
        <div class="row justify-center">
          <q-card class="col-12 col-md-7 q-pa-sm q-mb-md" style="max-width: 600px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('savingsOverTime') }}</div>
              <apexchart :key="chartKey" type="line" height="250" :options="lineOptions" :series="lineSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="all">
        <div class="row q-gutter-md justify-center">
          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md" style="max-width: 342px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeVsExpenses') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="barOptions" :series="barSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('spendingBreakdown') }}</div>
              <apexchart :key="chartKey" type="pie" height="250" :options="pieOptions" :series="pieSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('expenseLimitTracking') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="limitOptions" :series="limitSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeCategories') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="barOptions" :series="[barSeries[0]]" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('savingsOverTime') }}</div>
              <apexchart :key="chartKey" type="line" height="250" :options="lineOptions" :series="lineSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ApexCharts from 'vue3-apexcharts'
import { useLangStore } from 'src/stores/langStore'

const { t } = useLangStore()
const apexchart = ApexCharts

const viewMode = ref('monthly')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())
const activeTab = ref('all')
const chartKey = ref(0)

onMounted(() => {
  setTimeout(() => {
    chartKey.value++
  }, 100)
})

watch(activeTab, () => {
  chartKey.value++
})

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

const pieSeries = ref([1000, 900, 600, 400, 500])
const pieOptions = computed(() => ({
  labels: ['Rent', 'Groceries', 'Transport', 'Utilities', 'Entertainment'],
  legend: { position: 'bottom' },
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
  { name: 'Savings', data: viewMode.value === 'monthly' ? [1800] : [1300, 1500, 1800, 1900] }
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

const limitSeries = ref([
  { name: 'Actual', data: [400, 250, 180] }
])

const limitOptions = ref({
  chart: { type: 'bar', stacked: false, toolbar: { show: false } },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      dataLabels: { position: 'top' }
    }
  },
  xaxis: {
    categories: ['Food', 'Transport', 'Entertainment'],
    max: 500
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
    formatter: val => `$${val}`
  },
  grid: {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: false } }
  }
})

const summary = [
  { value: '5,200 zł', count: 6, average: '866.67 zł' },
  { value: '3,800 zł', count: 12, average: '316.67 zł' },
  { value: '1,400 zł', diff: '+200 zł' }
]

const savingsPercent = 0.269
</script>
