<template>
    <div class="container-login">
        <div class="input">
            <h1>Faça seu cadastro</h1>
            <v-sheet class="mx-auto" width="300">
            <v-form class="campos">
              <div class="social-buttons">
                <button class="git" @click="signInWithGitHub">Login com GitHub</button>
                <button class="discord" @click="signInWithDiscord">Login com Discord</button>
              </div>
                <p style="text-align: center;">____________ Ou ____________</p>
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
                    label="Senha com no mínimo 6 caracteres"
                    hide-details
                    required
                    variant="solo-filled"
                    type="password"
                ></v-text-field><br>
                
            </v-form>
            </v-sheet>

            <div class="buttonContainer">
                <v-btn @click="createAccount">Cadastrar</v-btn>
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
let password = ref('');
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
            redirectTo: 'https://rede-social-taupe.vercel.app/user'
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

//create account
async function createAccount() {
    // Cadastra o usuário no Supabase auth
    const { user, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value}, {
  redirectTo: 'https://rede-social-taupe.vercel.app/user'
  });

    if (error) {
        console.log(error);
        window.alert("Erro ao criar conta: " + error.message);
    } else {
        console.log(user);
        window.alert("Um email foi enviado para " + email.value + ". Por favor, verifique sua caixa de entrada.");
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

.social-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  margin-bottom: 1rem;
}

.git, .discord {
  width: 90%;
  
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

  .campos {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  align-items: center;
  margin-bottom: 1rem;
  max-width: 370px;
}
@media (max-width: 600px) {
  .campos {
    max-width: 98vw;
  }
}

  :deep(.v-text-field), .git, .discord {
  margin-bottom: 15px;
  width: 100%;
  max-width: 370px;
}
@media (max-width: 600px) {
  :deep(.v-text-field), .git, .discord {
    width: 100%;
    min-width: 0;
    max-width: 100vw;
  }
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
.git, .discord {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  width: 340px;
  max-width: 100%;
}
@media (max-width: 600px) {
  .git, .discord {
    width: 100%;
    min-width: 0;
    max-width: 100vw;
  }
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
  max-width: 370px;
  width: 100%;
}
@media (max-width: 600px) {
  .v-btn {
    width: 100%;
    min-width: 0;
    max-width: 100vw;
  }
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
