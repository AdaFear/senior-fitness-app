import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export const useOnboardingStore = defineStore('onboarding', () => {
  const currentStep = ref(0)

  const data = reactive({
    goals: [],
    activity_level: '',
    training_style: '', // string, since is_multichoice is false
  })

  const reset = () => {
    ;((data.goals = []), (data.activity_level = ''))
    ;((data.training_style = ''), (currentStep.value = 0))
  }

  const steps = [
    {
      id: 'goals',
      title: 'Vad är dina träningsmål?',
      is_multichoice: true,
      options: [
        { value: 'become_stronger', title: 'Bygga styrka för att orka mer i vardagen.' },
        { value: 'improve_balance', title: 'Känna mig tryggare när jag står, går och rör mig.' },
        {
          value: 'improve_flexibility',
          title: 'Bli smidigare och lättare kunna utföra vardagliga rörelser.',
        },
        { value: 'improve_cardio', title: 'Förbättra min kondition och uthållighet.' }, // was a duplicate of improve_flexibility
        { value: 'reduce_weight', title: 'Uppnå en hälsosam vikt med hjälp av anpassad träning.' },
        { value: 'build_muscle', title: 'Öka eller bibehålla min muskelmassa.' },
        { value: 'prevent_injury', title: 'Förbättra styrka, stabilitet och kroppskontroll.' },
        {
          value: 'improve_livelihood',
          title: 'Lättare kunna resa mig, gå i trappor, bära saker och sköta vardagssysslor.',
        },
        { value: 'start_training', title: 'Börja röra mig mer utifrån mina egna förutsättningar.' },
        {
          value: 'recover_from_operation',
          title: 'Återfå styrka och rörlighet med anpassad träning.',
        },
        {
          value: 'prepare_for_operation',
          title: 'Förbättra min fysiska kapacitet inför ett planerat ingrepp.',
        },
        {
          value: 'reduce_weight_for_operation',
          title: 'Arbeta mot ett viktmål som rekommenderats inför operationen.',
        },
        {
          value: 'stay_independent',
          title: 'Fortsätta kunna leva ett aktivt och självständigt liv.',
        },
        {
          value: 'reduce_staleness',
          title: 'Förbättra rörligheten och känna mig mindre stel i kroppen.',
        },
        {
          value: 'improve_health',
          title: 'Förbättra mitt allmänna välbefinnande genom fysisk aktivitet',
        },
      ],
    },
    {
      id: 'activity_level',
      title: 'Vad är din rörelsenivå',
      is_multichoice: false,
      options: [
        {
          value: 'requires_assistance',
          title:
            'Jag har begränsad rörlighet och behöver ibland hjälp eller stöd för att röra mig och utför vardagliga aktiviteter.',
        },
        {
          value: 'restricted_mobility',
          title:
            'Jag använder exempelvis rollator eller käpp och vill förbättra min styrka, balans och rörlighet.',
        },
        {
          value: 'rarely_active',
          title:
            'Jag klarar mina vardagliga aktiviteter själv men motionerar eller tränar inte regelbundet',
        },
        {
          value: 'active',
          title:
            'Jag promenerar, cyklar eller rör mig regelbundet och vill bibehålla eller förbättra min fysiska förmåga.',
        },
        {
          value: 'very_active',
          title:
            'Jag tränar styrka, kondition eller balans flera gånger i veckan och vill fortsätta utvecklas.',
        },
      ],
    },
    {
      id: 'training_style',
      title: 'Hur vill du träna?',
      is_multichoice: false,
      options: [
        { value: 'sitting', title: 'Övningar utförs på en stol.' },
        { value: 'standing', title: 'Övningar stående, med eller utan stöd.' },
        { value: 'lying', title: 'Övningar liggandes på en matta eller i sängen' },
        { value: 'varied', title: 'Kombination av sittande, stående och liggande övningar' },
      ],
    },
  ]

  const isSummary = computed(() => currentStep.value === steps.length)
  const current = computed(() => steps[currentStep.value] || null)

  const can_go_next = computed(() => {
    if (isSummary.value || !current.value) return false
    const answer = data[current.value.id]
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
  })

  const can_go_back = computed(() => currentStep.value > 0)

  const next = () => {
    if (can_go_next.value && currentStep.value < steps.length) {
      currentStep.value++
    }
  }

  const back = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  // Resolve selected option values into readable titles for the summary
  const summaryDetails = computed(() => {
    return steps.map((step) => {
      const selected = data[step.id]
      const selectedValues = Array.isArray(selected) ? selected : [selected].filter(Boolean)
      const matchedOptions = step.options.filter((opt) => selectedValues.includes(opt.value))
      return {
        id: step.id,
        question: step.title,
        answers: matchedOptions,
      }
    })
  })

  // Jump back to a specific step from the summary to edit an answer
  const goToStep = (index) => {
    if (index >= 0 && index < steps.length) {
      currentStep.value = index
    }
  }

  const isSubmitting = ref(false)
  const submitError = ref(null)

  const submit = async () => {
    if (isSubmitting.value) return null
    isSubmitting.value = true
    submitError.value = null

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      console.log('checking that id is', user.id)

      if (userError || !user) {
        submitError.value = 'Du är inte inloggad.'
        return null
      }

      const { data: row, error } = await supabase
        .from('profiles_duplicate_by_william')
        .update({
          goals: [...data.goals],
          activity_level: data.activity_level, // plain string (enum)
          training_style: [data.training_style], // plain string (enum)
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        submitError.value = error.message
        return null
      }
      return row
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    currentStep,
    steps,
    data,
    current,
    isSummary,
    can_go_next,
    can_go_back,
    summaryDetails,
    next,
    back,
    goToStep,
    isSubmitting,
    submitError,
    submit,
    reset,
  }
})
