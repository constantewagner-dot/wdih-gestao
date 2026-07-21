/* ============================================================
   dashboard.js — Dashboard Principal
   ============================================================ */

const DashboardModule = {
    init() {
        this.refresh();
        this.atualizarDataHora();
        setInterval(() => this.atualizarDataHora(), 60000);
    },

    refresh() {
        const clientes = DB.getClientes();
        const negocios = DB.getNegocios();
        const transacoes = DB.getTransacoes();
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        const fmt = v => 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0});

        document.getElementById('stat-clientes').textContent = clientes.length;
        document.getElementById('stat-negocios').textContent = negocios.length;
        document.getElementById('stat-fechados').textContent = negocios.filter(n => n.stage.includes('Fechado') || n.stage.includes('Ganho')).length;

        const receitaMes = transacoes
            .filter(t => {
                const d = new Date(t.data);
                return t.tipo === 'Receita' && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
            })
            .reduce((s, t) => s + Number(t.valor), 0);
        document.getElementById('stat-receita').textContent = fmt(receitaMes);

        // Pipeline chart
        const stages = DB.getPipelineStages();
        const pipelineDiv = document.getElementById('dashboard-pipeline');
        const maxCount = Math.max(...stages.map(s => negocios.filter(n => n.stage === s).length), 1);
        pipelineDiv.innerHTML = stages.map(s => {
            const count = negocios.filter(n => n.stage === s).length;
            const width = (count / maxCount) * 100;
            return `
                <div style="margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                        <span>${s}</span>
                        <strong>${count}</strong>
                    </div>
                    <div style="background:var(--gray-100);border-radius:4px;overflow:hidden;height:8px;">
                        <div style="background:var(--royal);height:100%;width:${width}%;transition:width .5s;"></div>
                    </div>
                </div>
            `;
        }).join('') || '<p style="color:var(--gray-500);font-size:13px">Nenhum dado ainda</p>';

        // Atividades recentes
        const atividades = DB.getAtividades().slice(0, 8);
        const atividadesDiv = document.getElementById('dashboard-atividades');
        atividadesDiv.innerHTML = atividades.length
            ? atividades.map(a => `
                <div style="padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px;">
                    <div>${a.descricao}</div>
                    <div style="color:var(--gray-500);font-size:11px;">${this.formatTime(a.data)}</div>
                </div>
            `).join('')
            : '<p style="color:var(--gray-500);font-size:13px">Nenhuma atividade ainda</p>';
    },

    atualizarDataHora() {
        const el = document.getElementById('dashboard-data-hora');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        }
    },

    formatTime(iso) {
        const d = new Date(iso);
        const diff = (Date.now() - d.getTime()) / 1000;
        if (diff < 60) return 'agora';
        if (diff < 3600) return `${Math.floor(diff/60)} min atrás`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
        return d.toLocaleDateString('pt-BR');
    }
};
