<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center auth-page">
        <div class="auth-wrapper">

          <div class="auth-card" :class="{ 'sign-up-mode': mode === 'register' }">

            <!-- Panels Container -->
            <div class="panels-container">

              <!-- Left Panel (Form) -->
              <div class="panel panel-left">
                <div v-if="mode === 'login'" class="form-container">
                  <h2>Sign In</h2>
                  <q-input v-model="form.email" type="email" label="Email" outlined dense />
                  <q-input v-model="form.password" type="password" label="Password" outlined dense />
                  <q-btn label="SIGN IN" color="orange-7" unelevated class="full-width" @click="handleSubmit" />
                </div>

                <div v-if="mode === 'register'" class="form-container">
                  <h2>Create Account</h2>
                  <q-input v-model="form.name" label="Name" outlined dense />
                  <q-input v-model="form.username" label="Username" outlined dense />
                  <q-input v-model="form.email" type="email" label="Email" outlined dense />
                  <q-input v-model="form.password" type="password" label="Password" outlined dense />
                  <q-input v-model="form.confirm" type="password" label="Confirm Password" outlined dense />
                  <q-btn label="SIGN UP" color="orange-7" unelevated class="full-width" @click="handleSubmit" />
                </div>
              </div>

              <!-- Right Panel (Switch Panel / Message) -->
              <div class="panel panel-right">
                <div v-if="mode === 'login'" class="switch-panel">
                  <h2>Hello, Friend!</h2>
                  <p>Enter your personal details and start your journey with us</p>
                  <q-btn flat color="white" label="SIGN UP" outlined @click="toggleMode" />
                </div>
                <div v-if="mode === 'register'" class="switch-panel">
                  <h2>Welcome Back!</h2>
                  <p>To keep connected with us please login with your personal info</p>
                  <q-btn flat color="white" label="SIGN IN" outlined @click="toggleMode" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { Dark } from 'quasar';

const authStore = useAuthStore()
const mode = ref('login') // 'login' or 'register'

const form = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  confirm: ''
})

onMounted(() => {
  Dark.set(false);
})
function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
}

function handleSubmit() {
  if (mode.value === 'login') {
    authStore.login(form.value.email, form.value.password)
  } else {
    authStore.register(form.value.name, form.value.username,
    form.value.email, form.value.password)
  }
}
</script>

<style scoped>
.q-page {
  background: linear-gradient(to right, #ff7e5f, #feb47b);
}
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.auth-card {
  width: 800px;
  height: 500px;
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  position: relative;
}

/* Panels Container */
.panels-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

/* Panels */
.panel {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  transition: transform 0.6s ease-in-out;
}

/* Left Panel (Form) */
.panel-left {
  background: white;
  z-index: 2;
}

/* Right Panel (Message) */
.panel-right {
  background: #ff6b81;
  color: white;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Slide animation when switching modes */
.auth-card.sign-up-mode .panel-left {
  transform: translateX(100%);
}
.auth-card.sign-up-mode .panel-right {
  transform: translateX(-100%);
}

/* Optional: smooth fade of right panel text */
.switch-panel {
  transition: opacity 0.6s ease-in-out;
}
</style>
