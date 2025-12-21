<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center auth-page">

        <!-- App Title in top-left corner of page -->
        <div class="app-title">
          <q-avatar>
            <q-icon name="track_changes" size="md" />
          </q-avatar>
          <span class="title-text">Dime Track</span>
        </div>

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
  background: linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%);
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
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
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
  background: #FAFAFA;
  z-index: 2;
}

/* Right Panel (Message) */
.panel-right {
  background: linear-gradient(135deg, #1E88E5 0%, #26A69A 100%);
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

.app-title {
  position: absolute;
  top: 16px;
  left: 20px;
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: rgb(58, 55, 55);
}

.app-title .q-avatar {
  margin-right: 8px;
  background-color: #1E88E5;
  color: white;
}

.title-text {
  font-family: "Roboto", sans-serif;
}

/* Form styling */
.form-container {
  h2 {
    font-size: 28px;
    font-weight: 600;
    color: #263238;
    margin-bottom: 32px;
    text-align: center;
  }

  .q-input {
    margin-bottom: 16px;
  }

  .q-btn {
    margin-top: 16px;
    background: #1E88E5;
    border-radius: 8px;
    height: 48px;
    font-weight: 500;
    text-transform: none;
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);

    &:hover {
      background: #1565C0;
      box-shadow: 0 6px 16px rgba(30, 136, 229, 0.4);
    }
  }
}

/* Switch panel styling */
.switch-panel {
  h2 {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 320px;
    text-align: center;
  }

  .q-btn {
    border: 2px solid white;
    color: white;
    border-radius: 8px;
    font-weight: 500;
    padding: 12px 32px;
    text-transform: none;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

</style>
