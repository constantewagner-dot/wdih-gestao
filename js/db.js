/* ============================================================
   db.js — Banco de Dados Local (localStorage)
   ============================================================ */

const DB = {
    // Chaves do localStorage
    KEYS: {
        AGENCIA: 'wdih_agencia',
        USUARIO: 'wdih_usuario',
        CLIENTES: 'wdih_clientes',
        NEGOCIOS: 'wdih_negocios',
        VIAGENS: 'wdih_viagens',
        TRANSACOES: 'wdih_transacoes',
        SERVICOS: 'wdih_servicos',
        PIPELINE_STAGES: 'wdih_pipeline_stages',
        COMPANHIAS: 'wdih_companhias',
        PROGRAMAS: 'wdih_programas',
        CARTOES: 'wdih_cartoes',
        ATIVIDADES: 'wdih_atividades',
        SETUP_DONE: 'wdih_setup_done'
    },

    // Métodos genéricos
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('DB.get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('DB.set error (storage may be full):', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clearAll() {
        Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    },

    // Geração de IDs
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    },

    // Métodos específicos
    getClientes() { return this.get(this.KEYS.CLIENTES) || []; },
    setClientes(data) { return this.set(this.KEYS.CLIENTES, data); },

    getNegocios() { return this.get(this.KEYS.NEGOCIOS) || []; },
    setNegocios(data) { return this.set(this.KEYS.NEGOCIOS, data); },

    getViagens() { return this.get(this.KEYS.VIAGENS) || []; },
    setViagens(data) { return this.set(this.KEYS.VIAGENS, data); },

    getTransacoes() { return this.get(this.KEYS.TRANSACOES) || []; },
    setTransacoes(data) { return this.set(this.KEYS.TRANSACOES, data); },

    getServicos() { return this.get(this.KEYS.SERVICOS) || []; },
    setServicos(data) { return this.set(this.KEYS.SERVICOS, data); },

    getPipelineStages() { return this.get(this.KEYS.PIPELINE_STAGES) || []; },
    setPipelineStages(data) { return this.set(this.KEYS.PIPELINE_STAGES, data); },

    getCompanhias() { return this.get(this.KEYS.COMPANHIAS) || []; },
    setCompanhias(data) { return this.set(this.KEYS.COMPANHIAS, data); },

    getProgramas() { return this.get(this.KEYS.PROGRAMAS) || []; },
    setProgramas(data) { return this.set(this.KEYS.PROGRAMAS, data); },

    getCartoes() { return this.get(this.KEYS.CARTOES) || []; },
    setCartoes(data) { return this.set(this.KEYS.CARTOES, data); },

    getAgencia() { return this.get(this.KEYS.AGENCIA) || {}; },
    setAgencia(data) { return this.set(this.KEYS.AGENCIA, data); },

    getUsuario() { return this.get(this.KEYS.USUARIO) || null; },
    setUsuario(data) { return this.set(this.KEYS.USUARIO, data); },

    getAtividades() { return this.get(this.KEYS.ATIVIDADES) || []; },
    setAtividades(data) { return this.set(this.KEYS.ATIVIDADES, data); },

    isSetupDone() { return this.get(this.KEYS.SETUP_DONE) === true; },
    setSetupDone() { return this.set(this.KEYS.SETUP_DONE, true); },

    // Registrar atividade
    logAtividade(tipo, descricao) {
        const atividades = this.getAtividades();
        atividades.unshift({
            id: this.uid(),
            tipo,
            descricao,
            data: new Date().toISOString()
        });
        // Manter apenas últimas 50
        if (atividades.length > 50) atividades.length = 50;
        this.setAtividades(atividades);
    },

    // Dados iniciais padrão
    seedDefaults() {
        if (!this.getServicos().length) {
            this.setServicos([
                'Emissão de Passagens', 'Seguro Viagem', 'Hospedagem',
                'Pacotes de Viagem', 'Aluguel de Carro', 'Consultoria de Milhas',
                'Visto e Documentação', 'Transfer / Transporte', 'Cruzeiros'
            ]);
        }
        if (!this.getPipelineStages().length) {
            this.setPipelineStages([
                'Lead / Contato Inicial', 'Qualificação', 'Proposta Enviada',
                'Negociação', 'Fechado (Ganho)', 'Pós-Venda'
            ]);
        }
        if (!this.getCompanhias().length) {
            this.setCompanhias(['LATAM', 'Gol', 'Azul', 'American Airlines', 'Delta', 'United', 'Air France', 'Emirates']);
        }
        if (!this.getProgramas().length) {
            this.setProgramas(['Smiles', 'LATAM Pass', 'TudoAzul', 'Livelo', 'Esfera', 'Miles&More', 'Flying Blue']);
        }
        if (!this.getCartoes().length) {
            this.setCartoes(['C6 Bank', 'XP', 'Santander', 'Bradesco', 'Itaú', 'Banco do Brasil', 'Nubank', 'Inter']);
        }
    }
};
