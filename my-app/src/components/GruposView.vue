<template>
    <div class="grupos-container">
      <h2>Meus Grupos</h2>
  
      <form @submit.prevent="criarGrupo">
        <input type="text" v-model="novoGrupo" placeholder="Nome do grupo" />
        <button type="submit">Criar Grupo</button>
      </form>
  
      <div v-if="meusGrupos.length === 0">
  <i class="fa fa-users-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
  <p>Você ainda não criou ou participa de nenhum grupo</p>
  <p>Crie um grupo acima para começar a conversar com outros usuários</p>
</div>
  
      <div v-for="grupo in meusGrupos" :key="grupo.id" class="grupo-card" :class="{ 'removendo': grupo.removendo }">
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
        // Encontrar o elemento e adicionar classe de animação
        const grupoIndex = this.meusGrupos.findIndex(g => g.id === groupId)
        if (grupoIndex >= 0) {
          this.meusGrupos[grupoIndex].removendo = true
          // Aguardar animação terminar
          await new Promise(resolve => setTimeout(resolve, 400))
        }
        
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #1e293b;
  font-weight: 700;
  font-size: 2.5rem;
  position: relative;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #3b82f6, #2dd4bf);
  border-radius: 2px;
}

form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

input[type="text"] {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input[type="text"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  outline: none;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button[type="submit"] {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.grupo-card {
  border: none;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  border-left: 5px solid #3b82f6;
}

.grupo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

h3 {
  color: #1e293b;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-weight: 600;
  padding-right: 7rem;
}

.excluir {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.entrar {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.membros, .convidar-membros {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  border-left: 3px solid #e2e8f0;
}

h4, h5 {
  color: #334155;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.membros ul, .convidar-membros ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.convidar-membros li, .membros li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.convidar-membros li:last-child, .membros li:last-child {
  border-bottom: none;
}

.membros li span {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.convidar-membros button {
  background-color: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
}

.convidar-membros button:hover {
  background-color: #e0f2fe;
  border-color: #7dd3fc;
}

/* Mensagem quando não há grupos */
.grupos-container > div:nth-child(3) {
  text-align: center;
  padding: 4rem 1rem;
  background-color: #f1f5f9;
  border-radius: 12px;
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  border: 2px dashed #cbd5e1;
}

/* Animações */
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

.grupo-card {
  animation: fadeIn 0.5s ease-in-out;
}

/* Efeito de remoção */
.grupo-card.removendo {
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
  .grupos-container {
    padding: 1.5rem 1rem;
  }
  
  form {
    flex-direction: column;
  }
  
  h2 {
    font-size: 1.8rem;
  }
  
  .excluir, .entrar {
    position: static;
    margin-top: 1rem;
    width: 100%;
  }
  
  .excluir {
    margin-bottom: 0.5rem;
  }
}
</style>
  