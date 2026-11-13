import { supabase } from './supabaseClient'

// Turns the join-table rows into a plain, ordered `exercises` array
function withExercises(course) {
  const exercises = [...(course.course_exercises ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => link.exercises)
    .filter(Boolean)
  const { ...rest } = course
  return { ...rest, exercises }
}

// All published courses, for Home and Programs
export async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(
      'id, title, description, level, thumbnail_url, sort_order, course_exercises(sort_order, exercises(id, title))',
    )
    .eq('published', true)
    .order('sort_order')
  if (error) throw error
  return data.map(withExercises)
}

// One published course with full exercises, for the workout
export async function fetchCourse(id) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_exercises(sort_order, exercises(*))')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()
  if (error) throw error
  return data ? withExercises(data) : null
}
