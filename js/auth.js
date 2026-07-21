/* ============================================================
   auth.js — Autenticação Local
   ============================================================ */

const Auth = {
    init() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => this.logout());
        }

        // Verificar se já está logado
        this.checkSession();
    },

    login() {
        const email = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-senha').value.trim();
        const errorEl = document.getElementById('login-error');

        if (!email || !senha) {
            errorEl.textContent = 'Preencha todos os campos.';
            return;
        }

        // Hash simples da senha (apenas para demonstração)
        const senhaHash = this.simpleHash(senha);

        // Verificar se usuário já existe
        const usuarioExistente = DB.getUsuario();

        if (usuarioExistente) {
            // Login existente
            if (usuarioExistente.email === email && usuarioExistente.senha === senhaHash) {
                this.setSession(usuarioExistente);
                this.redirect();
            } else {
                errorEl.textContent = 'E-mail ou senha incorretos.';
            }
        } else {
            // Primeiro acesso: criar conta
            const novoUsuario = {
                id: DB.uid(),
                email,
                senha: senhaHash,
                criadoEm: new Date().toISOString()
            };
            DB.setUsuario(novoUsuario);
            this.setSession(novoUsuario);
            DB.logAtividade('sistema', 'Primeiro acesso ao sistema');
            this.redirect();
        }
    },

    logout() {
        sessionStorage.removeItem('wdih_session');
        window.location.reload();
    },

    setSession(usuario) {
        sessionStorage.setItem('wdih_session', JSON.stringify({
            id: usuario.id,
            email: usuario.email,
            loginTime: Date.now()
        }));
    },

    checkSession() {
        const session = sessionStorage.getItem('wdih_session');
        if (session) {
            try {
                const data = JSON.parse(session);
                const usuario = DB.getUsuario();
                if (usuario && usuario.id === data.id) {
                    this.redirect();
                }
            } catch (e) {
                sessionStorage.removeItem('wdih_session');
            }
        }
    },

    redirect() {
        document.getElementById('page-login').classList.remove('active');

        if (!DB.isSetupDone()) {
            document.getElementById('page-setup').classList.add('active');
            SetupWizard.init();
        } else {
            DB.seedDefaults();
            document.getElementById('page-app').classList.add('active');
            App.init();
        }
    },

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'h_' + Math.abs(hash).toString(36);
    }
};

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => Auth.init());
