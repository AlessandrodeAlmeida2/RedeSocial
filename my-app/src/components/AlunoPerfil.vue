<template>
  <div class="aluno-perfil" v-if="aluno">
    <h2>Perfil do Aluno</h2>
    <ul>
      <li><strong>ID:</strong> {{ aluno.id }}</li>
      <li><strong>Nome:</strong> {{ aluno.nome || aluno.name || aluno.username }}</li>
      <li><strong>Username:</strong> {{ aluno.username }}</li>
      <li><strong>Email:</strong> {{ aluno.email }}</li>
      <li><strong>Curso:</strong> {{ aluno.curso }}</li>
      <li><strong>Turma:</strong> {{ aluno.classTitle }}</li>
      <li v-if="aluno.role"><strong>Role:</strong> {{ aluno.role }}</li>
      <li v-if="aluno.headline"><strong>Headline:</strong> {{ aluno.headline }}</li>
      <li v-if="aluno.profileViews !== undefined"><strong>Visualizações de Perfil:</strong> {{ aluno.profileViews }}</li>
      <li v-if="aluno.connections !== undefined"><strong>Conexões:</strong> {{ aluno.connections }}</li>
      <li v-if="aluno.groups && aluno.groups.length"><strong>Grupos:</strong> {{ aluno.groups.join(', ') }}</li>
    </ul>
    <div v-if="user && aluno.id !== user.id" class="actions">
      <!-- Sem relação: pode seguir ou solicitar amizade -->
      <button v-if="!isFollowing && !isFriend && !isPending" @click="followUser">Seguir</button>
      <button v-if="!isFriend && !isPending && !isFollowing" @click="sendFriendRequest">Solicitar amizade</button>
      <!-- Solicitação pendente recebida -->
      <button v-if="isPending && !isRequestSentByMe" @click="acceptFriendRequest">Aceitar amizade</button>
      <!-- Solicitação pendente enviada por mim -->
      <span v-if="isPending && isRequestSentByMe">Solicitação enviada</span>
      <!-- Seguindo, mas não amigos -->
      <button v-if="isFollowing && !isFriend" @click="unfollowUser">Deixar de seguir</button>
      <!-- Amizade -->
      <button v-if="isFriend" @click="unfriendUser">Remover amizade</button>
    </div>
    <div v-if="shortestPath && shortestPath.length > 1" class="shortest-path">
      <strong>Caminho mais curto:</strong> {{ shortestPathLabel }}
    </div>
    <button @click="this.$router.push('/aluno')">Fechar</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  aluno: {
    type: Object,
    required: true
  }
})
defineEmits(['fechar'])

const user = ref(null)
const relationships = ref([])

const isFollowing = computed(() =>
  relationships.value.some(r =>
    r.following_user_id === user.value?.id &&
    r.followed_user_id === props.aluno.id &&
    r.status === 'following'
  )
)
const isFriend = computed(() =>
  relationships.value.some(r =>
    ((r.following_user_id === user.value?.id && r.followed_user_id === props.aluno.id) ||
     (r.following_user_id === props.aluno.id && r.followed_user_id === user.value?.id)) &&
    r.status === 'friends'
  )
)
const isPending = computed(() =>
  relationships.value.some(r =>
    ((r.following_user_id === user.value?.id && r.followed_user_id === props.aluno.id) ||
     (r.following_user_id === props.aluno.id && r.followed_user_id === user.value?.id)) &&
    r.status === 'pending'
  )
)
const isRequestSentByMe = computed(() =>
  relationships.value.some(r =>
    r.following_user_id === user.value?.id &&
    r.followed_user_id === props.aluno.id &&
    r.status === 'pending'
  )
)
const followersGraph = ref({})
const shortestPath = ref([])

const shortestPathLabel = computed(() => shortestPath.value.map(u => u.username || u.id).join(' → '))

// Buscar usuário logado
async function fetchCurrentUser() {
  const { data: { user: loggedUser } } = await supabase.auth.getUser()
  if (loggedUser) {
    // Buscar dados completos do usuário
    const { data } = await supabase.from('users').select('*').eq('id', loggedUser.id).single()
    user.value = data
  }
}

