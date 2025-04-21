<template>
  <div class="students-directory-container">
    <div class="header-section">
      <h2 class="directory-title">Diretório de Alunos</h2>
      <div class="search-bar">
        <input type="text" v-model="searchTerm" placeholder="Buscar alunos..." />
        <button class="search-button"><i class="fas fa-search"></i></button>
      </div>
    </div>

    <div v-for="(students, classTitle) in filteredStudentsByClass" :key="classTitle" class="class-card">
      <div class="class-header">
        <h3 class="class-title">{{ classTitle }}</h3>
        <span class="student-count">{{ students.length }} alunos</span>
      </div>
      
      <ul class="student-list">
        <li v-for="student in students" :key="student.id" class="student-item">
          <div class="student-info">
            <div class="student-avatar" :style="{ backgroundColor: getAvatarColor(student.username) }">
              {{ getInitials(student.username) }}
            </div>
            <div class="student-details">
              <router-link :to="'/aluno/' + student.id" class="student-name">{{ student.username }}</router-link>
              <span class="student-role">{{ student.role }}</span>
            </div>
          </div>
          <div class="student-actions" v-if="currentUser.role === 'professor'">
            <button class="action-button edit" @click="editStudent(student)" title="Editar">
              <i class="fas fa-pencil-alt"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#274483"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></i>
            </button>
            <button class="action-button delete" @click="deleteStudent(student.id)" title="Excluir">
              <i class="fas fa-trash"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#BB271A"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/></svg></i>
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal de edição -->
    <div v-if="show" class="modal-backdrop" @click.self="fecharModal">
      <div class="edit-modal">
        <div class="modal-header">
          <h3>Editar Aluno</h3>
          <button class="close-modal" @click="fecharModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.nome" type="text" class="form-control" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-control" />
          </div>

          <div class="form-group">
            <label>Função</label>
            <input v-model="form.curso" type="text" class="form-control" />
          </div>

          <div class="form-group">
            <label>Turma</label>
            <input v-model="form.classTitle" type="text" class="form-control" disabled />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="fecharModal">Cancelar</button>
          <button class="btn-save" @click="salvarEdicao">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

