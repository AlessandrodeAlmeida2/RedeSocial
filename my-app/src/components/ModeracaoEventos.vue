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
          :class="{ 'removendo': evento.removendo }"
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
  // Encontra o elemento e adiciona a classe de animação
  const elemento = eventos.value.find(e => e.id === eventoId);
  if (elemento) elemento.removendo = true;
  
  // Aguarda a animação terminar
  await new Promise(resolve => setTimeout(resolve, 400));
  
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1e293b;
  font-weight: 700;
  font-size: 2.5rem;
  position: relative;
  padding-bottom: 1rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #3b82f6, #2dd4bf);
  border-radius: 2px;
}

.v-card {
  transition: all 0.3s ease;
  border-left: 5px solid #64748b;
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
  gap: 1rem;
}

.v-btn {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease;
}

.v-btn.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.v-btn.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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

/* Efeito de fade out quando o card é removido */
.v-card.removendo {
  animation: fadeOut 0.4s ease-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(50px);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .container-moderacao {
    padding: 1.5rem 1rem;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .v-card-actions {
    flex-direction: column;
  }
  
  .v-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 1rem;
  background-color: #fef3c7;
  color: #92400e;
}
</style>
