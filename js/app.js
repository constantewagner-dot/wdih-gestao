/* ============================================================
   app.js — Núcleo do Sistema (rotas, modal, toast, init)
   ============================================================ */

const App = {
    init() {
        this.setupRouting();
        this.setupModal();
        this.setupBackupButton();
        ConfigModule.init();
        ClientesModule.init();
        CRMModule.init();
        ViagensModule.init();
        FinanceiroModule.init();
        DashboardModule.init();
        BackupModule.init();

        // Rota inicial
        const hash = window.location.hash || '#dashboard';
        this.navigate(hash.substring(1));
    },

    setupRouting() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                window.location.hash = page;
                this.navigate(page);
            });
        });

        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'dashboard';
            this.navigate(page);
        });
    },

    navigate(page) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const section = document.getElementById(`section-${page}`);
        const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);

        if (section) section.classList.add('active');
        if (navItem) navItem.classList.add('active');

        // Refresh do módulo
        if (page === 'dashboard') DashboardModule.refresh();
        if (page === 'pipeline') CRMModule.render();
        if (page === 'clientes') ClientesModule.render();
        if (page === 'viagens') ViagensModule.render();
        if (page === 'financeiro') FinanceiroModule.render();
        if (page === 'config') ConfigModule.init();
    },

    setupModal() {
        document.getElementById('modal-close').addEventListener('click', () => Modal.close());
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') Modal.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') Modal.close();
        });
    },

    setupBackupButton() {
        document.getElementById('btn-backup').addEventListener('click', () => BackupModule.exportJSON());
    },

    toast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity .3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

/* ============================================================
   Modal Helper
   ============================================================ */
const Modal = {
    open(title, bodyHTML, buttons = []) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHTML;
        const footer = document.getElementById('modal-footer');
        footer.innerHTML = '';
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = `btn ${b.class}`;
            btn.textContent = b.label;
            btn.addEventListener('click', b.action);
            footer.appendChild(btn);
        });
        document.getElementById('modal-overlay').style.display = 'flex';
    },
    close() {
        document.getElementById('modal-overlay').style.display = 'none';
    }
};
