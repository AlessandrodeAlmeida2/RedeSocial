<template>
  <div class="container-login">
      <div class="input">
          <h1>Entrar</h1>
          <v-sheet class="mx-auto" width="300">
          <v-form class="form" v-model="valid">
              <h4>Faça login ou <a class="cadastro" @click="router.push('/cadastro')">Cadastre-se</a></h4>
              <div class="social-buttons">
                <button class="git" @click="signInWithGitHub">Login com GitHub</button>
                <button class="discord" @click="signInWithDiscord">Login com Discord</button>
              </div>
              <br>
                <p style="text-align: center;">____________ Ou ____________</p>
              <br>
              <v-text-field
                  v-model="email"
                  label="E-mail"
                  hide-details
                  required
                  variant="solo-filled"
              ></v-text-field><br>

              <v-text-field
                  v-model="password"
                  :counter="10"
                  type="password"
                  label="Senha"
                  hide-details
                  required
                  variant="solo-filled"
              ></v-text-field>

          </v-form>
          </v-sheet>
          <div class="buttonContainer">
              <v-btn @click="signIn">Entrar</v-btn>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase'
import { useRouter } from 'vue-router';

//connect inputs
let email = ref('');
let password = ref ('');
const router = useRouter()

async function signInWithDiscord() {
    const { user, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: 'https://rede-social-taupe.vercel.app/user'
        }
    });

    if (error) {
        console.error("Erro ao autenticar com Discord:", error);
        window.alert("Erro ao fazer login com Discord: " + error.message);
    } else {
        console.log("Usuário autenticado:", user);
        window.alert("Login bem-sucedido!");
    }
}

async function signInWithGitHub() {
    const { user, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: 'https://rede-social-taupe.vercel.app/'
        }
    });

    if (error) {
        console.error("Erro ao autenticar:", error);
        window.alert("Erro ao fazer login com GitHub: " + error.message);
    } else {
        console.log("Usuário autenticado:", user);
        window.alert("Login bem-sucedido!");
    }
}

//login
async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
  })
  if (error) {
      console.log(error);
      window.alert("E-mail ou senha incorretos")
  } else {
      console.log(data);
      router.push('/home');
  }
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

  .cadastro {
    color: #0077b5;
    text-decoration: none;
  }

  .cadastro:hover {
    text-decoration: underline;
    background-color: transparent;
  }

  .campos {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .social-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
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

  .discord {
    padding: 12px;
    color: white;
    background-color: rgb(30, 116, 247);
    border-radius: 4px;
  }

  .git {
    padding: 12px;
    color: white;
    background-color: black;
    border-radius: 4px;
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
