import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient.js'
import { useOnboardingStore } from './onboarding.js'

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

  const signUp = async (email, password) => await supabase.auth.signUp({ email, password })
  const signIn = async (email, password) =>
    await supabase.auth.signInWithPassword({ email, password })
  const signOut = async () => {
    await supabase.auth.signOut()
    useOnboardingStore().reset()
  }

  const refreshOnboarding = async () => {
    if (!user.value) return
    const { data, error } = await supabase.rpc('is_onboarded')
    onboardingComplete.value = error ? false : !!data
  }

  return { user, refreshOnboarding, onboardingComplete, ready, signUp, signIn, signOut }
})
