/* ============================================================
   crm.js — Pipeline Kanban com Drag & Drop
   ============================================================ */

const CRMModule = {
    draggedCard: null,

    init() {
        this.render();
        document.getElementById('btn-novo-negocio').addEventListener('click', () => this.openForm());
    },

    render() {
        const board = document.getElementById('kanban-board');
        const stages = DB.getPipelineStages();
        const negocios = DB.getNegocios();
        const clientes = DB.getClientes();

        board.innerHTML = stages.map(stage => {
            const cards = negocios.filter(n => n.stage === stage);
            return `
                <div class="kanban-coluna" data-stage="${stage}">
                    <div class="kanban-coluna-header">
                        <h3>${stage}</h3>
                        <span class="kanban-coluna-count">${cards.length}</span>
                    </div>
                    <div class="kanban-cards" data-dropzone="${stage}">
                        ${cards.map(n => {
                            const cliente = clientes.find(c => c.id === n.clienteId);
                            return `
                                <div class="kanban-card" draggable="true" data-id="${n.id}">
                                    <div class="kanban-card-title">${n.titulo}</div>
                                    <div class="kanban-card-cliente">${cliente ? cliente.nome : 'Sem cliente'}</div>
                                    <div class="kanban-card-footer">
                                        <span>${n.servico || ''}</span>
                                        <span class="kanban-card-valor">${n.valor ? 'R$ ' + Number(n.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : ''}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        this.bindDragDrop();
        this.bindCardClick();
    },

    bindDragDrop() {
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                document.querySelectorAll('.kanban-coluna').forEach(c => c.classList.remove('highlight'));
            });
        });

        document.querySelectorAll('.kanban-cards').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.closest('.kanban-coluna').classList.add('highlight');
            });
            zone.addEventListener('dragleave', () => {
                zone.closest('.kanban-coluna').classList.remove('highlight');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const newStage = zone.dataset.dropzone;
                const negocioId = this.draggedCard.dataset.id;
                this.moveNegocio(negocioId, newStage);
                zone.closest('.kanban-coluna').classList.remove('highlight');
            });
        });
    },

    bindCardClick() {
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dblclick', () => this.openForm(card.dataset.id));
        });
    },

    moveNegocio(id, newStage) {
        const negocios = DB.getNegocios();
        const idx = negocios.findIndex(n => n.id === id);
        if (idx === -1) return;

        negocios[idx].stage = newStage;
        negocios[idx].atualizadoEm = new Date().toISOString();
        DB.setNegocios(negocios);

        DB.logAtividade('pipeline', `Negócio "${negocios[idx].titulo}" movido para "${newStage}"`);
        this.render();
        DashboardModule.refresh();
    },

    openForm(id = null) {
        const negocio = id ? DB.getNegocios().find(n => n.id === id) : {
            titulo: '', clienteId: '', servico: '', valor: '', stage: DB.getPipelineStages()[0] || 'Lead',
            descricao: '', probabilidade: 50
        };
        const clientes = DB.getClientes();
        const servicos = DB.getServicos();
        const stages = DB.getPipelineStages();

        Modal.open(id ? 'Editar Negócio' : 'Novo Negócio', `
            <div class="input-group">
                <label>Título / Descrição *</label>
                <input type="text" id="neg-titulo" value="${negocio.titulo}" placeholder="Ex: Viagem para Paris - Família Silva">
            </div>
            <div class="input-group">
                <label>Cliente</label>
                <select id="neg-cliente">
                    <option value="">-- Selecione --</option>
                    ${clientes.map(c => `<option value="${c.id}" ${c.id === negocio.clienteId ? 'selected' : ''}>${c.nome}</option>`).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Serviço</label>
                <select id="neg-servico">
                    <option value="">-- Selecione --</option>
                    ${servicos.map(s => `<option ${s === negocio.servico ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Valor Estimado (R$)</label>
                <input type="number" id="neg-valor" value="${negocio.valor || ''}" step="0.01" min="0">
            </div>
            <div class="input-group">
                <label>Etapa</label>
                <select id="neg-stage">
                    ${stages.map(s => `<option ${s === negocio.stage ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Probabilidade (%)</label>
                <input type="number" id="neg-prob" value="${negocio.probabilidade || 50}" min="0" max="100">
            </div>
            <div class="input-group">
                <label>Observações</label>
                <textarea id="neg-desc">${negocio.descricao || ''}</textarea>
            </div>
        `, [
            { label: 'Cancelar', class: 'btn-outline', action: () => Modal.close() },
            { label: id ? 'Salvar' : 'Criar', class: 'btn-primary', action: () => this.save(id) }
        ]);
    },

    save(id) {
        const titulo = document.getElementById('neg-titulo').value.trim();
        if (!titulo) { App.toast('Título é obrigatório!', 'error'); return; }

        const dados = {
            titulo,
            clienteId: document.getElementById('neg-cliente').value,
            servico: document.getElementById('neg-servico').value,
            valor: parseFloat(document.getElementById('neg-valor').value) || 0,
            stage: document.getElementById('neg-stage').value,
            probabilidade: parseInt(document.getElementById('neg-prob').value) || 50,
            descricao: document.getElementById('neg-desc').value.trim()
        };

        const negocios = DB.getNegocios();

        if (id) {
            const idx = negocios.findIndex(n => n.id === id);
            negocios[idx] = { ...negocios[idx], ...dados, atualizadoEm: new Date().toISOString() };
            DB.logAtividade('pipeline', `Negócio atualizado: ${titulo}`);
        } else {
            dados.id = DB.uid();
            dados.criadoEm = new Date().toISOString();
            negocios.push(dados);
            DB.logAtividade('pipeline', `Novo negócio: ${titulo}`);
        }

        DB.setNegocios(negocios);
        Modal.close();
        this.render();
        DashboardModule.refresh();
        App.toast('Negócio salvo!', 'success');
    }
};
