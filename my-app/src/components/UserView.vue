<template>
  <div class="container-login">
    <div class="input">
      <h1>Faça seu cadastro</h1>
      <v-sheet class="mx-auto" width="300">
        <v-form class="campos">
          <v-text-field
            v-model="username"
            label="Username"
            hide-details
            required
            variant="solo-filled"
          ></v-text-field><br />

          <v-select
            v-model="role"
            :items="['Estudante', 'Professor']"
            label="Selecione seu papel"
            hide-details
            required
            variant="solo-filled"
          ></v-select><br />

          <v-select
            v-model="selectedClassId"
            :items="classes"
            item-title="title"
            item-value="id"
            label="Selecione a Turma"
            hide-details
            required
            variant="solo-filled"
          ></v-select>
        </v-form>
      </v-sheet>

      <div class="buttonContainer">
        <v-btn @click="createUser">Cadastrar</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';
import { useRouter } from 'vue-router';

const username = ref('');
const role = ref('Estudante');
const selectedClassId = ref(null);
const classes = ref([]);
const router = useRouter();

// Carrega as turmas ao iniciar
onMounted(async () => {
  const { data, error } = await supabase.from('classess').select('id, title');
  if (error) {
    console.error('Erro ao carregar turmas:', error.message);
  } else {
    classes.value = data;
  }
});

async function createUser() {
  if (!selectedClassId.value) {
    window.alert("Por favor, selecione uma turma.");
    return;
  }

  // Insere na tabela users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert([
      { username: username.value, role: role.value.toLowerCase() }
    ])
    .select()
    .single();

  if (userError) {
    console.log(userError);
    window.alert("Erro ao salvar usuário: " + userError.message);
    return;
  }

  const userId = userData.id;
  const isAdmin = role.value === 'Professor';

  // Associa à turma
  const { error: classMemberError } = await supabase
    .from('class_members')
    .insert([
      {
        user_id: userId,
        class_id: selectedClassId.value,
        is_admin: isAdmin
      }
    ]);

  if (classMemberError) {
    console.log(classMemberError);
    window.alert("Erro ao adicionar à turma: " + classMemberError.message);
    return;
  }

  window.alert("Usuário cadastrado com sucesso!");
  router.push('/');
}
</script>

<style scoped>
  .container-login {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .container-login h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
    font-size: 24px;
  }

  .campos {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  :deep(.v-text-field) {
    margin-bottom: 15px;
  }

  :deep(.v-field) {
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: border-color 0.3s;
  }

  :deep(.v-field:focus-within) {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }

  :deep(.v-field__input) {
    padding: 10px;
    font-size: 16px;
  }

  :deep(.v-field__outline) {
    display: none;
  }

  .buttonContainer {
    margin-top: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .v-btn {
    padding: 12px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    max-width: 300px;
  }

  .v-btn:hover {
    background-color: #3a7bc8;
  }

  .v-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .input {
    width: 100%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 40px auto;
  }

  .message {
    padding: 10px;
    border-radius: 4px;
    margin-top: 15px;
    text-align: center;
    width: 100%;
  }

  .success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .password-container {
    display: flex;
    position: relative;
  }

  .password-container input {
    flex: 1;
  }

  .toggle-password {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 14px;
    padding: 5px;
  }

  .toggle-password:hover {
    color: #333;
  }

  @media (max-width: 768px) {
    .container-login {
      margin: 0 auto;
      padding: 15px;
    }
  }
</style>
