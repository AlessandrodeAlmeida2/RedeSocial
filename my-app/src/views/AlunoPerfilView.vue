<template>
  <AlunoPerfil :aluno="aluno" v-if="aluno" />
  <div v-else>Carregando...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import AlunoPerfil from '@/components/AlunoPerfil.vue'

const route = useRoute()
const aluno = ref(null)

onMounted(async () => {
  const { id } = route.params
  // Buscar dados do aluno pelo id
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (!error) {
    aluno.value = data
  }
})
</script>
