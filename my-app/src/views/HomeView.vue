<template>
  <div class="left-sidebar">
    
  </div>

  <div class="feed">
    <!-- Criar Postagem -->
    <div class="create-post">
      <div class="create-post-input">
        <input 
          type="text" 
          placeholder="Iniciar uma publicação" 
          @click="showPostModal = true"
          readonly
        />
      </div>
      <div class="create-post-actions">
        
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
            <!-- <select class="visibility-selector" v-model="postVisibility">
              <option value="🌎">🌎 Público</option>
              <option value="👥">👥 Conexões</option>
              <option value="🔒">🔒 Somente eu</option>
            </select> -->
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
          users:user_id (id, username, role),
          comments(id)
        `)
        .order('created_at', { ascending: false })
        
      if (data) {
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
          commentCount: post.comments ? post.comments.length : 0,
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
.post-menu {
  position: absolute;
  background: #f5f5f5;
  color: #000000;
  right: 1rem;
}

.close-modal {
  position: absolute;
  right: 1rem;
  top: 1rem;
  cursor: pointer;
}

.post-textarea {
  width: 100%;
}

.comment-share-stats {
  margin-bottom: 20px;
}
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
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
}

.options-modal {
  background: white;
  border-radius: 16px;
  padding: 1.5rem 1.2rem;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 400px) {
  .options-modal {
    max-width: 96vw;
    padding: 1rem 0.5rem;
  }
}

.post-modal {
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 430px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
@media (max-width: 500px) {
  .post-modal {
    max-width: 98vw;
    padding: 1rem 0.5rem;
  }
}

.post-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
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
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.home-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.main-content {
  display: grid;
  grid-template-columns: 225px 1fr 300px;
  gap: 24px;
}

.create-post, .post-card {
  padding: 1rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.post-card {
  border: none;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  border-left: 5px solid #3b82f6;
  overflow: visible;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.post-header {
  display: flex;
  padding: 12px 16px;
  position: relative;
}

h1, h2 {
  color: #1e293b;
  font-weight: 700;
  font-size: 2.5rem;
  position: relative;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}
h1::after, h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #3b82f6, #2dd4bf);
  border-radius: 2px;
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