export default {
  setup() {
    // Estados
    const userData = ref({
      id: null,
      name: '',
      username: '',
      headline: ''
    })
    
    const currentUser = ref(null)
    const studentsByClass = ref({})
    const searchTerm = ref('')
    
    const show = ref(false)
    const form = reactive({
      id: null,
      nome: '',
      email: '',
      role: '',
      curso: '',
      classTitle: '',
      classId: null
    })

    // Computados
    const filteredStudentsByClass = computed(() => {
      if (!searchTerm.value) return studentsByClass.value
      
      const result = {}
      Object.keys(studentsByClass.value).forEach(classTitle => {
        const filteredStudents = studentsByClass.value[classTitle].filter(student => 
          student.username.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
          student.role.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
        
        if (filteredStudents.length > 0) {
          result[classTitle] = filteredStudents
        }
      })
      
      return result
    })

    // Métodos
    const getInitials = (name) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
    
    const getAvatarColor = (name) => {
      const colors = [
        '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', 
        '#009688', '#4caf50', '#8bc34a', '#cddc39',
        '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
        '#f44336', '#e91e63', '#9c27b0', '#673ab7'
      ]
      
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      
      return colors[Math.abs(hash) % colors.length]
    }

    const editStudent = (student) => {
      form.id = student.id
      form.nome = student.username
      form.email = student.email || ''
      form.curso = student.role || ''
      form.classTitle = student.classTitle || ''
      form.classId = student.classId
      show.value = true
    }

    const salvarEdicao = async () => {
      try {
        // Atualiza os dados do usuário
        const { error: userError } = await supabase
          .from('users')
          .update({
            username: form.nome,
            email: form.email,
            role: form.curso
          })
          .eq('id', form.id)

        // Atualiza a turma na tabela de relacionamento, se tiver o class_id
        if (form.classId) {
          const { error: classError } = await supabase
            .from('class_members')
            .update({
              class_id: form.classId
            })
            .eq('user_id', form.id)
            
          if (classError) throw classError
        }

        if (userError) throw userError
        
        // Exibe notificação de sucesso
        alert('Aluno atualizado com sucesso!')
        show.value = false
        await fetchStudents() // Recarrega os dados
        
      } catch (error) {
        console.error('Erro ao salvar:', error)
        alert('Erro ao salvar edição: ' + error.message)
      }
    }

    const fecharModal = () => {
      show.value = false
    }
    
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
            headline: data.role,
          }
        }
      }
    }
    
    const fetchStudents = async () => {
      try {
        let query

        if (currentUser.value?.role === 'professor') {
          // Professores veem todos
          query = supabase
            .from('class_members')
            .select(`user_id, classess (id, title), users (id, username, role, email)`)
        } else {
          // Estudantes veem apenas colegas da mesma turma
          const classId = await getUserClassId(currentUser.value?.id)
          query = supabase
            .from('class_members')
            .select(`user_id, classess (id, title), users (id, username, role, email)`)
            .eq('class_id', classId)
        }

        const { data, error } = await query

        if (error) throw error

        // Agrupar por turma
        const grouped = {}
        data.forEach(entry => {
          const classTitle = entry.classess.title
          if (!grouped[classTitle]) grouped[classTitle] = []
          grouped[classTitle].push({
            ...entry.users,
            classTitle: entry.classess.title,
            classId: entry.classess.id
          })
        })

        studentsByClass.value = grouped
      } catch (error) {
        console.error('Erro ao buscar alunos:', error)
        alert('Não foi possível carregar a lista de alunos.')
      }
    }

    const getUserClassId = async (userId) => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar turma do usuário:', error)
        return null
      }
      
      return data?.class_id
    }

    const deleteStudent = async (studentId) => {
      if (!confirm('Deseja realmente excluir este aluno?')) return

      try {
        // Primeiro remove da tabela de relacionamento
        await supabase
          .from('class_members')
          .delete()
          .eq('user_id', studentId)
          
        // Depois remove o usuário
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', studentId)

        if (error) throw error
        
        await fetchStudents() // Recarregar dados
        alert('Aluno excluído com sucesso.')
      } catch (error) {
        console.error('Erro ao excluir:', error)
        alert('Erro ao excluir aluno: ' + error.message)
      }
    }
    
    // Inicialização
    onMounted(async () => {
      await getCurrentUser()
      await fetchStudents()
    })
    
    return {
      userData,
      currentUser,
      studentsByClass,
      filteredStudentsByClass,
      searchTerm,
      editStudent,
      deleteStudent,
      salvarEdicao,
      fecharModal,
      show,
      form,
      getInitials,
      getAvatarColor
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.students-directory-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.directory-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
  position: relative;
}

.directory-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background-color: #0a66c2;
  border-radius: 2px;
}

.search-bar {
  display: flex;
  position: relative;
  width: 300px;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.search-bar input:focus {
  border-color: #0a66c2;
  box-shadow: 0 2px 10px rgba(10, 102, 194, 0.1);
  outline: none;
}

.search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7b7b7b;
  cursor: pointer;
  transition: color 0.3s ease;
}

.search-button:hover {
  color: #0a66c2;
}

.class-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.class-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.class-header {
  background: linear-gradient(135deg, #0a66c2, #0077b5);
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.student-count {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 500;
}

.student-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.student-item:last-child {
  border-bottom: none;
}

.student-item:hover {
  background-color: #f9f9f9;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  color: #0a66c2;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.student-name:hover {
  color: #004a99;
  text-decoration: underline;
}

.student-role {
  color: #666;
  font-size: 0.9rem;
  margin-top: 2px;
}

.student-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.action-button.edit {
  background-color: #e7f3ff;
  color: #0a66c2;
}

.action-button.edit:hover {
  background-color: #d0e8ff;
}

.action-button.delete {
  background-color: #ffebee;
  color: #f44336;
}

.action-button.delete:hover {
  background-color: #ffcdd2;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.edit-modal {
  background-color: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modal-appear 0.3s ease forwards;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9e9e9e;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-modal:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  border-color: #0a66c2;
  box-shadow: 0 0 0 3px rgba(10, 102, 194, 0.15);
  outline: none;
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel,
.btn-save {
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-cancel:hover {
  background-color: #e8e8e8;
}

.btn-save {
  background-color: #0a66c2;
  color: white;
  border: none;
}

.btn-save:hover {
  background-color: #0955a3;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .student-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .student-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .class-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .student-count {
    align-self: flex-start;
  }
}
</style>
