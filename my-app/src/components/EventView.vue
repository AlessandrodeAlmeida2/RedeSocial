<template>
    <div class="container-eventos">
      <div class="header">
        <h1>Eventos Aprovados</h1>
        <v-btn color="primary" @click="dialog = true">+ Publicar Evento</v-btn>
      </div>
  
      <v-sheet class="mx-auto" width="800">
        <v-alert v-if="eventos.length === 0" type="info" class="mb-4">
          Nenhum evento disponível no momento.
        </v-alert>
  
        <v-card
          v-for="evento in eventos"
          :key="evento.id"
          class="mb-4"
          variant="tonal"
        >
          <v-card-title>{{ evento.title }}</v-card-title>
          <v-card-subtitle>Data: {{ formatarData(evento.date) }}</v-card-subtitle>
          <v-card-text>{{ evento.body }}</v-card-text>
          <v-card-actions>
            <v-btn @click="participarDoEvento(evento.id)" color="primary">
                Participar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-sheet>
  
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title class="headline">Publicar Evento</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitEvent">
              <v-text-field
                v-model="title"
                label="Título do Evento"
                variant="solo-filled"
                required
              ></v-text-field>
  
              <v-textarea
                v-model="body"
                label="Descrição do Evento"
                variant="solo-filled"
                rows="4"
                required
              ></v-textarea>
  
              <v-text-field
                v-model="date"
                label="Data do Evento"
                type="date"
                variant="solo-filled"
                required
              ></v-text-field>
  
              <v-btn type="submit" color="primary" class="mt-4">Publicar</v-btn>
              <v-btn class="mt-4 ml-4" @click="dialog = false" variant="text">Cancelar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from '../supabase'
  import { useRouter } from 'vue-router'
  
  const eventos = ref([])
  const dialog = ref(false)
  
  const title = ref('')
  const body = ref('')
  const date = ref('')
  const router = useRouter()
  
  onMounted(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_status', 'aprovado')
      .order('date', { ascending: true })
  
    if (error) {
      console.error('Erro ao buscar eventos:', error.message)
      return
    }
  
    eventos.value = data
  })
  
  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  async function participarDoEvento(eventId) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    alert('Você precisa estar logado para participar.')
    return
  }

  // Verifica se já está participando
  const { data: existing, error: checkError } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    alert('Você já está participando deste evento.')
    return
  }

  const { error: insertError } = await supabase
    .from('event_participants')
    .insert([{ event_id: eventId, user_id: user.id }])

  if (insertError) {
    console.error(insertError)
    alert('Erro ao participar do evento.')
  } else {
    alert('Você está participando do evento!')
  }
}
  
  async function submitEvent() {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
  
    if (authError || !user) {
      alert('Você precisa estar logado para publicar eventos.')
      return
    }
  
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()
  
    if (userError || !userData) {
      alert('Usuário não encontrado no banco de dados.')
      return
    }
  
    const { error: insertError } = await supabase.from('events').insert([{
      title: title.value,
      body: body.value,
      date: date.value,
      user_id: userData.id,
      event_status: 'aguardando'
    }])
  
    if (insertError) {
      console.error(insertError)
      alert('Erro ao publicar evento: ' + insertError.message)
      return
    }
  
    alert('Evento enviado para moderação!')
    dialog.value = false
  
    // Limpa campos
    title.value = ''
    body.value = ''
    date.value = ''
  }
  </script>
  
  <style scoped>
  .container-eventos {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  </style>
  