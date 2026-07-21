/* ============================================================
   dashboard.js — Dashboard Principal (foco em Vendas Fechadas)
   ============================================================ */

const DashboardModule = {
    init() {
        this.refresh();
        this.atualizarDataHora();
        setInterval(() => this.atualizarDataHora(), 60000);
    },

    refresh() {
        this.renderCards();
        this.renderPipeline();
        this.renderFechadosRecentes();
        this.renderAtividades();
    },

    renderCards() {
        const negocios = DB.getNegocios();
        const clientes = DB.getClientes();
        const agora = new Date();
        const mesAtual = agora.getMonth();
        const anoAtual = agora.getFullYear();

        const isFechado = (n) => n.stage.toLowerCase().includes('fechado') && n.stage.toLowerCase().includes('ganho');
        const ativos = negocios.filter(n => !isFechado(n));
        const fechados = negocios.filter(n => isFechado(n));

        const fechadosMes = fechados.filter(n => {
            const d = n.atualizadoEm ? new Date(n.atualizadoEm) : new Date(n.criadoEm);
            return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
        });

        const receitaTotal = fechados.reduce((s, n) => s + (Number(n.valor) || 0), 0);
        const receitaMes = fechadosMes.reduce((s, n) => s + (Number(n.valor) || 0), 0);
        const taxa = negocios.length > 0 ? Math.round((fechados.length / negocios.length) * 100) : 0;
        const ticketMedio = fechados.length > 0 ? receitaTotal / fechados.length : 0;
        const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;

        const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        document.getElementById('stat-negocios-ativos').textContent = ativos.length;
        document.getElementById('stat-fechados-total').textContent = fechados.length;
        document.getElementById('stat-receita-total').textContent = fmt(receitaTotal);
        document.getElementById('stat-taxa-conversao').textContent = taxa + '%';
        document.getElementById('stat-fechados-mes').textContent = fechadosMes.length;
        document.getElementById('stat-receita-mes').textContent = fmt(receitaMes);
        document.getElementById('stat-ticket-medio').textContent = fmt(ticketMedio);
        document.getElementById('stat-clientes-ativos').textContent = clientesAtivos;

        const taxaEl = document.getElementById('stat-taxa-conversao');
        if (taxaEl) {
            if (taxa >= 50) taxaEl.style.color = 'var(--success)';
            else if (taxa >= 25) taxaEl.style.color = 'var(--warning)';
            else taxaEl.style.color = 'var(--danger)';
        }
    },

    renderPipeline() {
        const stages = DB.getPipelineStages();
        const negocios = DB.getNegocios();
        const pipelineDiv = document.getElementById('dashboard-pipeline');
        const summaryDiv = document.getElementById('pipeline-summary');

        if (!stages.length) {
            if (pipelineDiv) pipelineDiv.innerHTML = '<p class="dashboard-empty">Configure o pipeline nas ⚙️ Configurações</p>';
            return;
        }

        const maxCount = Math.max(...stages.map(s => negocios.filter(n => n.stage === s).length), 1);
        let totalValorPipeline = 0;

        if (pipelineDiv) {
            pipelineDiv.innerHTML = stages.map(s => {
                const cards = negocios.filter(n => n.stage === s);
                const count = cards.length;
                const valor = cards.reduce((sum, n) => sum + (Number(n.valor) || 0), 0);
                totalValorPipeline += valor;
                const width = Math.max((count / maxCount) * 100, count > 0 ? 4 : 0);
                const isFechado = s.toLowerCase().includes('fechado') && s.toLowerCase().includes('ganho');
                const barColor = isFechado ? 'var(--success)' : 'var(--royal)';

                return `
                    <div style="margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:3px;">
                            <span style="font-weight:500;">${s}</span>
                            <span style="color:var(--gray-500);">
                                <strong style="color:var(--gray-900);">${count}</strong> negócio${count !== 1 ? 's' : ''}
                                ${valor > 0 ? ' · R$ ' + Number(valor).toLocaleString('pt-BR', {minimumFractionDigits: 0}) : ''}
                            </span>
                        </div>
                        <div style="background:var(--gray-100);border-radius:6px;overflow:hidden;height:10px;">
                            <div style="background:${barColor};height:100%;width:${width}%;transition:width .5s ease;border-radius:6px;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (summaryDiv) {
            const totalNegocios = negocios.length;
            const fechadosCount = negocios.filter(n => n.stage.toLowerCase().includes('fechado') && n.stage.toLowerCase().includes('ganho')).length;
            summaryDiv.innerHTML = `
                <span>📋 <strong>${totalNegocios}</strong> total</span>
                <span>🏆 <strong>${fechadosCount}</strong> fechados</span>
                <span>💵 <strong>R$ ${Number(totalValorPipeline).toLocaleString('pt-BR', {minimumFractionDigits: 0})}</strong> em pipeline</span>
            `;
        }
    },

    renderFechadosRecentes() {
        const negocios = DB.getNegocios();
        const clientes = DB.getClientes();
        const div = document.getElementById('dashboard-fechados-recentes');
        if (!div) return;

        const isFechado = (n) => n.stage.toLowerCase().includes('fechado') && n.stage.toLowerCase().includes('ganho');
        const fechados = negocios.filter(n => isFechado(n))
            .sort((a, b) => new Date(b.atualizadoEm || b.criadoEm) - new Date(a.atualizadoEm || a.criadoEm))
            .slice(0, 5);

        if (!fechados.length) {
            div.innerHTML = `<div class="dashboard-empty"><div class="dashboard-empty-icon">🏆</div><p>Nenhuma venda fechada ainda.</p><p style="font-size:11px;">Mova os cards no Pipeline para "Fechado (Ganho)"</p></div>`;
            return;
        }

        div.innerHTML = fechados.map(n => {
            const cliente = clientes.find(c => c.id === n.clienteId);
            const data = n.atualizadoEm || n.criadoEm;
            return `
                <div class="fechado-item">
                    <div class="fechado-info">
                        <div class="fechado-titulo">${n.titulo}</div>
                        <div class="fechado-cliente">
                            ${cliente ? '👤 ' + cliente.nome : 'Sem cliente'}
                            ${data ? ' · ' + this.formatTime(data) : ''}
                        </div>
                    </div>
                    <div class="fechado-valor">
                        ${n.valor ? 'R$ ' + Number(n.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAtividades() {
        const atividades = DB.getAtividades().slice(0, 10);
        const div = document.getElementById('dashboard-atividades');
        if (!div) return;

        if (!atividades.length) {
            div.innerHTML = '<p class="dashboard-empty">Nenhuma atividade registrada</p>';
            return;
        }

        const dotClass = (tipo) => {
            const map = { 'pipeline': 'pipeline', 'cliente': 'cliente', 'financeiro': 'financeiro', 'viagem': 'viagem', 'venda': 'venda', 'backup': 'backup', 'sistema': 'sistema', 'config': 'config' };
            return map[tipo] || 'sistema';
        };

        div.innerHTML = atividades.map(a => `
            <div class="atividade-item">
                <span class="atividade-dot ${dotClass(a.tipo)}"></span>
                <span class="atividade-text">${a.descricao}</span>
                <span class="atividade-time">${this.formatTime(a.data)}</span>
            </div>
        `).join('');
    },

    atualizarDataHora() {
        const el = document.getElementById('dashboard-data-hora');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        }
    },

    formatTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return 'agora';
        if (diff < 3600) return Math.floor(diff / 60) + ' min';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd';
        return d.toLocaleDateString('pt-BR');
    }
};
