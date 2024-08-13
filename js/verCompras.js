let productsMap = {}; // Objeto para armazenar o mapeamento de produtos
if(localStorage.getItem('abaAtiva')==='nf-tab'){
// Função para carregar produtos do banco de dados e mapear IDs para nomes
function _loadProductsMap() {
    return db.collection('products').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            productsMap[doc.id] = data.name; // Armazenar o nome do produto pelo ID
        });
    }).catch(error => {
        console.error('Erro ao carregar produtos:', error);
    });
}

// Função para carregar notas fiscais do banco de dados
function _loadInvoices() {
    db.collection('purchases').get().then(snapshot => {
        const $tbody = $('#_invoices-table tbody');
        $tbody.empty();
        snapshot.forEach(doc => {
            const data = doc.data();
            const nfNumber = data.nfNumber;
            const nfDate = data.nfDate;
            const systemDate = data.systemDate;
            const products = data.products;
            const companyName = data.razaoSocial; // Nome da razão social

            // Criação da lista de produtos formatada
            let productList = '';
            let totalInvoice = 0;
            products.forEach(product => {
                const productName = productsMap[product.productId] || 'Produto desconhecido';
                const totalProduct = product.quantity * product.price;
                totalInvoice += totalProduct;
                productList += `<li>${productName}: (R$:${product.price.toFixed(2)}<b>x${product.quantity}</b> R$:<b>${totalProduct.toFixed(2)}</b>)</li>`;
            });

            // Criação da linha da tabela
            const $row = $('<tr>');
            $('<td>').text(nfNumber).appendTo($row);
            $('<td>').html(`<ol>${productList}</ol>`).appendTo($row);
            $('<td>').text(nfDate).appendTo($row);
            $('<td>').text(systemDate).appendTo($row);
            $('<td>').text(totalInvoice.toFixed(2)).appendTo($row);

            // Adiciona o botão de detalhes
            const $detailsBtn = $('<md-filled-button>').text('Detalhes').addClass('details-btn').data('id', doc.id);
            $('<td>').append($detailsBtn).appendTo($row);

            $tbody.append($row);
        });
        // Inicializar o DataTable
        $('#_invoices-table').DataTable({
            "pagingType": "full_numbers"
        });
    }).catch(error => {
        console.error('Erro ao carregar notas fiscais:', error);
    });
}

// Função para exibir detalhes da nota fiscal
function _showDetails(invoiceId) {
    db.collection('purchases').doc(invoiceId).get().then(doc => {
        const data = doc.data();
        const nfNumber = data.nfNumber;
        const companyName = data.razaoSocial; // Nome da razão social
        const nfDate = data.nfDate;
        const systemDate = data.systemDate;
        const products = data.products;

        // Criação da lista de produtos formatada
        let productList = '';
        let totalInvoice = 0;
        products.forEach(product => {
            const productName = productsMap[product.productId] || 'Produto desconhecido';
            const totalProduct = product.quantity * product.price;
            totalInvoice += totalProduct;
            productList += `${productName}: ${product.quantity} x ${product.price.toFixed(2)} = ${totalProduct.toFixed(2)}<br>`;
        });

        // Criação do conteúdo do modal
        const modalContent = `
            <p><strong>Número da NF:</strong> ${nfNumber}</p>
            <p><strong>Nome da Razão Social:</strong> ${companyName}</p>
            <p><strong>Data da Nota:</strong> ${nfDate}</p>
            <p><strong>Data do Sistema:</strong> ${systemDate}</p>
            <p><strong>Lista de Produtos:</strong><br>${productList}</p>
            <p><strong>Total Geral:</strong> R$${totalInvoice.toFixed(2)}</p>
        `;

        _modal('#mastermodal', 'Detalhes da NF', modalContent);
    }).catch(error => {
        console.error('Erro ao carregar detalhes da nota fiscal:', error);
    });
}

// Inicializa a visualização de notas fiscais
document.addEventListener('DOMContentLoaded', function () {
    _loadProductsMap().then(() => {
        _loadInvoices();
    });
});

// Event listener para o botão de detalhes
$(document).on('click', '.details-btn', function () {
    const invoiceId = $(this).data('id');
    _showDetails(invoiceId);
});
}else{
    console.log('COD DE VERCOMPRAS.JS DESATIVADO NESSA ABA');
}