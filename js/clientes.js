/* ============================================================
   clientes.js — Gestão de Clientes
   ============================================================ */

const ClientesModule = {
    init() {
        this.render();
        document.getElementById('btn-novo-cliente').addEventListener('click', () => this.openForm());
        document.getElementById('cliente-search').addEventListener('input', (e) => this.render(e.target.value));
    },

    render(filter = '') {
        const clientes = DB.getClientes();
        const tbody = document.querySelector('#tabela-clientes tbody');
        const filtered = filter
            ? clientes.filter(c =>
                c.nome.toLowerCase().includes(filter.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(filter.toLowerCase()) ||
                (c.telefone || '').includes(filter))
            : clientes;

        if (!filtered.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500)">
                Nenhum cliente encontrado. Clique em "+ Novo Cliente" para começar.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(c => {
            const negocios = DB.getNegocios().filter(n => n.clienteId === c.id).length;
            return `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.email || '-'}</td>
                    <td>${c.telefone || '-'}</td>
                    <td><span class="badge badge-${c.status === 'Ativo' ? 'success' : c.status === 'Inativo' ? 'danger' : 'info'}">${c.status || 'Ativo'}</span></td>
                    <td>${negocios}</td>
                    <td>
                        <button class="btn btn-xs btn-outline" onclick="ClientesModule.openForm('${c.id}')">✏️</button>
                        <button class="btn btn-xs btn-danger" onclick="ClientesModule.remove('${c.id}')">🗑️</button>
                        ${c.telefone ? WhatsApp.link(c.telefone, `Olá ${c.nome.split(' ')[0]}, tudo bem?`) : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    openForm(id = null) {
        const cliente = id ? DB.getClientes().find(c => c.id === id) : { nome: '', email: '', telefone: '', cpf: '', status: 'Ativo', notas: '' };
        const isEdit = !!id;

        Modal.open(isEdit ? 'Editar Cliente' : 'Novo Cliente', `
            <div class="input-group">
                <label>Nome Completo *</label>
                <input type="text" id="cli-nome" value="${cliente.nome}" required>
            </div>
            <div class="input-group">
                <label>E-mail</label>
                <input type="email" id="cli-email" value="${cliente.email || ''}">
            </div>
            <div class="input-group">
                <label>Telefone / WhatsApp</label>
                <input type="text" id="cli-telefone" value="${cliente.telefone || ''}" placeholder="(11) 99999-9999">
            </div>
            <div class="input-group">
                <label>CPF</label>
                <input type="text" id="cli-cpf" value="${cliente.cpf || ''}">
            </div>
            <div class="input-group">
                <label>Status</label>
                <select id="cli-status">
                    <option ${cliente.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                    <option ${cliente.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                    <option ${cliente.status === 'Prospect' ? 'selected' : ''}>Prospect</option>
                </select>
            </div>
            <div class="input-group">
                <label>Notas / Observações</label>
                <textarea id="cli-notas">${cliente.notas || ''}</textarea>
            </div>
        `, [
            { label: 'Cancelar', class: 'btn-outline', action: () => Modal.close() },
            { label: isEdit ? 'Salvar' : 'Criar Cliente', class: 'btn-primary', action: () => this.save(id) }
        ]);
    },

    save(id) {
        const nome = document.getElementById('cli-nome').value.trim();
        if (!nome) {
            App.toast('Nome é obrigatório!', 'error');
            return;
        }

        const dados = {
            nome,
            email: document.getElementById('cli-email').value.trim(),
            telefone: document.getElementById('cli-telefone').value.trim(),
            cpf: document.getElementById('cli-cpf').value.trim(),
            status: document.getElementById('cli-status').value,
            notas: document.getElementById('cli-notas').value.trim()
        };

        const clientes = DB.getClientes();

        if (id) {
            const idx = clientes.findIndex(c => c.id === id);
            clientes[idx] = { ...clientes[idx], ...dados, atualizadoEm: new Date().toISOString() };
            DB.logAtividade('cliente', `Cliente atualizado: ${nome}`);
        } else {
            dados.id = DB.uid();
            dados.criadoEm = new Date().toISOString();
            clientes.push(dados);
            DB.logAtividade('cliente', `Novo cliente: ${nome}`);
        }

        DB.setClientes(clientes);
        Modal.close();
        this.render();
        App.toast('Cliente salvo com sucesso!', 'success');
    },

    remove(id) {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        const clientes = DB.getClientes().filter(c => c.id !== id);
        DB.setClientes(clientes);
        this.render();
        App.toast('Cliente excluído', 'info');
        DB.logAtividade('cliente', 'Cliente excluído');
    }
};
