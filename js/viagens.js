/* ============================================================
   viagens.js — Gestão de Viagens
   ============================================================ */

const ViagensModule = {
    init() {
        this.render();
        document.getElementById('btn-nova-viagem').addEventListener('click', () => this.openForm());
    },

    render() {
        const viagens = DB.getViagens();
        const clientes = DB.getClientes();
        const tbody = document.querySelector('#tabela-viagens tbody');
        if (!tbody) return;

        if (!viagens.length) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-500);">Nenhuma viagem cadastrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = viagens.sort((a, b) => new Date(a.dataIda) - new Date(b.dataIda)).map(v => {
            const cliente = clientes.find(c => c.id === v.clienteId);
            const statusClass = v.status === 'Confirmada' ? 'success' : v.status === 'Cancelada' ? 'danger' : 'warning';
            const fmtValor = v.valor ? 'R$ ' + Number(v.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-';
            return `
                <tr>
                    <td>${cliente ? cliente.nome : '-'}</td>
                    <td><strong>${v.destino || '-'}</strong></td>
                    <td>${v.dataIda ? new Date(v.dataIda + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                    <td>${v.dataVolta ? new Date(v.dataVolta + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                    <td>${v.servico || '-'}</td>
                    <td>${fmtValor}</td>
                    <td><span class="badge badge-${statusClass}">${v.status || 'Pendente'}</span></td>
                    <td>
                        <button class="btn btn-xs btn-outline" onclick="ViagensModule.openForm('${v.id}')">✏️</button>
                        <button class="btn btn-xs btn-danger" onclick="ViagensModule.remove('${v.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openForm(id) {
        const v = id ? DB.getViagens().find(x => x.id === id) : { clienteId: '', destino: '', dataIda: '', dataVolta: '', servico: '', companhia: '', valor: 0, status: 'Pendente', notas: '' };
        const clientes = DB.getClientes();
        const servicos = DB.getServicos();
        const companhias = DB.getCompanhias();

        const html = `
            <div class="form-group"><label>Cliente *</label><select id="v-cliente"><option value="">-- Selecione --</option>${clientes.map(c => `<option value="${c.id}" ${c.id === v.clienteId ? 'selected' : ''}>${c.nome}</option>`).join('')}</select></div>
            <div class="form-group"><label>Destino *</label><input type="text" id="v-destino" value="${v.destino || ''}" placeholder="Ex: Paris, França"></div>
            <div class="form-row">
                <div class="form-group"><label>Data de Ida</label><input type="date" id="v-data-ida" value="${v.dataIda || ''}"></div>
                <div class="form-group"><label>Data de Volta</label><input type="date" id="v-data-volta" value="${v.dataVolta || ''}"></div>
            </div>
            <div class="form-group"><label>Serviço</label><select id="v-servico"><option value="">-- Selecione --</option>${servicos.map(s => `<option ${s === v.servico ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
            <div class="form-group"><label>Companhia Aérea</label><select id="v-companhia"><option value="">-- Selecione --</option>${companhias.map(c => `<option ${c === v.companhia ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            <div class="form-group"><label>Valor (R$)</label><input type="number" id="v-valor" value="${v.valor || 0}" step="0.01" min="0"></div>
            <div class="form-group"><label>Status</label><select id="v-status"><option ${v.status === 'Pendente' ? 'selected' : ''}>Pendente</option><option ${v.status === 'Confirmada' ? 'selected' : ''}>Confirmada</option><option ${v.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option><option ${v.status === 'Concluída' ? 'selected' : ''}>Concluída</option><option ${v.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option></select></div>
            <div class="form-group"><label>Notas</label><textarea id="v-notas">${v.notas || ''}</textarea></div>
        `;
        AppModule.abrirModal(id ? 'Editar Viagem' : 'Nova Viagem', html, [
            { label: 'Cancelar', class: 'btn-outline', action: () => AppModule.fecharModal() },
            { label: id ? 'Salvar' : 'Criar', class: 'btn-primary', action: () => this.save(id) }
        ]);
    },

    save(id) {
        const clienteId = document.getElementById('v-cliente').value;
        const destino = document.getElementById('v-destino').value.trim();
        if (!clienteId || !destino) { AppModule.showToast('Cliente e destino são obrigatórios!', 'error'); return; }
        const dados = {
            clienteId, destino,
            dataIda: document.getElementById('v-data-ida').value,
            dataVolta: document.getElementById('v-data-volta').value,
            servico: document.getElementById('v-servico').value,
            companhia: document.getElementById('v-companhia').value,
            valor: parseFloat(document.getElementById('v-valor').value) || 0,
            status: document.getElementById('v-status').value,
            notas: document.getElementById('v-notas').value.trim()
        };
        const viagens = DB.getViagens();
        if (id) {
            const idx = viagens.findIndex(x => x.id === id);
            if (idx >= 0) viagens[idx] = { ...viagens[idx], ...dados };
            DB.logAtividade('viagem', `Viagem atualizada: ${destino}`);
        } else {
            dados.id = DB.gerarId('viagem');
            dados.criadoEm = new Date().toISOString();
            viagens.push(dados);
            DB.logAtividade('viagem', `Nova viagem: ${destino}`);
        }
        DB.setViagens(viagens);
        AppModule.fecharModal();
        this.render();
        AppModule.showToast('Viagem salva!', 'success');
    },

    remove(id) {
        if (!confirm('Excluir esta viagem?')) return;
        DB.setViagens(DB.getViagens().filter(v => v.id !== id));
        this.render();
        AppModule.showToast('Viagem excluída', 'info');
    }
};
