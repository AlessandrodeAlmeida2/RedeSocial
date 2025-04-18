<template>
    <div class="grupos-container">
      <h2>Meus Grupos</h2>
  
      <form @submit.prevent="criarGrupo">
        <input type="text" v-model="novoGrupo" placeholder="Nome do grupo" />
        <button type="submit">Criar Grupo</button>
      </form>
  
      <div v-if="meusGrupos.length === 0">Você ainda não criou grupos.</div>
  
      <div v-for="grupo in meusGrupos" :key="grupo.id" class="grupo-card">
        <h3>{{ grupo.title }}</h3>
        <button class="excluir" @click="excluirGrupo(grupo.id)">Excluir Grupo</button>
        <button class="entrar" @click="goToChat(grupo.id)">Entrar no chat</button>
        <div class="membros">
          <h4>Membros</h4>
          <ul>
            <li v-for="m in grupo.membros" :key="m.id">
              {{ m.username }} <span v-if="m.is_admin">(admin)</span>
            </li>
          </ul>
        </div>
  
        <div class="convidar-membros">
          <h5>Convidar membros</h5>
          <ul>
            <li v-for="user in usuariosDisponiveis(grupo)" :key="user.id">
              {{ user.username }}
              <button @click="convidarMembro(grupo.id, user.id)">Convidar</button>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  </template>
  
  <script>
  import { supabase } from '@/supabase'
  
  export default {
    data() {
      return {
        usuarioAtual: null,
        meusGrupos: [],
        novoGrupo: '',
        usuarios: []
      }
    },
    async mounted() {
      await this.buscarUsuarioAtual()
      await this.buscarMeusGrupos()
      await this.buscarUsuarios()
    },

    props: ['groupId', 'groupTitle'],

    methods: {
      async buscarUsuarioAtual() {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Erro ao obter usuário:', error)
        } else {
          this.usuarioAtual = data.user
        }
      },

      goToChat(groupId) {
        this.$router.push({ name: 'chat', params: { groupId }});
      },
  
      async buscarMeusGrupos() {
        const { data, error } = await supabase
          .from('groups')
          .select(`
            id, title,
            group_members (
              user_id,
              is_admin,
              users ( id, username )
            )
          `)
          .order('created_at', { ascending: false })
  
        if (error) {
          console.error('Erro ao buscar grupos:', error)
          return
        }
  
        // filtra os grupos onde o usuário atual é admin
        this.meusGrupos = data
          .map(g => ({
            ...g,
            membros: g.group_members.map(m => ({
              id: m.users.id,
              username: m.users.username,
              is_admin: m.is_admin
            }))
          }))
          .filter(g =>
            g.membros.some(m => m.id === this.usuarioAtual.id)
          )
      },
  
      async buscarUsuarios() {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, role')
          .in('role', ['estudante', 'professor'])
  
        if (error) {
          console.error('Erro ao buscar usuários:', error)
          return
        }
  
        this.usuarios = data
      },
  
      usuariosDisponiveis(grupo) {
        const membrosIds = grupo.membros.map(m => m.id)
        return this.usuarios.filter(u => !membrosIds.includes(u.id))
      },
  
      async criarGrupo() {
        if (!this.novoGrupo.trim()) return
  
        const { data, error } = await supabase
          .from('groups')
          .insert({ title: this.novoGrupo })
          .select()
          .single()
  
        if (error) {
          console.error('Erro ao criar grupo:', error)
          return
        }
  
        // adiciona criador como admin
        await supabase.from('group_members').insert({
          group_id: data.id,
          user_id: this.usuarioAtual.id,
          is_admin: true
        })
  
        this.novoGrupo = ''
        this.buscarMeusGrupos()
      },
  
      async convidarMembro(groupId, userId) {
        const { error } = await supabase.from('group_members').insert({
          group_id: groupId,
          user_id: userId,
          is_admin: false
        })
  
        if (error) {
          console.error('Erro ao convidar membro:', error)
          return
        }
  
        this.buscarMeusGrupos()
      },
  
      async excluirGrupo(groupId) {
        // exclui os membros do grupo primeiro
        await supabase.from('group_members').delete().eq('group_id', groupId)
  
        // depois exclui o grupo
        const { error } = await supabase.from('groups').delete().eq('id', groupId)
        if (error) {
          console.error('Erro ao excluir grupo:', error)
          return
        }
  
        this.buscarMeusGrupos()
      }
    }
  }
  </script>
  
  <style scoped>
  .grupos-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  input[type="text"] {
    flex: 1;
    padding: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .entrar {
    background-color: #4caf50;
    color: white;
    border: none;
  }
  
  .grupo-card {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    background-color: #f8f8f8;
  }
  
  .excluir {
    background-color: #f44336;
    color: white;
    border: none;
    float: right;
  }
  
  .membros ul,
  .convidar-membros ul {
    list-style: none;
    padding-left: 0;
  }
  
  .convidar-membros li,
  .membros li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.3rem;
  }
  </style>
  