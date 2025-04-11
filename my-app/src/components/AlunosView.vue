<template>
    <div class="students-directory">
        <h2>Diretório de Alunos</h2>
        <div v-for="(students, classTitle) in studentsByClass" :key="classTitle" class="class-group">
            <h3>{{ classTitle }}</h3>
            <ul class="student-list" style="list-style: none;">
                <li v-for="student in students" :key="student.id" class="student-item">
                    <strong>{{ student.username }}</strong> – {{ student.role }}
                    <div class="modal-footer" v-if="currentUser.role === 'professor'">
                        <button class="save-button" @click="editStudent(student)">Editar</button>
                        <button class="cancel-button" @click="deleteStudent(student.id)">Excluir</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div v-if="show" class="edit-modal-overlay">
    <div class="edit-modal">
      <div class="modal-header">
        <h3>Editar Aluno</h3>
        <button class="close-modal" @click="fecharModal">&times;</button>
      </div>
      <div class="modal-body">
        <label>Nome</label>
        <input v-model="form.nome" type="text" />

        <label>Email</label>
        <input v-model="form.email" type="email" />

        <label>Role</label>
        <input v-model="form.curso" type="text" />

        <label>Turma</label>
        <input v-model="form.classTitle" type="text" disabled />

      </div>
      <div class="modal-footer">
        <button class="cancel-button" @click="fecharModal">Cancelar</button>
        <button class="save-button" @click="salvarEdicao">Salvar</button>
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
        profileViews: 0,
        connections: 0,
        groups: []
      })
      
      const currentUser = ref(null)

      const show = ref(false)
    const form = reactive({
        id: null,
        nome: '',
        email: '',
        role: '',
        curso: '',
        classTitle: ''
    })

    const editStudent = (student) => {
        form.id = student.id
        form.nome = student.username
        form.email = student.email || ''
        form.curso = student.role || ''
        form.classTitle = student.classTitle || ''
        show.value = true
    }

    const salvarEdicao = async () => {
    // Atualiza os dados do usuário
    const { error: userError } = await supabase
        .from('users')
        .update({
        username: form.nome,
        email: form.email,
        role: form.curso
        })
        .eq('id', form.id)

    // Atualiza a turma na tabela de relacionamento, se você tiver o novo class_id
    const { error: classError } = await supabase
        .from('class_members')
        .update({
        class_id: form.classId  // você precisa ter isso no form!
        })
        .eq('user_id', form.id)

    if (userError || classError) {
        alert('Erro ao salvar edição.')
    } else {
        alert('Aluno atualizado com sucesso.')
        show.value = false
        await fetchStudents()
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
      
      const studentsByClass = ref({})

        const fetchStudents = async () => {
        let query

        if (currentUser.value.role === 'professor') {
            // Professores veem todos
            query = supabase
            .from('class_members')
            .select(`user_id, classess (id, title), users (id, username, role)`)
        } else {
            // Estudantes veem apenas colegas da mesma turma
            query = supabase
            .from('class_members')
            .select(`user_id, classess (id, title), users (id, username, role)`)
            .eq('class_id', await getUserClassId(currentUser.value.id))
        }

        const { data, error } = await query

        if (error) {
            console.error('Erro ao buscar alunos:', error)
            return
        }

        // Agrupar por turma
        const grouped = {}
        data.forEach(entry => {
            const classTitle = entry.classess.title
            if (!grouped[classTitle]) grouped[classTitle] = []
            grouped[classTitle].push({
                ...entry.users,
                classTitle: entry.classess.title
            })
        })

        studentsByClass.value = grouped
        }

        const getUserClassId = async (userId) => {
        const { data, error } = await supabase
            .from('class_members')
            .select('class_id')
            .eq('user_id', userId)
            .single()

        return data?.class_id
        }

        const deleteStudent = async (studentId) => {
        if (!confirm('Deseja realmente excluir este aluno?')) return

        const { error } = await supabase.from('users').delete().eq('id', studentId)

        if (error) {
            alert('Erro ao excluir aluno.')
        } else {
            await fetchStudents()
            alert('Aluno excluído com sucesso.')
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
  await fetchStudents()
})

      
      return {
        userData,
        currentUser,
        formatTimeAgo,
        studentsByClass,
        editStudent,
        deleteStudent,
        salvarEdicao,
        fecharModal,
        show,
        form
      }
    }
  }
  </script>
  
  <style scoped>
  .class-group {
    display: flex;
    flex-direction: column;
    align-items: start;
    margin-bottom: 20px;
  }

.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-modal {
  background: white;
  border-radius: 10px;
  padding: 20px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.modal-body label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.modal-body input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button,
.save-button {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
}

.save-button {
  background-color: #0a66c2;
  color: white;
  border: none;
}

.cancel-button:hover {
  background-color: #bbb;
}

.save-button:hover {
  background-color: #004a99;
}
</style>
 