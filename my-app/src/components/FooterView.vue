<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Logo e texto de direitos autorais -->
      <div class="footer-logo-section">
        <div class="footer-logo">
          <h2>SocialConnect</h2>
        </div>
        <p class="copyright">
          &copy; {{ currentYear }} SocialConnect. Todos os direitos reservados.
        </p>
        <div class="language-selector">
          <select v-model="selectedLanguage">
            <option value="pt-br">Português (Brasil)</option>
            <option value="en-us">English (US)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <!-- Links do footer em colunas -->
      <div class="footer-links">
        <div class="footer-column">
          <h3>Navegação</h3>
          <ul>
            <li><a href="/">Início</a></li>
            <li><a href="#">Minha Rede</a></li>
            <li><a href="#">Vagas</a></li>
            <li><a href="#">Mensagens</a></li>
            <li><a href="#">Notificações</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3>Recursos</h3>
          <ul>
            <li><a href="#">Grupos</a></li>
            <li><a href="#">Serviços</a></li>
            <li><a href="#">Eventos</a></li>
            <li><a href="#">Aprendizado</a></li>
            <li><a href="#">Publicações</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3>SocialConnect</h3>
          <ul>
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Carreiras</a></li>
            <li><a href="#">Publicidade</a></li>
            <li><a href="#">Soluções para empresas</a></li>
            <li><a href="#">Central de Ajuda</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3>Legal</h3>
          <ul>
            <li><a href="#">Política de Privacidade</a></li>
            <li><a href="#">Termos de Uso</a></li>
            <li><a href="#">Política de Cookies</a></li>
            <li><a href="#">Diretrizes da Comunidade</a></li>
            <li><a href="#">Controle de Privacidade</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Redes sociais e app download -->
    <div class="footer-bottom">
      <div class="social-links">
        <a href="#" class="social-icon">
          <i class="fab fa-linkedin"></i>
        </a>
        <a href="#" class="social-icon">
          <i class="fab fa-facebook"></i>
        </a>
        <a href="#" class="social-icon">
          <i class="fab fa-twitter"></i>
        </a>
        <a href="#" class="social-icon">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="#" class="social-icon">
          <i class="fab fa-youtube"></i>
        </a>
      </div>
    </div>

    <!-- Barra de rodapé final -->
    <div class="subfooter">
      <div class="subfooter-container">
        <p>SocialConnect Corporation © {{ currentYear }}</p>
        <div class="subfooter-links">
          <a href="#">Contratos de Usuário</a>
          <a href="#">Acessibilidade</a>
          <a href="#">Suas Escolhas de Anúncios</a>
          <a href="#">Configurações</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'SiteFooter',
  data() {
    return {
      selectedLanguage: 'pt-br',
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: #f3f2ef;
  color: rgba(0, 0, 0, 0.9);
  margin-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.footer-container {
  max-width: 1128px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

/* Logo e copyright */
.footer-logo-section {
  flex: 1;
  min-width: 240px;
}

.footer-logo h2 {
  font-size: 24px;
  color: #0a66c2;
  margin-bottom: 16px;
}

.copyright {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 16px;
}

.language-selector {
  margin-top: 20px;
}

.language-selector select {
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: rgba(0, 0, 0, 0.9);
  width: 180px;
}

/* Colunas de links */
.footer-links {
  flex: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-column {
  flex: 1;
  min-width: 160px;
}

.footer-column h3 {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column ul li {
  margin-bottom: 8px;
}

.footer-column ul li a {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-column ul li a:hover {
  color: #0a66c2;
  text-decoration: underline;
}

/* Área de redes sociais e download */
.footer-bottom {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3f2ef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #0077b5;
  text-decoration: none;
}

.social-icon:hover {
  background-color: #0077b5;
  color: white;
  transform: translateY(-3px);
}

.social-icon i {
  font-size: 20px;
}

/* Subfooter */
.subfooter {
  background-color: #f3f2ef;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 0;
}

.subfooter-container {
  max-width: 1128px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.subfooter p {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.subfooter-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.subfooter-links a {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-decoration: none;
}

.subfooter-links a:hover {
  text-decoration: underline;
  color: #0a66c2;
}

/* Responsividade */
@media screen and (max-width: 768px) {
  .footer-container, 
  .footer-bottom {
    flex-direction: column;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 24px;
  }
  
  .footer-column {
    width: 100%;
  }
  
  .app-download {
    align-items: flex-start;
    margin-top: 24px;
  }
  
  .subfooter-container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>