<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { renderContent, toEmbedUrl } from '@/lib/courseUtils'

const tab = ref('courses') // 'courses' | 'exercises'
const message = ref('')
const saving = ref(false)

const courses = ref([])
const exercises = ref([])
const links = ref([]) // rows from course_exercises

const exerciseById = computed(() => Object.fromEntries(exercises.value.map((e) => [e.id, e])))
const courseCount = (exerciseId) => links.value.filter((l) => l.exercise_id === exerciseId).length

// NEW: direct video files (.mp4 etc.) are allowed too, the workout page can play them
const isDirectVideo = (url) => /\.(mp4|webm|ogg)(\?|$)/i.test(url)

async function loadAll() {
  const [c, e, l] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabase.from('exercises').select('*').order('created_at', { ascending: false }),
    supabase.from('course_exercises').select('*'),
  ])
  const err = c.error || e.error || l.error
  if (err) message.value = 'Error loading: ' + err.message
  courses.value = c.data || []
  exercises.value = e.data || []
  links.value = l.data || []
}

async function uploadImage(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('course-images').upload(path, file)
  if (error) {
    message.value = 'Upload failed: ' + error.message
    return null
  }
  return supabase.storage.from('course-images').getPublicUrl(path).data.publicUrl
}

/* ---------------- Exercises ---------------- */
const eEditingId = ref(null)
const eTitle = ref('')
const eVideoUrl = ref('')
const eContent = ref('')
// NEW fields
const eSteps = ref('') // one step per line
const eReps = ref('')
const eSeconds = ref('')
const ePerSide = ref(false)

function resetExerciseForm() {
  eEditingId.value = null
  eTitle.value = ''
  eVideoUrl.value = ''
  eContent.value = ''
  eSteps.value = ''
  eReps.value = ''
  eSeconds.value = ''
  ePerSide.value = false
}

