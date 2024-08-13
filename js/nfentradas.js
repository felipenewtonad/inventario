let products = {}; // Objeto para armazenar os produtos carregados
let addedProducts = []; // Array para armazenar os produtos adicionados à nota fiscal
if (localStorage.getItem('abaAtiva') === 'nf-tab') {
    // Função para carregar produtos do banco de dados
    function _loadProducts() {
        db.collection('products').get().then(snapshot => {
            const productSelect = document.getElementById('_product-select');
            productSelect.innerHTML = '<md-select-option aria-label="blank"></md-select-option>'; // Limpar opções anteriores

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.quantity >= 0) {
                    products[doc.id] = data; // Armazenar produtos no objeto
                    const option = document.createElement('md-select-option');
                    option.value = doc.id;
                    option.textContent = `${data.name} - ${data.supplier.brand}`;
                    productSelect.appendChild(option);
                }
            });
        }).catch(error => {
            console.error('Erro ao carregar produtos:', error);
        });
    }

    function _addProduct() {
        const productId = document.getElementById('_product-select').value;
        const quantity = parseInt(document.getElementById('_product-quantity').value);
        const price = parseFloat(document.getElementById('_product-price').value);
        if (productId && quantity >= 0 && price) {
            const data = products[productId];
            if (data) {
                const total = quantity * price;
                addedProducts.push({
                    productId: productId,
                    quantity: quantity,
                    price: price,
                    total: total
                });

                // Atualiza a tabela com o produto adicionado
                _updateProductsTable();
                // Atualiza o total geral em tempo real
                _updateTotalInvoice();

                // Limpar campos após adicionar o produto
                document.getElementById('_product-select').value = '';
                document.getElementById('_product-quantity').value = '';
                document.getElementById('_product-price').value = '';
            } else {
                alert('Produto não encontrado.');
            }
        } else {
            alert('Preencha todos os campos corretamente.');
        }
        document.querySelector("#_snota").removeAttribute('style', '');
    }

    function _updateProductsTable() {
        const $tbody = $('#_products-table tbody');
        $tbody.empty();
        let totalInvoice = 0;

        addedProducts.forEach(product => {
            const data = products[product.productId];
            const $row = $('<tr>');
            $('<td>').text(data.name).appendTo($row);
            $('<td>').text(product.quantity).appendTo($row);
            $('<td>').text(product.price.toFixed(2)).appendTo($row);
            $('<td>').text(product.total.toFixed(2)).appendTo($row);
            $tbody.append($row);
            totalInvoice += product.total;
        });

        // Atualizar o total da nota fiscal na tabela, se necessário
    }

    function _saveInvoice() {
        const nfNumber = document.getElementById('nf-number').value;
        const razaoSocial = document.getElementById('razao-social').value;
        const nfDate = document.getElementById('nf-date').value;
        const systemDate = document.getElementById('system-date').value;

        if (nfNumber && razaoSocial && nfDate && addedProducts.length > 0) {
            const invoiceData = {
                nfNumber: nfNumber,
                razaoSocial: razaoSocial,
                nfDate: nfDate,
                systemDate: systemDate,
                user: _user,
                products: addedProducts,
                user: _user
            };

            // Salvar nota fiscal na coleção 'purchases'
            db.collection('purchases').add(invoiceData)
                .then(docRef => {
                    console.log('Nota Fiscal salva com ID:', docRef.id);

                    // Atualizar a quantidade dos produtos no estoque
                    _updateProductQuantities();
                    // Limpar o formulário e a tabela
                    document.getElementById('entrada-form').reset();
                    $('#_products-table tbody').empty();
                    addedProducts = [];
                    document.getElementById('system-date').value = new Date().toISOString().split('T')[0];
                }).then(() => {
                    _modal('#mastermodal', 'Parabens sucesso!', `Compra <b>finalizada</b> com sucesso, vamos atualizar em <b>3 segundos</b>.`);
                    setTimeout(atualizar, 3000);
                }).catch(error => {
                    console.error('Erro ao salvar a nota fiscal:', error);
                });
        } else {
            alert('Preencha todos os campos da nota fiscal e adicione produtos.');
        }
    }

    function _updateProductQuantities() {
        addedProducts.forEach(product => {
            db.collection('products').doc(product.productId).update({
                quantity: firebase.firestore.FieldValue.increment(+product.quantity)
            }).catch(error => {
                console.error('Erro ao atualizar a quantidade do produto:', error);
            });
        });
    }
    function _updateTotalInvoice() {
        let totalInvoice = addedProducts.reduce((sum, product) => sum + product.total, 0);
        document.getElementById('_total-invoice').textContent = totalInvoice.toFixed(2);
        document.getElementById('_total-invoice-modal').innerHTML = `${totalInvoice.toFixed(2)} <md-icon slot="icon">attach_money</md-icon>`;
    }
    // Inicializar a data do sistema e carregar produtos
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('system-date').value = new Date().toISOString().split('T')[0];
        _loadProducts();
    });

    // Atualizar o preço quando o produto é selecionado
    document.getElementById('_product-select').addEventListener('change', function () {
        const productId = this.value;
        const data = products[productId];
        if (data) {
            document.getElementById('_product-price').value = data.supplier.price ? data.supplier.price.toFixed(2) : '';
            document.querySelector("#estoqueatual").value = data.quantity;
        }
    });
} else {
    console.log('COD NFENTRADAS.JS DESATIVADO NESSA ABAf');
}