// Função para converter a imagem em Base64 e armazená-la no localStorage
function _noImagem(url,key) {
    fetch(url).then(response => response.blob()).then(blob => {
        const reader = new FileReader();
        reader.onloadend = function () {
            localStorage.setItem(key, reader.result);
        };
        reader.readAsDataURL(blob); // Convertendo o Blob para Base64
    }).catch(error => {
        console.error('Erro ao carregar a imagem:', error);
    });
}