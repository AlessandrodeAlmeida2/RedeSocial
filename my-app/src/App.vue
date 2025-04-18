<template>
  <div id="app">
    <header class="header">
      <div class="logo">
        <h1>SocialConnect</h1>
      </div>
      <!-- <div class="search-bar">
        <input type="text" placeholder="Pesquisar..." v-model="searchQuery" />
        <button class="search-button">
          <i class="search-icon">🔍</i>
        </button>
      </div> -->
      <nav class="nav-menu">
        <div class="nav-item active" style="position: relative;">
          <i class="nav-icon">🏠</i>
          <a href="/">Início</a>
        </div>
        <div class="nav-item friend-requests" style="position: relative;" @click="toggleFriendRequests">
          <span class="friend-icon">👥</span>
          <span v-if="friendRequests.length > 0" class="notification-badge">{{ friendRequests.length }}</span>
          <div v-if="showFriendRequests" class="friend-requests-dropdown">
            <div v-if="friendRequests.length === 0" class="dropdown-empty">Nenhuma solicitação</div>
            <div v-for="req in friendRequests" :key="req.id" class="dropdown-request">
              <span>{{ req.sender?.username || req.sender?.id || 'Usuário' }}</span>
              <button class="accept-btn" @click.stop="acceptFriendRequest(req)">Aceitar</button>
            </div>
          </div>
        </div>
      </nav>
      <div class="user-profile" @click="toggleDropdown">
        <img src="" alt="Foto de perfil" class="profile-image" />
        <div class="profile-dropdown">
          <i class="dropdown-icon">▼</i>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <a href="/login" class="dropdown-item">Login</a>
            <a href="/cadastro" class="dropdown-item">Cadastrar</a>
            <a href="/event" class="dropdown-item">Eventos</a>
            <a href="/grupos" class="dropdown-item">Grupos</a>
            <a href="/aluno" class="dropdown-item">Diretório de Alunos</a>
            <a v-if="show" href="/moderacao">Moderacao</a>
            <a @click="signOut()" class="dropdown-item">Sair</a>
          </div>
        </div>
      </div>
    </header>
    <main>
      <div class="content">
        <RouterView/>
      </div>
    </main>
    
    <footer>
      <FooterView/>
    </footer>  
  </div>
</template>

<script>
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      searchQuery: '',
      notifications: 0,
      friendRequests: [],
      showFriendRequests: false,
      isDropdownOpen: false,
      show: false,
      currentUserId: null
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    toggleFriendRequests() {
      this.showFriendRequests = !this.showFriendRequests;
    },
    async acceptFriendRequest(request) {
      // Atualiza status para 'friends' usando os dois campos
      const { error } = await supabase
        .from('follows')
        .update({ status: 'friends' })
        .eq('following_user_id', request.id)
        .eq('followed_user_id', this.currentUserId);
      if (!error) {
        // Atualiza lista local
        this.friendRequests = this.friendRequests.filter(r => r.id !== request.id);
      } else {
        alert('Erro ao aceitar solicitação');
      }
    },

    openChat() {
      console.log('Abrindo chat');
    },

    async fetchUserData() {
      const { data: { user }, error: authError} = await supabase.auth.getUser();
      if (authError) {
        console.error('Erro ao obter usuário:', authError.message);
        return;
      }
      this.currentUserId = user.id;

      const { data: userData, error: userError} = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (userError) {
        console.error('Erro ao obter dados do usuário:', userError.message);
        return;
      }

      // Busca solicitações de amizade pendentes (com info do remetente)
      const { data: requests, error: followsError } = await supabase
        .from('follows')
        .select('following_user_id, users:following_user_id(id, username)')
        .eq('followed_user_id', user.id)
        .eq('status', 'pending');
        console.log('Solicitações de amizade:', requests);
      if (followsError) {
        console.error('Erro ao buscar solicitações de amizade:', followsError.message);
        this.friendRequests = [];
      } else {
        // Mapear para facilitar o uso no template
        this.friendRequests = (requests || []).map(r => ({
          id: r.following_user_id,
          sender: r.users
        }));
      }

      this.show = userData.role === 'professor';
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log(error);
      } else {
        console.log("Logout has been successful");
        window.alert('Você fez Logout com sucesso');
        this.$router.push('/login');
      }
    }
  },
  mounted() {
    this.fetchUserData(); // chama a função assim que o componente for montado
  }
}
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.logo h1 {
  color: #0077b5;
  margin: 0;
  font-size: 1.5rem;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f3f2ef;
  border-radius: 4px;
  padding: 5px 10px;
  margin: 0 15px;
  flex: 1;
  max-width: 300px;
}

.search-bar input {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
}

.nav-menu {
  display: flex;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 15px;
  cursor: pointer;
  position: relative;
}

.nav-item.active {
  color: #0077b5;
}

.friend-requests {
  cursor: pointer;
}
.friend-icon {
  font-size: 22px;
  color: #0077b5;
}
.friend-requests-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  z-index: 1000;
  padding: 10px 0;
}
.dropdown-request {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
}
.accept-btn {
  background: #0077b5;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  margin-left: 10px;
}
.accept-btn:hover {
  background: #005a8c;
}
.dropdown-empty {
  padding: 12px 16px;
  color: #888;
  text-align: center;
}
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff3b3f;
  color: white;
  border-radius: 50%;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 0 2px #333;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.profile-image {
  border-radius: 50%;
}

.profile-dropdown {
  margin-left: 5px;
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 30px;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 4px;
  width: 150px;
  z-index: 100;
}

.dropdown-item {
  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
}

.dropdown-item:hover {
  background-color: #f3f2ef;
}

.chat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
}

main {
  min-height: calc(100vh - 60px - 100px);
  padding: 20px;
}

footer {
  height: 100px;
  background-color: #f3f2ef;
}
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff3b3f;
  color: white;
  border-radius: 50%;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 0 2px #333;
}

</style>