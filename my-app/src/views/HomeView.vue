<template>
  <div class="left-sidebar">
    <!-- Sidebar code mantido como está -->
  </div>

  <div class="feed">
    <!-- Criar Postagem -->
    <div class="create-post">
      <div class="create-post-input">
        <img :src="userData.avatar || 'https://via.placeholder.com/40'" alt="Foto de perfil" class="profile-image-small" />
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
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-author-info">
            <div class="author-name-container">
              <h3 class="author-name">{{ post.author.name }}</h3>
              <span v-if="post.author.verified" class="verified-badge">✓</span>
            </div>
            <p class="author-headline">{{ post.author.headline }}</p>
            <div class="post-meta">
              <span class="post-time">{{ formatTimeAgo(post.created_at) }}</span>
            </div>
          </div>
          <button class="post-menu" @click="showPostOptions(post)" v-if="post.author.id === currentUser?.id">...</button>
        </div>
        
        <div class="post-content">
          <p v-html="post.body"></p>
          <img v-if="post.image" :src="post.image" :alt="'Imagem da publicação de ' + post.author.name" class="post-image" />
        </div>
        
        <div class="post-stats">
          <div class="reactions">
            <span v-for="(reaction, idx) in post.reactions" :key="idx" class="reaction-icon">{{ reaction }}</span>
            <span class="reaction-count">{{ post.reactionCount || 0 }}</span>
          </div>
          <div class="comment-share-stats">
            <span class="comment-count">{{ post.commentCount || 0 }} comentários</span>
          </div>
        </div>
        
        <div class="post-actions">
          <button class="post-action-button" @click="showComments(post.id)">
            <i class="action-icon">💬</i>
            <span>Comentar</span>
          </button>
          <button class="post-action-button">
            <i class="action-icon">📤</i>
            <span>Enviar</span>
          </button>
        </div>
        
        <!-- Seção de comentários (expandível) -->
        <div v-if="expandedCommentPostId === post.id" class="comments-section">
          <div v-for="comment in postComments" :key="comment.id" class="comment">
            <div class="comment-header">
              <div class="comment-author">
                <h4>{{ comment.users.username }}</h4>
                <span class="comment-time">{{ formatTimeAgo(comment.created_at) }}</span>
              </div>
              <button v-if="comment.user_id === currentUser?.id" class="comment-menu" @click="showCommentOptions(comment)">...</button>
            </div>
            <div class="comment-body">
              <p>{{ comment.body }}</p>
            </div>
            <div class="comment-actions">
              <button @click="replyToComment(comment)">Responder</button>
            </div>
            
            <!-- Comentários aninhados (respostas) -->
            <div v-if="comment.children && comment.children.length > 0" class="nested-comments">
              <div v-for="child in comment.children" :key="child.id" class="comment nested">
                <div class="comment-header">
                  <img :src="child.users.avatar || 'https://via.placeholder.com/30'" alt="Avatar" class="comment-avatar" />
                  <div class="comment-author">
                    <h4>{{ child.users.username }}</h4>
                    <span class="comment-time">{{ formatTimeAgo(child.created_at) }}</span>
                  </div>
                  <button v-if="child.user_id === currentUser?.id" class="comment-menu" @click="showCommentOptions(child)">...</button>
                </div>
                <div class="comment-body">
                  <p>{{ child.body }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Formulário de comentário -->
          <div class="comment-form">
            <textarea 
              v-model="newCommentText" 
              placeholder="Escreva um comentário..." 
              @keyup.enter="submitComment(post.id)"
            ></textarea>
            <button @click="submitComment(post.id)" :disabled="!newCommentText.trim()">Comentar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="right-sidebar">
    <!-- Sidebar code mantido como está -->
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
          <div>
            <h4>{{ userData.name }}</h4>
            <select class="visibility-selector" v-model="postVisibility">
              <option value="🌎">🌎 Público</option>
              <option value="👥">👥 Conexões</option>
              <option value="🔒">🔒 Somente eu</option>
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
  
  <!-- Modal de opções do post -->
  <div v-if="showOptionsModal" class="options-modal-overlay" @click="showOptionsModal = false">
    <div class="options-modal" @click.stop>
      <button @click="editPost">Editar publicação</button>
      <button @click="deletePost" class="delete-button">Excluir publicação</button>
    </div>
  </div>
  
  <!-- Modal de edição de post -->
  <div v-if="showEditModal" class="post-modal-overlay" @click="showEditModal = false">
    <div class="post-modal" @click.stop>
      <div class="modal-header">
        <h3>Editar publicação</h3>
        <button class="close-modal" @click="showEditModal = false">×</button>
      </div>
      <div class="modal-body">
        <textarea 
          class="post-textarea" 
          v-model="editPostContent"
        ></textarea>
        <div class="modal-attachments" v-if="editPostImage">
          <div class="attachment-preview">
            <img :src="editPostImage" alt="Anexo" />
            <button class="remove-attachment" @click="editPostImage = null">×</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button 
          class="publish-button" 
          :disabled="!editPostContent.trim()" 
          @click="updatePost"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

export default {
  setup() {
    // Estado do usuário
    const userData = ref({
      id: null,
      name: '',
      username: '',
      headline: '',
      avatar: '',
      profileViews: 0,
      connections: 0,
      groups: []
    })
    
    const currentUser = ref(null)
    const posts = ref([])
    const news = ref([])
    const suggestedPeople = ref([])
    
    // Estados para posts e comentários
    const newPostContent = ref('')
    const postAttachment = ref(null)
    const showPostModal = ref(false)
    const postVisibility = ref('🌎')
    
    // Estados para edição e exclusão de posts
    const selectedPost = ref(null)
    const showOptionsModal = ref(false)
    const showEditModal = ref(false)
    const editPostContent = ref('')
    const editPostImage = ref(null)
    
    // Estados para comentários
    const expandedCommentPostId = ref(null)
    const postComments = ref([])
    const newCommentText = ref('')
    const replyToCommentId = ref(null)
    
    // Buscar dados do usuário atual
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Buscar dados do usuário no banco
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (data) {
          currentUser.value = data
          userData.value = {
            id: data.id,
            name: data.username,
            headline: data.role || 'Estudante',
          }
        }
      }
    }
    
    // Buscar posts
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          body,
          created_at,
          updated_at,
          users:user_id (id, username, role)
        `)
        .order('created_at', { ascending: false })
        
      if (data) {
        // Transformar dados para o formato esperado pelo template
        posts.value = data.map(post => ({
          id: post.id,
          author: {
            id: post.users.id,
            name: post.users.username,
            headline: post.users.role || 'Estudante',
            verified: false
          },
          title: post.title,
          body: post.body,
          created_at: post.created_at,
          commentCount: Math.floor(Math.random() * 10),
        }))
      }
    }
    
    // Criar um novo post
    const createPost = async () => {
      if (!newPostContent.value.trim() || !currentUser.value) return
      
      const newPostData = {
        title: newPostContent.value.substring(0, 50),
        body: newPostContent.value,
        user_id: currentUser.value.id,
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert([newPostData])
        .select()
      
      if (data) {
        // Atualizar lista de posts
        await fetchPosts()
        
        // Limpar o formulário
        newPostContent.value = ''
        postAttachment.value = null
        showPostModal.value = false
      } else if (error) {
        console.error('Erro ao criar post:', error)
        alert('Erro ao criar publicação. Tente novamente.')
      }
    }
    
    // Mostrar opções do post
    const showPostOptions = (post) => {
      selectedPost.value = post
      showOptionsModal.value = true
    }
    
    // Editar post
    const editPost = () => {
      if (!selectedPost.value) return
      
      editPostContent.value = selectedPost.value.body
      editPostImage.value = selectedPost.value.image
      showOptionsModal.value = false
      showEditModal.value = true
    }
    
    // Atualizar post
    const updatePost = async () => {
      if (!editPostContent.value.trim() || !selectedPost.value) return
      
      const { data, error } = await supabase
        .from('posts')
        .update({ 
          body: editPostContent.value,
          image: editPostImage.value,
          updated_at: new Date()
        })
        .eq('id', selectedPost.value.id)
        .eq('user_id', currentUser.value.id) // Garantir que apenas o autor pode editar
      
      if (error) {
        console.error('Erro ao atualizar post:', error)
        alert('Erro ao atualizar publicação. Tente novamente.')
      } else {
        // Atualizar lista de posts
        await fetchPosts()
        showEditModal.value = false
      }
    }
    
    // Excluir post
    const deletePost = async () => {
      if (!selectedPost.value) return
      
      if (confirm('Tem certeza que deseja excluir esta publicação?')) {
        // Primeiro excluir comentários associados
        const { error: commentsError } = await supabase
          .from('comments')
          .delete()
          .eq('post_id', selectedPost.value.id)
        
        // Depois excluir o post
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', selectedPost.value.id)
          .eq('user_id', currentUser.value.id) // Garantir que apenas o autor pode excluir
        
        if (error) {
          console.error('Erro ao excluir post:', error)
          alert('Erro ao excluir publicação. Tente novamente.')
        } else {
          // Atualizar lista de posts
          await fetchPosts()
          showOptionsModal.value = false
        }
      }
    }
    
    // Mostrar comentários
    const showComments = async (postId) => {
      // Se já estiver expandido, fechar
      if (expandedCommentPostId.value === postId) {
        expandedCommentPostId.value = null
        postComments.value = []
        return
      }
      
      expandedCommentPostId.value = postId
      await fetchComments(postId)
    }
    
    // Buscar comentários de um post
    const fetchComments = async (postId) => {
      // Buscar todos os comentários do post
      const { data: allComments, error } = await supabase
        .from('comments')
        .select(`
          id,
          body,
          created_at,
          updated_at,
          parent_comment_id,
          users:user_id (id, username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Erro ao buscar comentários:', error)
        return
      }
      
      // Organizar em estrutura de árvore
      const commentMap = {}
      allComments.forEach(comment => {
        comment.children = []
        commentMap[comment.id] = comment
      })
      
      const rootComments = []
      allComments.forEach(comment => {
        if (comment.parent_comment_id === null) {
          rootComments.push(comment)
        } else {
          if (commentMap[comment.parent_comment_id]) {
            commentMap[comment.parent_comment_id].children.push(comment)
          }
        }
      })
      
      postComments.value = rootComments
    }
    
    // Enviar um comentário
    const submitComment = async (postId) => {
      if (!newCommentText.value.trim() || !currentUser.value) return
      
      const commentData = {
        body: newCommentText.value,
        user_id: currentUser.value.id,
        post_id: postId,
        parent_comment_id: replyToCommentId.value
      }
      
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
      
      if (error) {
        console.error('Erro ao enviar comentário:', error)
        alert('Erro ao enviar comentário. Tente novamente.')
      } else {
        // Limpar campo e atualizar comentários
        newCommentText.value = ''
        replyToCommentId.value = null
        await fetchComments(postId)
        
        // Atualizar contagem de comentários no post
        const postIndex = posts.value.findIndex(p => p.id === postId)
        if (postIndex !== -1) {
          posts.value[postIndex].commentCount++
        }
      }
    }
    
    // Responder a um comentário
    const replyToComment = (comment) => {
      replyToCommentId.value = comment.id
      newCommentText.value = `@${comment.users.username} `
      // Focar no textarea
      setTimeout(() => {
        document.querySelector('.comment-form textarea').focus()
      }, 0)
    }
    
    // Mostrar opções de comentário
    const showCommentOptions = (comment) => {
      // Implementar modal de opções para editar/excluir comentário
      // Similar ao modal de opções de post
      alert('Funcionalidade de editar/excluir comentário a ser implementada')
    }
    
    // Curtir um post
    const toggleLike = (post) => {
      // Simples toggle visual por enquanto
      // Implementação completa requer tabela de likes no banco
      post.liked = !post.liked
      if (post.liked) {
        post.reactionCount++
      } else {
        post.reactionCount--
      }
    }
    
    // Formatador de tempo relativo
    const formatTimeAgo = (dateString) => {
      const now = new Date()
      const date = new Date(dateString)
      const diffInSeconds = Math.floor((now - date) / 1000)
      
      if (diffInSeconds < 60) return 'agora'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} d`
      
      return date.toLocaleDateString()
    }
    
    // Inicialização
    onMounted(async () => {
      await getCurrentUser()
      await fetchPosts()
      
      // Dados mock para notícias e sugestões de conexões
      news.value = [
        { title: 'Nova função no JavaScript aprovada', timeAgo: '3h', readers: '1.542' },
        { title: 'Mercado de TI cresce 15% no último trimestre', timeAgo: '5h', readers: '3.210' },
        { title: 'Vue 3.3 lançado com novos recursos', timeAgo: '1d', readers: '5.489' }
      ]
      
      suggestedPeople.value = [
        { name: 'Ana Silva', headline: 'Desenvolvedora Full Stack', avatar: 'https://via.placeholder.com/60' },
        { name: 'Carlos Mendes', headline: 'UX Designer', avatar: 'https://via.placeholder.com/60' },
        { name: 'Juliana Costa', headline: 'Gerente de Projetos', avatar: 'https://via.placeholder.com/60' }
      ]
    })
    
    return {
      userData,
      currentUser,
      posts,
      news,
      suggestedPeople,
      newPostContent,
      postAttachment,
      showPostModal,
      postVisibility,
      selectedPost,
      showOptionsModal,
      showEditModal,
      editPostContent,
      editPostImage,
      expandedCommentPostId,
      postComments,
      newCommentText,
      replyToCommentId,
      createPost,
      showPostOptions,
      editPost,
      updatePost,
      deletePost,
      showComments,
      submitComment,
      replyToComment,
      showCommentOptions,
      toggleLike,
      formatTimeAgo
    }
  }
}
</script>

<style scoped>
/* Estilos relacionados aos comentários */
.comments-section {
  padding: 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.comment {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.comment.nested {
  margin-left: 30px;
  background-color: #f5f5f5;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-author {
  flex-grow: 1;
}

.comment-author h4 {
  margin: 0;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #666;
}

.comment-menu {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.comment-body {
  font-size: 14px;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-actions button {
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
}

.comment-form {
  display: flex;
  align-items: flex-start;
  margin-top: 15px;
  gap: 10px;
}

.comment-form textarea {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  min-height: 36px;
}

.comment-form button {
  padding: 8px 16px;
  background-color: #0a66c2;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.comment-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Estilos para os modais de opções */
.options-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.options-modal {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  width: 250px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.options-modal button {
  width: 100%;
  padding: 12px;
  text-align: left;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
}

.options-modal button:hover {
  background-color: #f3f3f3;
}

.options-modal .delete-button {
  color: #d11a2a;
}

.options-modal .delete-button:hover {
  background-color: #fff1f1;
}
</style>

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