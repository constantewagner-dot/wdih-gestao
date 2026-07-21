/* ============================================================
   config.js — Setup Wizard + Configurações
   ============================================================ */

const SetupWizard = {
    currentStep: 1,
    totalSteps: 3,

    init() {
        this.currentStep = 1;
        this.showStep(1);

        document.getElementById('btn-setup-next').addEventListener('click', () => this.next());
        document.getElementById('btn-setup-prev').addEventListener('click', () => this.prev());
        document.getElementById('setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.finish();
        });
    },

    showStep(n) {
        this.currentStep = n;
        document.querySelectorAll('.setup-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`.setup-panel[data-panel="${n}"]`).classList.add('active');

        // Steps indicator
        document.querySelectorAll('.setup-steps .step').forEach((s, i) => {
            s.classList.remove('active', 'done');
            if (i + 1 < n) s.classList.add('done');
            if (i + 1 === n) s.classList.add('active');
        });
        document.querySelectorAll('.step-line').forEach((l, i) => {
            if (i + 1 < n) l.classList.add('done');
            else l.classList.remove('done');
        });

        // Buttons
        document.getElementById('btn-setup-prev').style.display = n === 1 ? 'none' : 'inline-flex';
        document.getElementById('btn-setup-next').style.display = n === this.totalSteps ? 'none' : 'inline-flex';
        document.getElementById('btn-setup-finish').style.display = n === this.totalSteps ? 'inline-flex' : 'none';
    },

    next() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    },

    prev() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    finish() {
        // Salvar dados da agência
        const agencia = {
            nome: document.getElementById('setup-nome').value || 'WDIH Milhas & Viagens',
            email: document.getElementById('setup-email').value,
            telefone: document.getElementById('setup-telefone').value,
            cnpj: document.getElementById('setup-cnpj').value,
            configuradoEm: new Date().toISOString()
        };
        DB.setAgencia(agencia);

        // Salvar serviços selecionados
        const servicos = [];
        document.querySelectorAll('#setup-servicos input:checked').forEach(cb => {
            servicos.push(cb.dataset.servico);
        });
        DB.setServicos(servicos);

        // Salvar pipeline stages
        const stages = [];
        document.querySelectorAll('#setup-pipeline input[data-stage]').forEach(inp => {
            const val = inp.value.trim();
            if (val) stages.push(val);
        });
        DB.setPipelineStages(stages);

        // Seed defaults
        DB.seedDefaults();

        // Marcar setup como concluído
        DB.setSetupDone();
        DB.logAtividade('sistema', 'Configuração inicial concluída');

        // Redirecionar
        document.getElementById('page-setup').classList.remove('active');
        document.getElementById('page-app').classList.add('active');
        App.init();
    }
};

/* ============================================================
   Módulo de Configurações (painel)
   ============================================================ */
