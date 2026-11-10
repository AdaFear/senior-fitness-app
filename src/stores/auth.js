import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const onboardingComplete = ref(false)

  supabase.auth
    .getSession()
    .then(({ data }) => {
      user.value = data.session?.user ?? null
    })
    .catch((e) => console.error('getSession failed', e))
    .finally(() => {
      ready.value = true
    })

  supabase.auth.onAuthStateChange((_event, session) => {
    const oldId = user.value?.id ?? null
    const newId = session?.user?.id ?? null
    user.value = session?.user ?? null
    if (oldId !== newId) onboardingComplete.value = false
  })

  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  const refreshOnboarding = async () => {
    if (!user.value) return
    const { data, error } = await supabase.rpc('is_onboarded')
    onboardingComplete.value = error ? false : !!data
  }

  return { user, refreshOnboarding, onboardingComplete, ready, signUp, signIn, signOut }
})