// Buscar relação entre user e aluno (bidirecional, qualquer status)
async function fetchRelationship() {
  if (!user.value || !props.aluno.id) return
  const { data: follows } = await supabase
    .from('follows')
    .select('*')
    .or(`and(following_user_id.eq.${user.value.id},followed_user_id.eq.${props.aluno.id}),and(following_user_id.eq.${props.aluno.id},followed_user_id.eq.${user.value.id})`)
  relationships.value = follows || []
}

// Buscar grafo de seguidores
async function fetchFollowersGraph() {
  const { data: allFollows } = await supabase.from('follows').select('*')
  const { data: allUsers } = await supabase.from('users').select('id, username')
  const graph = {}
  allUsers?.forEach(u => { graph[u.id] = { user: u, follows: [] } })
  allFollows?.forEach(f => {
    graph[f.following_user_id]?.follows.push(graph[f.followed_user_id].user)
  })
  followersGraph.value = graph
}

// BFS para caminho mais curto
function findShortestPath(startId, endId) {
  if (!followersGraph.value[startId] || !followersGraph.value[endId]) return []
  const queue = [[startId]]
  const visited = new Set([startId])
  while (queue.length) {
    const path = queue.shift()
    const last = path[path.length - 1]
    if (last === endId) {
      return path.map(id => followersGraph.value[id].user)
    }
    for (const next of followersGraph.value[last].follows.map(u => u.id)) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }
  return []
}

// Ações
async function followUser() {
  await supabase.from('follows').insert({ following_user_id: user.value.id, followed_user_id: props.aluno.id, status: 'following' })
  await fetchRelationship()
  await fetchFollowersGraph()
}
async function sendFriendRequest() {
  await supabase.from('follows').insert({ following_user_id: user.value.id, followed_user_id: props.aluno.id, status: 'pending' })
  await fetchRelationship()
}
async function acceptFriendRequest() {
  // Atualiza status para friends (amizade é bidirecional)
  await supabase.from('follows').update({ status: 'friends' })
    .match({ following_user_id: props.aluno.id, followed_user_id: user.value.id, status: 'pending' })
  // Garante registro inverso
  const { data: inverse } = await supabase.from('follows').select('*')
    .eq('following_user_id', user.value.id)
    .eq('followed_user_id', props.aluno.id)
  if (!inverse || inverse.length === 0) {
    await supabase.from('follows').insert({ following_user_id: user.value.id, followed_user_id: props.aluno.id, status: 'friends' })
  } else {
    await supabase.from('follows').update({ status: 'friends' })
      .match({ following_user_id: user.value.id, followed_user_id: props.aluno.id })
  }
  await fetchRelationship()
  await fetchFollowersGraph()
}
async function unfollowUser() {
  await supabase.from('follows').delete().match({ following_user_id: user.value.id, followed_user_id: props.aluno.id })
  await fetchRelationship()
  await fetchFollowersGraph()
}
async function unfriendUser() {
  // Remove ambas as relações de amizade
  await supabase.from('follows').delete()
    .or(`and(following_user_id.eq.${user.value.id},followed_user_id.eq.${props.aluno.id}),and(following_user_id.eq.${props.aluno.id},followed_user_id.eq.${user.value.id})`)
  await fetchRelationship()
  await fetchFollowersGraph()
}

onMounted(async () => {
  await fetchCurrentUser()
  await fetchRelationship()
  await fetchFollowersGraph()
  if (user.value && user.value.id !== props.aluno.id) {
    // Só mostra caminho se não for amigo nem seguir
    if (!isFriend.value && !isFollowing.value) {
      shortestPath.value = findShortestPath(user.value.id, props.aluno.id)
    }
  }
})
</script>

<style scoped>
.aluno-perfil {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 16px #0002;
  max-width: 400px;
  margin: 32px auto;
}
.aluno-perfil h2 {
  margin-bottom: 20px;
}
.aluno-perfil ul {
  padding: 0;
  margin: 0 0 24px 0;
  list-style: none;
}
.aluno-perfil li {
  margin-bottom: 8px;
}
.aluno-perfil button {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  margin: 8px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 1rem;
  gap: 10px;
}
</style>
