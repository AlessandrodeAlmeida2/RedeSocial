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
  max-width: 430px;
  margin: 48px auto;
  padding: 2.5rem 2rem;
  border-radius: 18px;
  background: #f8f9fa;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media (max-width: 600px) {
  .container-login {
    max-width: 98vw;
    padding: 1.5rem 0.5rem;
    margin: 24px auto;
  }
}
  
  .container-login h1 {
  text-align: center;
  margin-bottom: 2.5rem;
  color: #1e293b;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 1rem;
}
.container-login h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #3b82f6, #2dd4bf);
  border-radius: 2px;
}

  .cadastro {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}
.cadastro:hover {
  text-decoration: underline;
  background-color: transparent;
  color: #1d4ed8;
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
  gap: 12px;
  justify-content: center;
  margin-bottom: 1rem;
}

@media (max-width: 500px) {
  .social-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
.git, .discord {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
.git {
  background: linear-gradient(135deg, #232526, #414345);
  color: white;
}
.git:hover {
  background: linear-gradient(135deg, #414345, #232526);
}
.discord {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}
.discord:hover {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}

  :deep(.v-text-field) {
    margin-bottom: 15px;
  }

  :deep(.v-field) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #f8fafc;
}
:deep(.v-field:focus-within) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

  :deep(.v-field__input) {
    padding: 10px;
    font-size: 16px;
  }

  :deep(.v-field__outline) {
    display: none;
  }

  .buttonContainer {
  margin-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
.v-btn {
  padding: 0.9rem 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.23);
  transition: all 0.3s ease;
  cursor: pointer;
  max-width: 300px;
  width: 100%;
}
.v-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.13);
}
.v-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  margin: 0 auto;
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
