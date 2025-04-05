<template>
    <div class="container-moderacao">
      <h1>Moderação de Eventos</h1>
  
      <v-sheet class="mx-auto" width="800">
        <v-alert v-if="eventos.length === 0" type="info" class="mb-4">
          Nenhum evento aguardando moderação.
        </v-alert>
  
        <v-card
          v-for="evento in eventos"
          :key="evento.id"
          class="mb-4"
          variant="tonal"
        >
          <v-card-title>{{ evento.title }}</v-card-title>
          <v-card-subtitle>Data: {{ evento.date }}</v-card-subtitle>
          <v-card-text>
            {{ evento.body }}
          </v-card-text>
  
          <v-card-actions>
            <v-btn color="success" @click="atualizarStatus(evento.id, 'aprovado')">
              Aprovar
            </v-btn>
            <v-btn color="error" @click="atualizarStatus(evento.id, 'desaprovado')">
              Rejeitar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-sheet>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from '../supabase'
  
  const eventos = ref([])
  
  onMounted(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_status', 'aguardando')
  
    if (error) {
      console.error('Erro ao buscar eventos:', error.message)
      return
    }
  
    eventos.value = data
  })
  
  async function atualizarStatus(eventoId, novoStatus) {
    const { error } = await supabase
      .from('events')
      .update({ event_status: novoStatus })
      .eq('id', eventoId)
  
    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      return
    }
  
    eventos.value = eventos.value.filter(e => e.id !== eventoId)
  }
  </script>
  
  <style scoped>
  .container-moderacao {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }
  </style>
  