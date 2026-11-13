import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient.js'
import { useOnboardingStore } from './onboarding.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAdmin = ref(false)
  const ready = ref(false)
  const onboardingComplete = ref(false)

  async function loadProfile() {
    if (!user.value) {
      isAdmin.value = false
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.value.id)
      .maybeSingle()
    isAdmin.value = data?.is_admin ?? false
  }

  // The router guard awaits this, so pages never render before we know who the user is
  const init = supabase.auth
    .getSession()
    .then(async ({ data }) => {
      user.value = data.session?.user ?? null
      await loadProfile()
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
    // setTimeout avoids a known deadlock when calling supabase inside this callback
    setTimeout(loadProfile, 0)
  })

  const signUp = (email, password) => supabase.auth.signUp({ email, password })

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (!result.error) {
      user.value = result.data.user
      await loadProfile()
    }
    return result
  }

  // --- GUEST LOGIN (TEMPORARY!!!) ---
  const signInGuest = async () => {
    const result = await supabase.auth.signInWithPassword({
      email: import.meta.env.VITE_GUEST_EMAIL,
      password: import.meta.env.VITE_GUEST_PASSWORD,
    })
    if (!result.error) {
      user.value = result.data.user
      isAdmin.value = false
    }
    return result
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    useOnboardingStore().reset()
  }

  const refreshOnboarding = async () => {
    if (!user.value) return
    const { data, error } = await supabase.rpc('is_onboarded')
    onboardingComplete.value = error ? false : !!data
  }

  return {
    user,
    isAdmin,
    ready,
    init,
    onboardingComplete,
    refreshOnboarding,
    signUp,
    signIn,
    signInGuest,
    signOut,
  }
})
