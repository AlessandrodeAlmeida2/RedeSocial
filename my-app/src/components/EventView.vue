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
            <v-btn @click="participarDoEvento(evento.id)" color="primary" :class="{ 'btn-participate': !jaParticipando(evento.id) }">
    {{ jaParticipando(evento.id) ? 'Participando' : 'Participar' }}
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
  import { ref, onMounted, computed } from 'vue'
  import { supabase } from '../supabase'
  import { useRouter } from 'vue-router'
  
  const eventos = ref([])
  const dialog = ref(false)
  const currentUser = ref(null)
  const participacoes = ref([])
  
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

    // Adicionar carregamento do usuário e participações
    const { data: userData } = await supabase.auth.getUser()
    currentUser.value = userData?.user || null

    // Se o usuário estiver logado, busque suas participações
    if (currentUser.value) {
      const { data: participacoesData } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', currentUser.value.id)

      participacoes.value = participacoesData?.map(p => p.event_id) || []
    }
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
  if (!currentUser.value) {
    alert('Você precisa estar logado para participar.')
    return
  }

  // Verifica se já está participando (usando estado local)
  if (jaParticipando(eventId)) {
    alert('Você já está participando deste evento.')
    return
  }

  const { error: insertError } = await supabase
    .from('event_participants')
    .insert([{ event_id: eventId, user_id: currentUser.value.id }])

  if (insertError) {
    console.error(insertError)
    alert('Erro ao participar do evento.')
  } else {
    // Adiciona à lista local de participações
    participacoes.value.push(eventId)
    alert('Você está participando do evento!')
  }
}

function jaParticipando(eventId) {
  if (!currentUser.value) return false
  return participacoes.value.includes(eventId)
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  color: #1e293b;
  font-weight: 700;
  font-size: 2.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #3b82f6, #2dd4bf);
  border-radius: 2px;
}

.v-card {
  transition: all 0.3s ease;
  border-left: 5px solid #3b82f6;
  overflow: hidden;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.v-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  padding-top: 1.5rem;
}

.v-card-subtitle {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
  text-transform: capitalize;
}

.v-card-text {
  color: #334155;
  line-height: 1.6;
  padding: 1rem 1.5rem;
  border-left: 2px solid #e2e8f0;
  margin: 0.5rem 1.5rem;
  font-size: 1.05rem;
  background-color: rgba(241, 245, 249, 0.7);
  border-radius: 4px;
}

.v-card-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.v-btn {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease;
}

.v-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.v-btn:active {
  transform: translateY(1px);
}

.v-alert {
  border-radius: 12px;
  font-size: 1.1rem;
  padding: 1.5rem;
  text-align: center;
  background-color: #dbeafe;
  color: #1e40af;
  border-left: 5px solid #3b82f6;
  animation: fadeIn 0.5s ease-in-out;
}

.v-dialog .v-card {
  border-left: none;
  border-top: 5px solid #3b82f6;
}

.v-dialog .headline {
  font-size: 1.8rem;
  color: #1e293b;
  padding: 1.5rem 1.5rem 0.5rem;
}

.v-dialog .v-card-text {
  margin: 0.5rem;
  padding: 1rem;
  background-color: transparent;
  border-left: none;
}

.v-form {
  margin-top: 1rem;
}

.v-text-field,
.v-textarea {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.v-text-field input,
.v-textarea textarea {
  font-size: 1.05rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efeito de pulso ao participar */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.btn-participate {
  animation: pulse 1.5s infinite;
}

/* Responsividade */
@media (max-width: 768px) {
  .container-eventos {
    padding: 1.5rem 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .v-card-actions {
    flex-direction: column;
  }
  
  .v-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Estilo data formatada */
.data-formatada {
  font-style: italic;
}

/* Badge para número de participantes */
.participantes-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 1rem;
  background-color: #eef2ff;
  color: #4f46e5;
}

.participantes-badge .icon {
  margin-right: 0.35rem;
  font-size: 0.9rem;
}
</style>
  