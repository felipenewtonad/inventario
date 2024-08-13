$(document).ready(function () {
    // Exibir o painel "Pedidos" por padrão
    $('#painel-panel').show();
    $('#painel-tab').addClass('active');

    $('md-primary-tab').on('click', function () {
        $('md-primary-tab').removeClass('active');
        $(this).addClass('active');

        // Esconder todos os painéis
        $('div[role="tabpanel"]').hide();

        // Exibir o painel correspondente à aba clicada
        var panelId = $(this).attr('aria-controls');
        $('#' + panelId).show();
    });
});