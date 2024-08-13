//Fechamento de modal geral
function fecharmodal(i,a) {
    document.querySelector(`${i}`).removeAttribute('open', '');
    $(`${a}`).show();
}
//Gerador de modal com parametros
function _modal(modalId, headline, content, _largura) {
    const modal = document.querySelector(modalId);
    if (modal) {
        // Definir o título do modal
        const tituloElement = modal.querySelector('[slot="headline"]');
        if (tituloElement) {
            tituloElement.textContent = headline;
        }

        // Definir o conteúdo do modal
        const corpoElement = modal.querySelector('[slot="content"]');
        if (corpoElement) {
            corpoElement.innerHTML = content;
        }

        // Definir o conteúdo do modal
        document.querySelector(modalId).setAttribute('style', _largura || '')
        // Abrir o modal
        modal.setAttribute('open', '');
    }
}
//Abrir modal geral
function abrirModal(i) {
    document.querySelector(`${i}`).setAttribute('open', '');
}
function atualizar(){
    location.reload(); 
}