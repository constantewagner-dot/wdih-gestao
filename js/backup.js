/* ============================================================
   backup.js — Backup, Exportação e Importação
   ============================================================ */

const BackupModule = {
    init() {
        document.getElementById('btn-backup').addEventListener('click', () => this.exportJSON());
        document.getElementById('btn-export-json').addEventListener('click', () => this.exportJSON());
        document.getElementById('btn-export-csv').addEventListener('click', () => this.exportCSV());
        document.getElementById('btn-import-backup').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importJSON(e));
        document.getElementById('btn-reset-data').addEventListener('click', () => this.resetData());
    },

    exportJSON() {
        const data = {
            versao: '1.0',
            exportadoEm: new Date().toISOString(),
            agencia: DB.getAgencia(),
            clientes: DB.getClientes(),
            negocios: DB.getNegocios(),
            viagens: DB.getViagens(),
            transacoes: DB.getTransacoes(),
            servicos: DB.getServicos(),
            pipelineStages: DB.getPipelineStages(),
            companhias: DB.getCompanhias(),
            programas: DB.getProgramas(),
            cartoes: DB.getCartoes(),
            atividades: DB.getAtividades()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wdih-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        App.toast('Backup exportado com sucesso!', 'success');
        DB.logAtividade('backup', 'Backup JSON exportado');
    },

    exportCSV() {
        const clientes = DB.getClientes();
        const negocios = DB.getNegocios();
        const transacoes = DB.getTransacoes();

        const toCSV = (data, headers) => {
            if (!data.length) return '';
            const rows = data.map(row =>
                headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(';')
            );
            return [headers.join(';'), ...rows].join('\n');
        };

        const download = (content, filename) => {
            const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        download(toCSV(clientes, ['nome', 'email', 'telefone', 'cpf', 'status', 'criadoEm']), 'clientes.csv');
        setTimeout(() => download(toCSV(negocios, ['titulo', 'clienteId', 'valor', 'stage', 'criadoEm']), 'negocios.csv'), 500);
        setTimeout(() => download(toCSV(transacoes, ['descricao', 'tipo', 'categoria', 'valor', 'data']), 'transacoes.csv'), 1000);

        App.toast('CSVs exportados!', 'success');
        DB.logAtividade('backup', 'CSVs exportados');
    },

    importJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!confirm('Isso irá substituir TODOS os dados atuais. Deseja continuar?')) return;

                if (data.clientes) DB.setClientes(data.clientes);
                if (data.negocios) DB.setNegocios(data.negocios);
                if (data.viagens) DB.setViagens(data.viagens);
                if (data.transacoes) DB.setTransacoes(data.transacoes);
                if (data.servicos) DB.setServicos(data.servicos);
                if (data.pipelineStages) DB.setPipelineStages(data.pipelineStages);
                if (data.companhias) DB.setCompanhias(data.companhias);
                if (data.programas) DB.setProgramas(data.programas);
                if (data.cartoes) DB.setCartoes(data.cartoes);
                if (data.agencia) DB.setAgencia(data.agencia);

                DB.logAtividade('backup', 'Backup importado');
                App.toast('Backup restaurado com sucesso!', 'success');

                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                App.toast('Arquivo inválido!', 'error');
                console.error(err);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    },

    resetData() {
        if (!confirm('⚠️ ATENÇÃO: Isso apagará TODOS os dados permanentemente! Deseja continuar?')) return;
        if (!confirm('Tem CERTEZA ABSOLUTA? Esta ação é irreversível!')) return;

        DB.clearAll();
        sessionStorage.removeItem('wdih_session');
        App.toast('Dados resetados. Recarregando...', 'info');
        setTimeout(() => window.location.reload(), 1500);
    }
};
