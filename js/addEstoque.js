// Carregar produtos no datalist para autocomplete
async function carregarPds() {
    const productInput = document.getElementById('product-input_addEstoque');
    const datalist = document.getElementById('product-list_addEstoque');
    const snapshot = await db.collection('products').get();
    datalist.innerHTML = ''; // Limpar o datalist antes de carregar novos itens

    snapshot.docs.forEach(doc => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = `${product.name} - ${product.supplier.brand}`;
        option.dataset.productId = doc.id; // Armazena o ID do produto no data attribute
        datalist.appendChild(option);
    });

    // Event listener para capturar o ID do produto selecionado
    productInput.addEventListener('input', () => {
        const selectedOption = Array.from(datalist.options).find(option => option.value === productInput.value);
        if (selectedOption) {
            productInput.dataset.selectedProductId = selectedOption.dataset.productId;
        } else {
            productInput.dataset.selectedProductId = ''; // Limpa o ID do produto se não houver correspondência
        }
    });
}

// Adicionar estoque
async function addStock() {
    const productId = document.getElementById('product-input_addEstoque').dataset.selectedProductId;
    const addQuantity = parseInt(document.getElementById('add-quantity_estoque').value);
    const user = _user; // Usuário vazio
    const date = new Date().toISOString();

    if (productId && addQuantity > 0) {
        const productDoc = await db.collection('products').doc(productId).get();
        const productData = productDoc.data();
        const previousStock = productData.quantity || 0;
        const newStock = previousStock + addQuantity;

        // Atualizar estoque do produto
        await db.collection('products').doc(productId).update({
            quantity: newStock
        });

        // Adicionar histórico de estoque
        await db.collection('stockHistory').add({
            productId: productId,
            productName: productData.name,
            addedQuantity: addQuantity,
            previousStock: previousStock,
            newStock: newStock,
            date: date,
            user: user
        }).then(() => {
            _modal('#mastermodal','Sucesso!',`Produto <b>ADICIONADO</b> com sucesso!`);
            updateLocalStorage();
        });

        loadStockHistory();
    }
    // Destruir a instância existente do DataTable, se existir
    if ($.fn.DataTable.isDataTable('#stock-history')) {
        $('#stock-history').DataTable().destroy();
    }
}

// Carregar histórico de estoque
async function loadStockHistory() {
    const tbody = document.getElementById('stock-history').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    const snapshot = await db.collection('stockHistory').orderBy('date', 'desc').get();
    snapshot.docs.forEach(doc => {
        const history = doc.data();
        const row = tbody.insertRow();
        row.insertCell(0).textContent = history.productName;
        row.insertCell(1).textContent = history.addedQuantity;
        row.insertCell(2).textContent = history.previousStock;
        row.insertCell(3).textContent = history.newStock;
        row.insertCell(4).textContent = new Date(history.date).toLocaleString();
        row.insertCell(5).textContent = history.user;
    });

    // Inicializar o DataTable
    $('#stock-history').DataTable({
        "pagingType": "full_numbers"
    });
}

// Executar o carregamento dos produtos e do histórico de estoque quando a página for carregada
if (localStorage.getItem('abaAtiva') === 'addestoque-tab') {
    document.addEventListener('DOMContentLoaded', () => {
        carregarPds();
        loadStockHistory();
    });
} else {
    console.log('COD ADDESTOQUE.JS DESATIVADO NESSA ABA');
}
