if (localStorage.getItem('abaAtiva') === 'vender-tab') {
    let selectedProducts = {};
    let totalSale = 0;

    // Função para buscar e armazenar produtos do Firestore no localStorage
    function fetchAndStoreProducts() {
        db.collection('products').get().then(snapshot => {
            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id; // Adicionar o ID do documento ao objeto de dados
                products.push(data);
            });
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('lastUpdate', new Date().toISOString());
            loadProducts();
        }).catch(error => {
            console.error("Erro ao buscar produtos do Firestore:", error);
        });
    }

    // Função para carregar produtos do localStorage
    function loadProducts() {
        // Obter produtos do localStorage e converter para um array
        const products = JSON.parse(localStorage.getItem('products') || '[]');

        // Ordenar produtos por nome em ordem alfabética
        products.sort((a, b) => a.name.localeCompare(b.name));

        // Selecionar o elemento select e limpar as opções anteriores
        const productSelect = document.getElementById('product-select');
        productSelect.innerHTML = '<md-select-option aria-label="blank"></md-select-option>';

        // Adicionar opções para produtos com quantidade > 0
        products.forEach(data => {
            if (data.quantity > 0) {
                const option = document.createElement('md-select-option');
                option.value = data.id;

                const optionContent = document.createElement('div');
                optionContent.slot = 'headline';
                optionContent.textContent = `${data.name} - ${data.supplier.brand}`;

                option.appendChild(optionContent);
                productSelect.appendChild(option);
            }
        });
    }


    // Função para verificar se os dados precisam ser atualizados
    function checkForUpdates() {
        const lastUpdate = new Date(localStorage.getItem('lastUpdate') || 0);
        const now = new Date();
        const thirtyMinutes = 8 * 60 * 60 * 1000;

        if (now - lastUpdate >= thirtyMinutes) {
            fetchAndStoreProducts();
        } else {
            loadProducts();
        }
    }

    // Função para atualizar os dados manualmente
    function manualUpdate() {
        fetchAndStoreProducts();
    }

    // Função para atualizar o preço quando o produto é selecionado
    function updatePrice() {
        const productId = $('#product-select').val();
        if (productId) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const product = products.find(p => p.id === productId);
            if (product) {
                $('#product-price').val(product.supplier.price.toFixed(2));
                $('#sale-price-venda').val(product.supplier.price_venda.toFixed(2));
                $('#estoque-quanty').val(product.quantity);
            }
        }
    }

    // Função para adicionar item à lista de vendas
    function addItem() {
        console.log("addItem chamado");
        const productId = $('#product-select').val();
        const quantity = parseInt($('#quantity_dades').val());
        const salePrice = parseFloat($('#sale-price-venda').val());
        console.log("ProductId:", productId, "Quantity:", quantity, "SalePrice:", salePrice);
        $("#cx-suspensa").show();
        $("#table-show-itens-adicionados").show();

        if (productId && quantity > 0 && salePrice) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const product = products.find(p => p.id === productId);

            if (product) {
                if (quantity <= product.quantity) {
                    const total = salePrice * quantity;
                    selectedProducts[productId] = {
                        name: product.name,
                        quantity: quantity,
                        price: salePrice,
                        total: total
                    };

                    // Atualiza a lista de itens vendidos
                    updateSalesTable();
                    updateTotalSale();
                } else {
                    _modal('#mastermodal', 'Status estoque', 'Quantidade solicitada <b>excede</b> o estoque disponível.');
                }
            } else {
                console.error("Produto não encontrado no localStorage");
            }
        } else {
            console.log("Dados inválidos para adicionar item");
        }
    }

    // Função para atualizar a tabela de itens vendidos
    function updateSalesTable() {
        console.log("Atualizando a tabela de vendas");
        const $tbody = $('#sales-table tbody');
        $tbody.empty();
        $.each(selectedProducts, (id, item) => {
            const $row = $('<tr>');
            $('<td>').text(item.name).appendTo($row);
            $('<td>').text(item.quantity).appendTo($row);
            $('<td>').text(item.price.toFixed(2)).appendTo($row);
            $('<td>').text(item.total.toFixed(2)).appendTo($row);
            const $removeBtn = $('<button>').text('Remover').addClass('remove-item-btn').data('id', id);
            $('<td>').append($removeBtn).appendTo($row);
            $tbody.append($row);
        });
    }

    // Função para remover um item da lista de vendas
    function removeItem(event) {
        const productId = $(event.target).data('id');
        delete selectedProducts[productId];
        updateSalesTable();
        updateTotalSale();
    }

    // Event listener para o botão de remover item
    $(document).on('click', '.remove-item-btn', removeItem);

    // Função para atualizar o total da venda
    function updateTotalSale() {
        console.log("Atualizando o total da venda");
        totalSale = Object.values(selectedProducts).reduce((sum, item) => sum + item.total, 0);
        $('#total-sale').text(totalSale.toFixed(2));
    }

    // Função para atualizar as opções de pagamento
    function updatePaymentOptions() {
        const paymentMethod = $('#payment-method').val();
        const $creditOptions = $('#credit-options');
        if (paymentMethod === 'card') {
            $creditOptions.show();
        } else {
            $creditOptions.hide();
        }
        calculateChange();
    }

    // Função para calcular parcelas
    function calculateInstallments() {
        const installments = parseInt($('#installments').val());
        const installmentValue = totalSale / installments;
        $('#installment-value').text(installmentValue.toFixed(2));
    }

    // Função para calcular o troco
    function calculateChange() {
        const paymentMethod = $('#payment-method').val();
        const amountReceived = parseFloat($('#amount-received').val()) || 0;
        let change = 0;

        if (paymentMethod === 'cash') {
            change = amountReceived - totalSale;
        } else {
            $('#amount-received').val(totalSale.toFixed(2));
            change = 0;
        }

        $('#change').text(change.toFixed(2));
        console.log("Troco calculado:", change); // Debug
    }

    // Função para finalizar a venda
    function completeSale() {
        const customerName = $('#customer-name').val();
        const paymentMethod = $('#payment-method').val();
        const installments = paymentMethod === 'card' ? parseInt($('#installments').val()) : 1;
        const amountReceived = parseFloat($('#amount-received').val()) || 0;

        console.log("Nome do Cliente:", customerName); // Debug
        console.log("Método de Pagamento:", paymentMethod); // Debug
        console.log("Parcelas:", installments); // Debug
        console.log("Total da Venda:", totalSale); // Debug
        console.log("Valor Recebido:", amountReceived); // Debug

        if (customerName && Object.keys(selectedProducts).length > 0 && amountReceived >= totalSale) {
            const saleData = {
                customerName: customerName,
                user: _user,
                products: selectedProducts,
                total: totalSale,
                paymentMethod: paymentMethod,
                installments: installments,
                amountReceived: amountReceived,
                date: new Date().toISOString()
            };

            db.collection('sales').add(saleData)
                .then(() => {
                    // Atualizar quantidade de produtos no estoque
                    updateProductQuantities();
                    _modal('#mastermodal', 'Parabéns!', `Venda <b>registrada</b> com sucesso!`);
                    $('#sale-form')[0].reset();
                    $('#sales-table tbody').empty();
                    $('#total-sale').text('0.00');
                    $('#amount-received').val('');
                    $('#change').text('0.00');
                    selectedProducts = {};
                    totalSale = 0;
                    fetchAndStoreProducts();
                    fetchAndStoreData();
                })
                .catch(error => {
                    _modal('#mastermodal', 'ERRO 200', `Erro ao registrar venda: , ${error}`);
                });
        } else {
            _modal('#mastermodal', 'Informações', `Por favor, preencha todos os campos e adicione itens à venda.`);
            console.log("Campos obrigatórios ausentes ou valor recebido insuficiente."); // Debug
        }
    }

    // Função para atualizar quantidade de produtos no estoque
    function updateProductQuantities() {
        $.each(selectedProducts, (id, item) => {
            db.collection('products').doc(id).update({
                quantity: firebase.firestore.FieldValue.increment(-item.quantity)
            }).catch(error => {
                _modal('#mastermodal', 'ERRO 200', `Erro ao atualizar quantidade de produto: , ${error}`);
            });
        });
    }

    // Carregar produtos ao iniciar a página
    $(document).ready(() => {
        checkForUpdates();
        // Event listeners
        $('#product-select').change(updatePrice);
        $('#add-item').click(addItem);
        $('#payment-method').change(updatePaymentOptions);
        $('#installments').change(calculateInstallments);
        $('#amount-received').keyup(calculateChange);
        $('#complete-sale-btn').click(completeSale);
        $('#manual-update-btn').click(manualUpdate);
    });
}
