<script setup lang="ts">

</script>

<template>
  
  <div class="left-sidebar">
        <div class="profile-card">
          <div class="profile-background"></div>
          <div class="profile-info">
            <img src="https://via.placeholder.com/80" alt="Foto de perfil" class="profile-image-large" />
            <h2>{{ userData.name }}</h2>
            <p class="profile-headline">{{ userData.headline }}</p>
          </div>
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-label">Quem viu seu perfil</span>
              <span class="stat-value">{{ userData.profileViews }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Conexões</span>
              <span class="stat-value">{{ userData.connections }}</span>
            </div>
          </div>
          <div class="premium-ad">
            <p>Acesse recursos premium</p>
            <button class="premium-button">Experimente Premium</button>
          </div>
        </div>
        <div class="recent-groups">
          <h3>Grupos recentes</h3>
          <ul>
            <li v-for="(group, index) in userData.groups" :key="index">
              <a href="#">{{ group }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="feed">
        <!-- Criar Postagem -->
        <div class="create-post">
          <div class="create-post-input">
            <img src="https://via.placeholder.com/40" alt="Foto de perfil" class="profile-image-small" />
            <input 
              type="text" 
              placeholder="Iniciar uma publicação" 
              @click="showPostModal = true"
              readonly
            />
          </div>
          <div class="create-post-actions">
            <button class="post-action">
              <i class="action-icon">📷</i>
              <span>Foto</span>
            </button>
            <button class="post-action">
              <i class="action-icon">🎥</i>
              <span>Vídeo</span>
            </button>
            <button class="post-action">
              <i class="action-icon">📅</i>
              <span>Evento</span>
            </button>
            <button class="post-action">
              <i class="action-icon">📝</i>
              <span>Artigo</span>
            </button>
          </div>
        </div>

        <!-- Posts Feed -->
        <div class="posts-container">
          <div v-for="(post, index) in posts" :key="index" class="post-card">
            <div class="post-header">
              <img :src="post.author.avatar" alt="Foto do autor" class="author-image" />
              <div class="post-author-info">
                <div class="author-name-container">
                  <h3 class="author-name">{{ post.author.name }}</h3>
                  <span v-if="post.author.verified" class="verified-badge">✓</span>
                </div>
                <p class="author-headline">{{ post.author.headline }}</p>
                <div class="post-meta">
                  <span class="post-time">{{ post.timeAgo }}</span>
                  <span class="post-visibility">{{ post.visibility }}</span>
                </div>
              </div>
              <button class="post-menu">...</button>
            </div>
            
            <div class="post-content">
              <p v-html="post.content"></p>
              <img v-if="post.image" :src="post.image" :alt="'Imagem da publicação de ' + post.author.name" class="post-image" />
            </div>
            
            <div class="post-stats">
              <div class="reactions">
                <span v-for="(reaction, idx) in post.reactions" :key="idx" class="reaction-icon">{{ reaction }}</span>
                <span class="reaction-count">{{ post.reactionCount }}</span>
              </div>
              <div class="comment-share-stats">
                <span class="comment-count">{{ post.commentCount }} comentários</span>
                <span class="share-count">{{ post.shareCount }} compartilhamentos</span>
              </div>
            </div>
            
            <div class="post-actions">
              <button class="post-action-button" @click="likePost(index)">
                <i class="action-icon" :class="{ 'liked': post.liked }">👍</i>
                <span>Gostei</span>
              </button>
              <button class="post-action-button">
                <i class="action-icon">💬</i>
                <span>Comentar</span>
              </button>
              <button class="post-action-button">
                <i class="action-icon">🔄</i>
                <span>Compartilhar</span>
              </button>
              <button class="post-action-button">
                <i class="action-icon">📤</i>
                <span>Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-sidebar">
        <div class="news-section">
          <h3>Notícias em alta</h3>
          <ul class="news-list">
            <li v-for="(item, index) in news" :key="index" class="news-item">
              <div class="news-bullet">•</div>
              <div class="news-content">
                <h4 class="news-title">{{ item.title }}</h4>
                <p class="news-meta">{{ item.timeAgo }} • {{ item.readers }} leitores</p>
              </div>
            </li>
          </ul>
          <a href="#" class="show-more">Mostrar mais</a>
        </div>
        
        <div class="ad-section">
          <p class="ad-label">Anúncio</p>
          <div class="ad-content">
            <h4>Aumente sua produtividade</h4>
            <p>Descubra nossas ferramentas premium para profissionais</p>
            <img src="https://via.placeholder.com/300x150" alt="Anúncio" class="ad-image" />
          </div>
        </div>
        
        <div class="suggested-connections">
          <h3>Pessoas que talvez você conheça</h3>
          <div v-for="(person, index) in suggestedPeople" :key="index" class="suggestion-item">
            <img :src="person.avatar" alt="Foto de perfil" class="suggestion-image" />
            <div class="suggestion-info">
              <h4>{{ person.name }}</h4>
              <p>{{ person.headline }}</p>
              <button class="connect-button">
                <i class="connect-icon">+</i>
                <span>Conectar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal para criar postagem -->
    <div v-if="showPostModal" class="post-modal-overlay" @click="showPostModal = false">
      <div class="post-modal" @click.stop>
        <div class="modal-header">
          <h3>Criar uma publicação</h3>
          <button class="close-modal" @click="showPostModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-author">
            <img src="https://via.placeholder.com/40" alt="Foto de perfil" class="profile-image-small" />
            <div>
              <h4>{{ userData.name }}</h4>
              <select class="visibility-selector">
                <option value="public">🌎 Público</option>
                <option value="connections">👥 Conexões</option>
                <option value="private">🔒 Somente eu</option>
              </select>
            </div>
          </div>
          <textarea 
            class="post-textarea" 
            placeholder="Sobre o que você quer falar?" 
            v-model="newPostContent"
          ></textarea>
          <div class="modal-attachments" v-if="postAttachment">
            <div class="attachment-preview">
              <img :src="postAttachment" alt="Anexo" />
              <button class="remove-attachment" @click="postAttachment = null">×</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-actions">
            <button class="modal-action-button">
              <i class="action-icon">📷</i>
            </button>
            <button class="modal-action-button">
              <i class="action-icon">🎥</i>
            </button>
            <button class="modal-action-button">
              <i class="action-icon">📄</i>
            </button>
            <button class="modal-action-button">
              <i class="action-icon">👥</i>
            </button>
            <button class="modal-action-button">
              <i class="action-icon">🎯</i>
            </button>
            <button class="modal-action-button">
              <i class="action-icon">...</i>
            </button>
          </div>
          <button 
            class="publish-button" 
            :disabled="!newPostContent.trim()" 
            @click="createPost"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'HomeFeed',
  data() {
    return {
      searchQuery: '',
      notifications: 5,
      showPostModal: false,
      newPostContent: '',
      postAttachment: null,
      userData: {
        name: 'Alessandro de Almeida',
        headline: 'Desenvolvedor Front-End | Vue.js | Angular',
        profileViews: 47,
        connections: 328,
        groups: [
          'Desenvolvedores Vue.js',
          'JavaScript Brasil',
          'Tech Careers'
        ]
      },
      posts: [
        {
          author: {
            name: 'Patricia Mendes',
            headline: 'UX/UI Designer | Digital Product Design',
            avatar: 'https://via.placeholder.com/60',
            verified: false
          },
          content: 'Hoje estou compartilhando meu mais recente projeto de redesign para uma plataforma de e-learning. O foco foi melhorar a experiência do usuário e aumentar a taxa de conclusão dos cursos. O que vocês acham deste novo layout?',
          image: 'https://via.placeholder.com/600x350',
          timeAgo: '5h',
          visibility: '👥',
          reactions: ['👍', '❤️', '💡'],
          reactionCount: 142,
          commentCount: 36,
          shareCount: 12,
          liked: true
        },
        {
          author: {
            name: 'Roberto Fernandes',
            headline: 'Tech Lead at GlobalSoft | Full Stack Developer',
            avatar: 'https://via.placeholder.com/60',
            verified: true
          },
          content: 'Estou recrutando desenvolvedores Vue.js para minha equipe! Buscamos pessoas apaixonadas por código limpo e que gostem de resolver problemas complexos. Se você tem experiência com Vue 3, TypeScript e trabalho em equipe, me envie uma mensagem!',
          image: null,
          timeAgo: '1d',
          visibility: '🌎',
          reactions: ['👍', '❤️', '👏'],
          reactionCount: 56,
          commentCount: 17,
          shareCount: 8,
          liked: false
        }
      ],
      news: [
        {
          title: 'Vue 3.3 é lançado com melhorias significativas',
          timeAgo: '3h',
          readers: '2.543'
        },
        {
          title: 'Mercado de desenvolvedores front-end cresce 30% em 2024',
          timeAgo: '7h',
          readers: '4.129'
        },
        {
          title: 'Como as empresas estão adaptando suas estratégias de contratação remota',
          timeAgo: '1d',
          readers: '1.876'
        }
      ],
      suggestedPeople: [
        {
          name: 'Marina Costa',
          headline: 'Front-End Developer | JavaScript | CSS',
          avatar: 'https://via.placeholder.com/60'
        },
        {
          name: 'Rodrigo Almeida',
          headline: 'Product Manager at TechStartup',
          avatar: 'https://via.placeholder.com/60'
        },
        {
          name: 'Lúcia Ferreira',
          headline: 'UX Researcher | Design Thinking Facilitator',
          avatar: 'https://via.placeholder.com/60'
        }
      ]
    }
  },
  methods: {
    likePost(index) {
      this.posts[index].liked = !this.posts[index].liked;
      if (this.posts[index].liked) {
        this.posts[index].reactionCount++;
      } else {
        this.posts[index].reactionCount--;
      }
    },
    createPost() {
      if (!this.newPostContent.trim()) return;
      
      const newPost = {
        author: {
          name: this.userData.name,
          headline: this.userData.headline,
          avatar: 'https://via.placeholder.com/60',
          verified: false
        },
        content: this.newPostContent,
        image: this.postAttachment,
        timeAgo: 'agora',
        visibility: '🌎',
        reactions: [],
        reactionCount: 0,
        commentCount: 0,
        shareCount: 0,
        liked: false
      };
      
      this.posts.unshift(newPost);
      this.newPostContent = '';
      this.postAttachment = null;
      this.showPostModal = false;
    }
  }
}
</script>

<style scoped>
/* Estilos Gerais */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f3f2ef;
  color: rgba(0, 0, 0, 0.9);
  line-height: 1.5;
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

.home-container {
  position: relative;
}

/* Main Content Layout */
.main-content {
  display: grid;
  grid-template-columns: 225px 1fr 300px;
  gap: 24px;
  max-width: 1128px;
  margin: 24px auto;
  padding: 0 16px;
}

/* Left Sidebar */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.profile-background {
  height: 60px;
  background-color: #a0b4c8;
}

.profile-info {
  padding: 0 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid #ebebeb;
  position: relative;
}

.profile-image-large {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid white;
  position: absolute;
  top: -36px;
}

.profile-info h2 {
  margin-top: 40px;
  font-size: 16px;
  text-align: center;
}

.profile-headline {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  margin-top: 4px;
}

.profile-stats {
  padding: 12px;
  border-bottom: 1px solid #ebebeb;
}

.stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.stat-value {
  font-size: 12px;
  color: #0a66c2;
  font-weight: 600;
}

.premium-ad {
  padding: 12px;
  text-align: center;
}

.premium-ad p {
  font-size: 12px;
  margin-bottom: 8px;
}

.premium-button {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 16px;
  transition: background-color 0.2s;
}

.premium-button:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.recent-groups {
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.recent-groups h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.recent-groups ul li {
  padding: 6px 0;
}

.recent-groups ul li a {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.recent-groups ul li a:hover {
  color: #0a66c2;
}

/* Feed */
.feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-post {
  background-color: white;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.create-post-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.profile-image-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.create-post-input input {
  flex: 1;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 35px;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
}

.create-post-actions {
  display: flex;
  justify-content: space-around;
}

.post-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  font-size: 14px;
}

.post-action:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.action-icon {
  font-size: 18px;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.post-header {
  display: flex;
  padding: 12px 16px;
  position: relative;
}

.author-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 8px;
}

.post-author-info {
  flex: 1;
}

.author-name-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
}

.verified-badge {
  color: #0a66c2;
  background-color: white;
  border-radius: 50%;
  font-size: 12px;
  padding: 0 2px;
}

.author-headline {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 2px 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.post-menu {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 50%;
}

.post-menu:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.post-content {
  padding: 0 16px 16px;
}

.post-content p {
  font-size: 14px;
  margin-bottom: 12px;
  word-break: break-word;
}

.post-content a {
  color: #0a66c2;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 4px;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.reactions {
  display: flex;
  align-items: center;
}

.reaction-icon {
  font-size: 14px;
  margin-right: 4px;
}

.reaction-count, .comment-count, .share-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.comment-share-stats {
  display: flex;
  gap: 8px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding: 4px 8px;
}

.post-action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  font-size: 14px;
}

.post-action-button:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.post-action-button .liked {
  color: #0a66c2;
}

/* Right Sidebar */
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.news-section, .ad-section, .suggested-connections {
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.news-section h3, .suggested-connections h3 {
  font-size: 16px;
  margin-bottom: 12px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.news-item {
  display: flex;
  gap: 8px;
}

.news-bullet {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
}

.news-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.news-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.show-more {
  display: block;
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 600;
}

.show-more:hover {
  color: #0a66c2;
}

.ad-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-align: right;
  margin-bottom: 8px;
}

.ad-content h4 {
  font-size: 14px;
  font-weight: 600;
}
</style>