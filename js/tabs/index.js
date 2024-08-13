$(document).ready(function () {
    // Função para exibir a aba e o painel correspondentes
    function mostrarAbaEPanel(abaId, panelId) {
        $('md-primary-tab').removeClass('active').removeAttr('active');
        $('#' + abaId).addClass('active').attr('active', 'true');
        $('div[role="tabpanel"]').hide();
        $('#' + panelId).show();
    }

    // Verificar se há uma aba ativa salva no localStorage
    var abaAtiva = localStorage.getItem('abaAtiva');
    if (abaAtiva) {
        var panelAtivo = $('#' + abaAtiva).attr('aria-controls');
        mostrarAbaEPanel(abaAtiva, panelAtivo);
    } else {
        // Exibir o painel "Pedidos" por padrão
        $('#painel-panel').show();
        $('#painel-tab').addClass('active').attr('active', 'true');
    }

    $('md-primary-tab').on('click', function () {
        var abaId = $(this).attr('id');

        // Atualizar o localStorage com a aba ativa
        localStorage.setItem('abaAtiva', abaId);

        // Recarregar a página
        location.reload();
    });
});