const ConfigModule = {
    init() {
        this.renderAgencia();
        this.renderServicos();
        this.renderCompanhias();
        this.renderProgramas();
        this.renderCartoes();
        this.renderWhatsapp();
        this.bindEvents();
    },

    renderAgencia() {
        const agencia = DB.getAgencia();
        const container = document.getElementById('config-agencia');
        container.innerHTML = `
            <div class="input-group">
                <label>Nome da Agência</label>
                <input type="text" id="cfg-nome" value="${agencia.nome || ''}">
            </div>
            <div class="input-group">
                <label>E-mail</label>
                <input type="email" id="cfg-email" value="${agencia.email || ''}">
            </div>
            <div class="input-group">
                <label>Telefone / WhatsApp</label>
                <input type="text" id="cfg-telefone" value="${agencia.telefone || ''}">
            </div>
            <div class="input-group">
                <label>CNPJ</label>
                <input type="text" id="cfg-cnpj" value="${agencia.cnpj || ''}">
            </div>
            <button class="btn btn-primary btn-sm" id="btn-salvar-agencia">Salvar</button>
        `;
        document.getElementById('btn-salvar-agencia').addEventListener('click', () => {
            DB.setAgencia({
                nome: document.getElementById('cfg-nome').value,
                email: document.getElementById('cfg-email').value,
                telefone: document.getElementById('cfg-telefone').value,
                cnpj: document.getElementById('cfg-cnpj').value
            });
            App.toast('Dados da agência salvos!', 'success');
            DB.logAtividade('config', 'Dados da agência atualizados');
        });
    },

    renderServicos() {
        const servicos = DB.getServicos();
        const container = document.getElementById('config-servicos');
        container.innerHTML = servicos.map(s => `
            <div class="config-list-item">
                <span>${s}</span>
                <button class="btn btn-xs btn-danger" data-remover-servico="${s}">✕</button>
            </div>
        `).join('');
        container.querySelectorAll('[data-remover-servico]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nome = btn.dataset.removerServico;
                const nova = DB.getServicos().filter(s => s !== nome);
                DB.setServicos(nova);
                this.renderServicos();
                DB.logAtividade('config', `Serviço removido: ${nome}`);
            });
        });
    },

    renderCompanhias() {
        const companhias = DB.getCompanhias();
        const container = document.getElementById('config-companhias');
        container.innerHTML = companhias.map(c => `
            <div class="config-list-item">
                <span>${c}</span>
                <button class="btn btn-xs btn-danger" data-remover-companhia="${c}">✕</button>
            </div>
        `).join('');
        container.querySelectorAll('[data-remover-companhia]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nome = btn.dataset.removerCompanhia;
                DB.setCompanhias(DB.getCompanhias().filter(c => c !== nome));
                this.renderCompanhias();
            });
        });
    },

    renderProgramas() {
        const programas = DB.getProgramas();
        const container = document.getElementById('config-programas');
        container.innerHTML = programas.map(p => `
            <div class="config-list-item">
                <span>${p}</span>
                <button class="btn btn-xs btn-danger" data-remover-programa="${p}">✕</button>
            </div>
        `).join('');
        container.querySelectorAll('[data-remover-programa]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nome = btn.dataset.removerPrograma;
                DB.setProgramas(DB.getProgramas().filter(p => p !== nome));
                this.renderProgramas();
            });
        });
    },

    renderCartoes() {
        const cartoes = DB.getCartoes();
        const container = document.getElementById('config-cartoes');
        container.innerHTML = cartoes.map(c => `
            <div class="config-list-item">
                <span>${c}</span>
                <button class="btn btn-xs btn-danger" data-remover-cartao="${c}">✕</button>
            </div>
        `).join('');
        container.querySelectorAll('[data-remover-cartao]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nome = btn.dataset.removerCartao;
                DB.setCartoes(DB.getCartoes().filter(c => c !== nome));
                this.renderCartoes();
            });
        });
    },

    renderWhatsapp() {
        const agencia = DB.getAgencia();
        const container = document.getElementById('config-whatsapp');
        const telefone = agencia.telefone || '';
        const numeroLimpo = telefone.replace(/\D/g, '');
        container.innerHTML = `
            <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px;">
                O sistema gera links para WhatsApp Web automaticamente.
            </p>
            <div class="input-group">
                <label>Número padrão (com DDD)</label>
                <input type="text" id="cfg-whatsapp-numero" value="${telefone}" placeholder="(11) 99999-9999">
            </div>
            <button class="btn btn-primary btn-sm" id="btn-salvar-whatsapp">Salvar</button>
            ${numeroLimpo ? `
                <a href="https://wa.me/55${numeroLimpo}" target="_blank" class="whatsapp-btn" style="margin-left:8px;">
                    💬 Testar Link
                </a>
            ` : ''}
        `;
        document.getElementById('btn-salvar-whatsapp').addEventListener('click', () => {
            const ag = DB.getAgencia();
            ag.telefone = document.getElementById('cfg-whatsapp-numero').value;
            DB.setAgencia(ag);
            App.toast('Número WhatsApp salvo!', 'success');
            this.renderWhatsapp();
        });
    },

    bindEvents() {
        const bindAdd = (btnId, inputPrompt, getter, setter, logLabel) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            // Remove listeners antigos
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                const nome = prompt(inputPrompt);
                if (nome && nome.trim()) {
                    const lista = getter();
                    if (!lista.includes(nome.trim())) {
                        lista.push(nome.trim());
                        setter(lista);
                        this[`render${logLabel}`]();
                        DB.logAtividade('config', `${logLabel} adicionado: ${nome.trim()}`);
                        App.toast(`${logLabel} adicionado!`, 'success');
                    }
                }
            });
        };

        bindAdd('btn-add-servico', 'Nome do serviço:', () => DB.getServicos(), (d) => DB.setServicos(d), 'Servicos');
        bindAdd('btn-add-companhia', 'Nome da companhia aérea:', () => DB.getCompanhias(), (d) => DB.setCompanhias(d), 'Companhias');
        bindAdd('btn-add-programa', 'Nome do programa de fidelidade:', () => DB.getProgramas(), (d) => DB.setProgramas(d), 'Programas');
        bindAdd('btn-add-cartao', 'Nome do cartão:', () => DB.getCartoes(), (d) => DB.setCartoes(d), 'Cartoes');
    }
};
