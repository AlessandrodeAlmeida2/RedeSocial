<template>
  <div id="app">
    <header class="header">
      <div class="logo">
        <h1>SocialConnect</h1>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Pesquisar..." v-model="searchQuery" />
        <button class="search-button">
          <i class="search-icon">🔍</i>
        </button>
      </div>
      <nav class="nav-menu">
        <div class="nav-item active">
          <i class="nav-icon">🏠</i>
          <a href="/">Início</a>
        </div>
        <div class="nav-item">
          <i class="nav-icon">👥</i>
          <a>Minha Rede</a>
        </div>
        <div class="nav-item">
          <i class="nav-icon">💼</i>
          <a>Vagas</a>
        </div>
        <div class="nav-item">
          <i class="nav-icon">💬</i>
          <a>Mensagens</a>
        </div>
        <div class="nav-item">
          <i class="nav-icon">🔔</i>
          <a>Notificações</a>
          <div v-if="notifications > 0" class="notification-badge">{{ notifications }}</div>
        </div>
      </nav>
      <div class="user-profile" @click="toggleDropdown">
        <img src="https://via.placeholder.com/40" alt="Foto de perfil" class="profile-image" />
        <div class="profile-dropdown">
          <i class="dropdown-icon">▼</i>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <a href="/login" class="dropdown-item">Login</a>
            <a href="/cadastro" class="dropdown-item">Cadastrar</a>
            <a href="/profile" class="dropdown-item">Meu Perfil</a>
            <a href="/settings" class="dropdown-item">Configurações</a>
            <a href="/" class="dropdown-item">Sair</a>
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

const router = useRouter();

export default {
  data() {
    return {
      searchQuery: '',
      notifications: 3,
      isDropdownOpen: false
    }
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    openChat() {
      // Implementação da abertura do chat
      console.log('Abrindo chat');
    },
    // Adicionando a função signOut dentro de methods
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log(error);
      } else {
        console.log("Logout has been successful");
        window.alert('Você fez Logout com sucesso');
        router.push('/')
      }
    }
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

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff0000;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>