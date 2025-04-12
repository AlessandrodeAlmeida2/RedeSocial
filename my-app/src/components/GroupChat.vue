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
    border: 1px solid #ccc;
    padding: 1rem;
    max-width: 600px;
    margin: 1rem auto;
  }
  .messages {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 1rem;
  }
  .message {
    margin-bottom: 0.5rem;
  }
  .input-area {
    display: flex;
    gap: 0.5rem;
  }
  </style>
  