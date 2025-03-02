<template>
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Usuário:</label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username" 
            :class="{ 'input-error': errors.username }"
            required
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            :class="{ 'input-error': errors.email }"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>
        
        <div class="form-group">
          <label for="password">Senha:</label>
          <div class="password-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="formData.password"
              :class="{ 'input-error': errors.password }"
              required
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>
        
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Processando...' : 'Entrar' }}
        </button>
        
        <div v-if="loginMessage" :class="['message', loginMessage.type]">
          {{ loginMessage.text }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginComponent',
    data() {
      return {
        formData: {
          username: '',
          email: '',
          password: ''
        },
        errors: {
          username: '',
          email: '',
          password: ''
        },
        showPassword: false,
        isSubmitting: false,
        loginMessage: null
      }
    },
    methods: {
      validateForm() {
        let isValid = true;
        this.errors = {
          username: '',
          email: '',
          password: ''
        };
        
        // Validação do usuário
        if (!this.formData.username.trim()) {
          this.errors.username = 'O nome de usuário é obrigatório';
          isValid = false;
        } else if (this.formData.username.length < 3) {
          this.errors.username = 'O nome de usuário deve ter pelo menos 3 caracteres';
          isValid = false;
        }
        
        // Validação do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.formData.email.trim()) {
          this.errors.email = 'O email é obrigatório';
          isValid = false;
        } else if (!emailRegex.test(this.formData.email)) {
          this.errors.email = 'Por favor, insira um email válido';
          isValid = false;
        }
        
        // Validação da senha
        if (!this.formData.password) {
          this.errors.password = 'A senha é obrigatória';
          isValid = false;
        } else if (this.formData.password.length < 6) {
          this.errors.password = 'A senha deve ter pelo menos 6 caracteres';
          isValid = false;
        }
        
        return isValid;
      },
      
      async handleSubmit() {
        if (!this.validateForm()) {
          return;
        }
        
        this.isSubmitting = true;
        this.loginMessage = null;
        
        try {
          // Simulação de uma chamada de API
          // Substitua este trecho pelo seu código de autenticação real
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Exemplo de resposta bem-sucedida
          // Na implementação real, você faria uma requisição ao seu backend
          console.log('Dados enviados:', this.formData);
          
          // Simula login bem-sucedido
          this.loginMessage = {
            type: 'success',
            text: 'Login realizado com sucesso!'
          };
          
          // Em um caso real, você pode redirecionar ou emitir um evento
          this.$emit('login-success', this.formData);
          
        } catch (error) {
          // Tratamento de erro
          this.loginMessage = {
            type: 'error',
            text: 'Falha ao realizar login. Tente novamente.'
          };
          console.error('Erro de login:', error);
        } finally {
          this.isSubmitting = false;
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s;
  }
  
  input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  .input-error {
    border-color: #e74c3c !important;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 14px;
    margin-top: 5px;
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
  
  .submit-button {
    padding: 12px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-button:hover {
    background-color: #3a7bc8;
  }
  
  .submit-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .message {
    padding: 10px;
    border-radius: 4px;
    margin-top: 15px;
    text-align: center;
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
  </style>
  Last edited 3 hours ago
  
  
  