function startEditExercise(ex) {
  eEditingId.value = ex.id
  eTitle.value = ex.title
  eVideoUrl.value = ex.video_url || ''
  eContent.value = ex.content || ''
  eSteps.value = (ex.steps ?? []).join('\n')
  eReps.value = ex.reps ?? ''
  eSeconds.value = ex.seconds ?? ''
  ePerSide.value = ex.per_side ?? false
  message.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveExercise() {
  message.value = ''
  if (!eTitle.value.trim()) {
    message.value = 'Title is required.'
    return
  }
  const url = eVideoUrl.value.trim()
  if (url && !toEmbedUrl(url) && !isDirectVideo(url)) {
    message.value = 'Video link not recognised (use a YouTube/Vimeo link or a direct .mp4 link).'
    return
  }
  const row = {
    title: eTitle.value.trim(),
    video_url: url || null,
    content: eContent.value,
    steps: eSteps.value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    reps: eReps.value.trim() || null,
    seconds: Number(eSeconds.value) || null,
    per_side: ePerSide.value,
  }
  saving.value = true
  const { error } = eEditingId.value
    ? await supabase.from('exercises').update(row).eq('id', eEditingId.value)
    : await supabase.from('exercises').insert(row)
  saving.value = false
  if (error) {
    message.value = 'Error: ' + error.message
    return
  }
  message.value = eEditingId.value ? 'Exercise updated!' : 'Exercise added!'
  resetExerciseForm()
  await loadAll()
}

async function deleteExercise(id) {
  if (!confirm('Delete this exercise? It will also be removed from every course.')) return
  const { error } = await supabase.from('exercises').delete().eq('id', id)
  if (error) message.value = 'Error: ' + error.message
  if (eEditingId.value === id) resetExerciseForm()
  await loadAll()
}

async function onExerciseImage(event) {
  const file = event.target.files[0]
  if (!file) return
  const url = await uploadImage(file)
  if (url) eContent.value += `\n\n![${file.name}](${url})\n\n`
  event.target.value = ''
}

/* ---------------- Courses ---------------- */
const cEditingId = ref(null)
const cTitle = ref('')
const cDescription = ref('')
const cLevel = ref(1)
const cThumb = ref('')
const cPublished = ref(false)
const cSort = ref(0)
const cSelected = ref([]) // exercise ids, in order
const cToAdd = ref('')

const availableExercises = computed(() =>
  exercises.value.filter((e) => !cSelected.value.includes(e.id)),
)

function resetCourseForm() {
  cEditingId.value = null
  cTitle.value = ''
  cDescription.value = ''
  cLevel.value = 1
  cThumb.value = ''
  cPublished.value = false
  cSort.value = 0
  cSelected.value = []
  cToAdd.value = ''
}

function startEditCourse(c) {
  cEditingId.value = c.id
  cTitle.value = c.title
  cDescription.value = c.description || ''
  cLevel.value = c.level
  cThumb.value = c.thumbnail_url || ''
  cPublished.value = c.published
  cSort.value = c.sort_order
  cSelected.value = links.value
    .filter((l) => l.course_id === c.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((l) => l.exercise_id)
  message.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function addExercise() {
  if (!cToAdd.value) return
  cSelected.value.push(Number(cToAdd.value))
  cToAdd.value = ''
}

function moveExercise(i, dir) {
  const j = i + dir
  if (j < 0 || j >= cSelected.value.length) return
  const arr = cSelected.value
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

function removeExercise(i) {
  cSelected.value.splice(i, 1)
}

async function onThumbnail(event) {
  const file = event.target.files[0]
  if (!file) return
  const url = await uploadImage(file)
  if (url) cThumb.value = url
  event.target.value = ''
}

async function saveCourse() {
  message.value = ''
  if (!cTitle.value.trim()) {
    message.value = 'Title is required.'
    return
  }
  const row = {
    title: cTitle.value.trim(),
    description: cDescription.value.trim() || null,
    level: Number(cLevel.value) || 1,
    thumbnail_url: cThumb.value.trim() || null,
    published: cPublished.value,
    sort_order: Number(cSort.value) || 0,
  }

  saving.value = true
  let id = cEditingId.value
  if (id) {
    const { error } = await supabase.from('courses').update(row).eq('id', id)
    if (error) return fail(error)
  } else {
    const { data, error } = await supabase.from('courses').insert(row).select('id').single()
    if (error) return fail(error)
    id = data.id
  }

  // Replace this course's exercise list with the current selection
  const del = await supabase.from('course_exercises').delete().eq('course_id', id)
  if (del.error) return fail(del.error)
  if (cSelected.value.length) {
    const rows = cSelected.value.map((exercise_id, i) => ({
      course_id: id,
      exercise_id,
      sort_order: i,
    }))
    const ins = await supabase.from('course_exercises').insert(rows)
    if (ins.error) return fail(ins.error)
  }

  saving.value = false
  message.value = cEditingId.value ? 'Course updated!' : 'Course added!'
  resetCourseForm()
  await loadAll()
}

function fail(error) {
  saving.value = false
  message.value = 'Error: ' + error.message
}

async function deleteCourse(id) {
  if (!confirm('Delete this course? (The exercises themselves are kept.)')) return
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) message.value = 'Error: ' + error.message
  if (cEditingId.value === id) resetCourseForm()
  await loadAll()
}

onMounted(loadAll)
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto; padding: 1rem">
    <h1>Admin</h1>

    <div style="margin-bottom: 1rem">
      <button :class="{ active: tab === 'courses' }" @click="tab = 'courses'">Courses</button>
      <button :class="{ active: tab === 'exercises' }" @click="tab = 'exercises'">Exercises</button>
    </div>

    <p v-if="message">
      <strong>{{ message }}</strong>
    </p>

    <!-- ============ COURSES ============ -->
    <section v-if="tab === 'courses'">
      <h2>{{ cEditingId ? 'Edit course' : 'Add course' }}</h2>

      <label>Title<br /><input v-model="cTitle" style="width: 100%" /></label>

      <br /><br />
      <label
        >Description<br /><textarea v-model="cDescription" rows="3" style="width: 100%" />
      </label>

      <br /><br />
      <label
        >Level (number) <input v-model.number="cLevel" type="number" min="1" style="width: 70px"
      /></label>
      &nbsp;
      <label>Sort order <input v-model.number="cSort" type="number" style="width: 70px" /></label>
      &nbsp;
      <label><input v-model="cPublished" type="checkbox" /> Published</label>

      <br /><br />
      <label>Thumbnail URL<br /><input v-model="cThumb" style="width: 100%" /></label>
      <p>Or upload: <input type="file" accept="image/*" @change="onThumbnail" /></p>
      <img v-if="cThumb" :src="cThumb" style="max-width: 200px" />

      <h3>Exercises in this course</h3>
      <p v-if="!cSelected.length">None yet.</p>
      <ol>
        <li v-for="(id, i) in cSelected" :key="id" style="margin-bottom: 4px">
          {{ exerciseById[id]?.title ?? '(missing)' }}
          <button :disabled="i === 0" @click="moveExercise(i, -1)">▲</button>
          <button :disabled="i === cSelected.length - 1" @click="moveExercise(i, 1)">▼</button>
          <button @click="removeExercise(i)">Remove</button>
        </li>
      </ol>
      <select v-model="cToAdd">
        <option value="">Add an exercise...</option>
        <option v-for="e in availableExercises" :key="e.id" :value="e.id">{{ e.title }}</option>
      </select>
      <button :disabled="!cToAdd" @click="addExercise">Add</button>

      <br /><br />
      <button :disabled="saving" @click="saveCourse">
        {{ saving ? 'Saving...' : cEditingId ? 'Update course' : 'Add course' }}
      </button>
      <button v-if="cEditingId" @click="resetCourseForm">Cancel edit</button>

      <hr />
      <h2>Existing courses ({{ courses.length }})</h2>
      <p v-if="!courses.length">No courses yet.</p>
      <ul>
        <li v-for="c in courses" :key="c.id" style="margin-bottom: 6px">
          {{ c.title }}
          <small>
            (level {{ c.level }}, {{ c.published ? 'published' : 'draft' }},
            {{ links.filter((l) => l.course_id === c.id).length }} exercises)
          </small>
          <button @click="startEditCourse(c)">Edit</button>
          <button @click="deleteCourse(c.id)">Delete</button>
        </li>
      </ul>
    </section>

    <!-- ============ EXERCISES ============ -->
    <section v-else>
      <h2>{{ eEditingId ? 'Edit exercise' : 'Add exercise' }}</h2>

      <label>Title<br /><input v-model="eTitle" style="width: 100%" /></label>

      <br /><br />
      <label
        >Video link (YouTube / Vimeo / direct .mp4)<br />
        <input
          v-model="eVideoUrl"
          placeholder="https://www.youtube.com/watch?v=..."
          style="width: 100%"
        />
      </label>
      <iframe
        v-if="toEmbedUrl(eVideoUrl)"
        :src="toEmbedUrl(eVideoUrl)"
        style="width: 100%; aspect-ratio: 16/9; border: 0; margin-top: 8px"
        allowfullscreen
      />
      <video
        v-else-if="isDirectVideo(eVideoUrl)"
        :src="eVideoUrl"
        controls
        style="width: 100%; margin-top: 8px"
      />

      <!-- NEW: steps and goal -->
      <br /><br />
      <label
        >Steps (one per line)<br />
        <textarea v-model="eSteps" rows="4" style="width: 100%" />
      </label>

      <br /><br />
      <label>Reps (e.g. 8–12) <input v-model="eReps" style="width: 100px" /></label>
      &nbsp;
      <label
        >Seconds (timed exercise, leave empty for reps)
        <input v-model="eSeconds" type="number" min="0" style="width: 80px" />
      </label>
      &nbsp;
      <label><input v-model="ePerSide" type="checkbox" /> Per side</label>

      <br /><br />
      <label
        >Extra text (Markdown, optional)<br />
        <textarea
          v-model="eContent"
          rows="8"
          style="width: 100%"
          placeholder="# Big heading&#10;## Smaller heading&#10;Normal text&#10;<small>Small text</small>"
        />
      </label>
      <p>Add image: <input type="file" accept="image/*" @change="onExerciseImage" /></p>

      <h3>Content preview</h3>
      <div v-html="renderContent(eContent)" class="preview" />

      <button :disabled="saving" @click="saveExercise">
        {{ saving ? 'Saving...' : eEditingId ? 'Update exercise' : 'Add exercise' }}
      </button>
      <button v-if="eEditingId" @click="resetExerciseForm">Cancel edit</button>

      <hr />
      <h2>Existing exercises ({{ exercises.length }})</h2>
      <p v-if="!exercises.length">No exercises yet.</p>
      <ul>
        <li v-for="e in exercises" :key="e.id" style="margin-bottom: 6px">
          {{ e.title }}
          <small>(in {{ courseCount(e.id) }} courses)</small>
          <button @click="startEditExercise(e)">Edit</button>
          <button @click="deleteExercise(e.id)">Delete</button>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.preview :deep(img) {
  max-width: 100%;
}

input:not([type='file']):not([type='checkbox']),
textarea,
select {
  background: #eef4ff;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  padding: 6px 8px;
  box-sizing: border-box;
}

input:not([type='file']):focus,
textarea:focus {
  outline: 2px solid #3b82f6;
  background: #e0ecff;
}

button {
  border: 1px solid #94a3b8;
  background: #f1f5f9;
  border-radius: 4px;
  padding: 4px 10px;
  margin-right: 6px;
  cursor: pointer;
}

button.active {
  background: #3b82f6;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
