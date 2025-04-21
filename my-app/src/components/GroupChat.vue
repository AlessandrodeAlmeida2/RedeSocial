<template>
    <div class="group-chat">
      <div class="messages">
        <div v-for="msg in messages" :key="msg.id" class="message">
          <strong>{{ msg.username }}:</strong> {{ msg.message }}
        </div>
      </div>
      <div class="input-area">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escreva uma mensagem..." />
        <button @click="sendMessage">Enviar</button>
      </div>
    </div>
  </template>
  
  <script>
  import { supabase } from '@/supabase';
  
  export default {
    props: ['groupId'],
    data() {
      return {
        messages: [],
        newMessage: '',
        user: null,
      };
    },
    async mounted() {
      await this.getUser();
      this.fetchMessages();
      this.subscribeToMessages();
      console.log('Grupo ID:', this.groupId);
    },
    methods: {
      async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;
      },
  
      async fetchMessages() {
        const { data, error } = await supabase
          .from('group_messages')
          .select('id, message, created_at, user_id, users(username)')
          .eq('group_id', this.groupId)
          .order('created_at', { ascending: true });
  
        if (!error) {
          this.messages = data.map(m => ({
            ...m,
            username: m.users?.username || 'Desconhecido',
          }));
        }
      },
  
      subscribeToMessages() {
        supabase
          .channel('group_chat')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${this.groupId}` },
            (payload) => {
              const newMsg = {
                ...payload.new,
                username: this.user?.user_metadata?.username || 'Você'
              };
              this.messages.push(newMsg);
            }
          )
          .subscribe();
      },
  
      async sendMessage() {
        if (!this.newMessage.trim()) return;
  
        const { error } = await supabase.from('group_messages').insert({
          group_id: this.groupId,
          user_id: this.user.id,
          message: this.newMessage.trim(),
        });
  
        if (!error) {
          this.newMessage = '';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .group-chat {
    background: #ece5dd;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    max-width: 500px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    height: 70vh;
    border: none;
    overflow: hidden;
    border: 1.5px solid #d1d7db;
  }
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: #fafafa;
  }
  .message {
    max-width: 75%;
    padding: 0.6rem 1rem;
    border-radius: 16px 16px 16px 4px;
    background: #fff;
    color: #222;
    font-size: 1rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    margin-bottom: 0.2rem;
    align-self: flex-start;
    word-break: break-word;
    position: relative;
  }
  .message strong {
    color: #075e54;
    font-weight: 600;
    margin-right: 0.25rem;
  }
  .message.me {
    background: #dcf8c6;
    align-self: flex-end;
    border-radius: 16px 16px 4px 16px;
  }
  .input-area {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #f7f7f7;
    border-top: 1px solid #e0e0e0;
    align-items: center;
  }
  .input-area input {
    flex: 1;
    border: none;
    border-radius: 20px;
    padding: 0.7rem 1.2rem;
    font-size: 1rem;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    outline: none;
  font-size: 1rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  outline: none;
}
.input-area input:focus {
  background: #f0f0f0;
}
.input-area button {
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.7rem 1.5rem;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(18,140,126,0.07);
}
.input-area button:hover {
  background: linear-gradient(135deg, #128c7e, #25d366);
}

/* Responsivo */
@media (max-width: 600px) {
  .group-chat {
    max-width: 100vw;
    height: 90vh;
    border-radius: 0;
  }
  .messages {
    padding: 0.5rem;
  }
  .input-area {
    padding: 0.5rem 0.5rem;
  }
}
</style>
  