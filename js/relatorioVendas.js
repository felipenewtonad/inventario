if (localStorage.getItem('abaAtiva') === 'vendas-tab' || localStorage.getItem('abaAtiva') === 'vender-tab') {
    const SALES_KEY = 'sales';
    const PRODUCTS_KEY = 'products';
    const LAST_UPDATE_KEY = 'lastUpdate_relatoriosVendas';
    const UPDATE_INTERVAL = 8 * 60 * 60 * 1000; //8 horas

    // Função para carregar dados do Firestore e atualizar o localStorage
    function fetchAndStoreData() {
        db.collection(SALES_KEY).get().then(salesSnapshot => {
            const salesData = salesSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    products: data.products || {}  // Garante que 'products' esteja sempre definido
                };
            });

            localStorage.setItem(SALES_KEY, JSON.stringify(salesData));
            localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());

            displaySales(salesData, JSON.parse(localStorage.getItem(PRODUCTS_KEY))); // Atualizar a exibição com os dados carregados
        }).then(() => {
            _modal('#mastermodal', 'Sucesso!', 'Base de dados atualizada! em <b>3 segundos</b> vou recarregar.');
            setTimeout(atualizar, 3000);
        }).catch(error => {
            console.error('Erro ao carregar dados do Firestore:', error);
        });
    }

    // Função para carregar dados do localStorage
    function loadFromLocalStorage() {
        const salesData = localStorage.getItem(SALES_KEY);
        const productsArray = localStorage.getItem(PRODUCTS_KEY);
        const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);

        if (salesData && productsArray && lastUpdate) {
            const parsedSalesData = JSON.parse(salesData);
            const productsArrayData = JSON.parse(productsArray);
            const currentTime = Date.now();
            const timeSinceLastUpdate = currentTime - parseInt(lastUpdate);

            if (timeSinceLastUpdate < UPDATE_INTERVAL) {
                // Transformar o array de produtos em um objeto para fácil acesso
                const productData = productsArrayData.reduce((acc, product) => {
                    acc[product.id] = product;
                    return acc;
                }, {});

                displaySales(parsedSalesData, productData); // Atualizar a exibição com os dados do localStorage
                return;
            }
        }

        // Se não houver dados no localStorage ou o tempo de atualização passou, carregar do Firestore
        fetchAndStoreData();
    }

    // Função para atualizar os dados manualmente
    document.getElementById('refresh-button').addEventListener('click', () => {
        fetchAndStoreData();
    });

    // Função para limitar caracteres
    function limitChars(text, maxChars) {
        return text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
    }

    // Função para exibir dados de vendas
    function displaySales(data, productData) {
        const tbody = document.getElementById('sales-report_vendas').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        let grandTotal = 0;
        let grandProfit = 0;

        for (const sale of data) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = limitChars(sale.id, 4);
            row.insertCell(1).textContent = sale.customerName;

            const productList = document.createElement('ul');
            let profit = 0;
            for (const [id, product] of Object.entries(sale.products)) {
                const productInfo = productData[id] || {};
                const productItem = document.createElement('li');
                productItem.innerHTML = `${product.name} - ${productInfo.supplier ? productInfo.supplier.brand : 'Desconhecido'} (<b>x${product.quantity}</b>) - <b>R$</b>${product.price.toFixed(2)}`;
                productList.appendChild(productItem);
                if (productInfo.supplier) {
                    profit += (product.price - productInfo.supplier.price) * product.quantity;
                }
            }
            row.insertCell(2).appendChild(productList);
            row.insertCell(3).textContent = profit.toFixed(2);
            row.insertCell(4).textContent = new Date(sale.date).toLocaleDateString('pt-BR');
            row.insertCell(5).textContent = sale.total.toFixed(2);

            const amountReceived = sale.amountReceived || 0;
            const change = (amountReceived - sale.total).toFixed(2);
            row.insertCell(6).textContent = amountReceived.toFixed(2);
            row.insertCell(7).textContent = change;
            row.insertCell(8).textContent = sale.paymentMethod || 'N/A';

            grandTotal += sale.total;
            grandProfit += profit;

            row.insertCell(9).innerHTML = `<md-filled-tonal-button onclick="openModal('${sale.id}');">Detalhes</md-filled-tonal-button>`;
        }

        // Inicializar DataTable
        $('#sales-report_vendas').DataTable({
            "pagingType": "full_numbers",
            "destroy": true // Para reinicializar a tabela
        });

        document.getElementById('grand-total_vendas').textContent = grandTotal.toFixed(2);
        document.getElementById('grand-profit_vendas').textContent = grandProfit.toFixed(2);
    }

    // Função para aplicar filtro de tempo
    function filterSales() {
        const filterValue = document.getElementById('time-filter_vendas').value;
        let filteredSales = salesData;

        if (filterValue !== 'all') {
            const days = parseInt(filterValue);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            filteredSales = salesData.filter(sale => new Date(sale.date) >= cutoffDate);
        }

        displaySales(filteredSales, productData);
    }
    function openModal(saleId) {
        // Recuperar dados do localStorage
        const salesData = JSON.parse(localStorage.getItem(SALES_KEY)) || [];
        const productsArray = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
        // Transformar o array de produtos em um objeto para fácil acesso
        const productData = productsArray.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {});
        // Encontrar a venda com o ID fornecido
        const sale = salesData.find(s => s.id === saleId);
        if (!sale) {
            console.error('Venda não encontrada.');
            return;
        }
        // Montar o título e o corpo do modal
        const modalTitle = `Detalhes ${saleId}`;
        const modalBody = `
            <p><strong>Nome do Cliente:</strong> ${sale.customerName || 'N/A'}</p>
            <p><strong>Data:</strong> ${sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : 'N/A'}</p>
            <p><strong>Total:</strong> R$${sale.total ? sale.total.toFixed(2) : 'N/A'}</p>
            <p><strong>Produtos:</strong></p>
            <ul>
                ${Object.entries(sale.products).map(([id, product]) => {
            const productInfo = productData[id] || { supplier: {} };
            return `
                        <li>${product.name || 'N/A'} ${productInfo.supplier.brand} (<b>x${product.quantity || 0}</b>) - R$${product.price ? product.price.toFixed(2) : 'N/A'}</li>
                    `;
        }).join('')}
            </ul>
            <p><strong>Lucro:</strong> R$${Object.entries(sale.products).reduce((acc, [id, product]) => {
            const productInfo = productData[id] || { supplier: {} };
            if (productInfo.supplier && productInfo.supplier.price) {
                return acc + (product.price - productInfo.supplier.price) * product.quantity;
            }
            return acc;
        }, 0).toFixed(2)}</p>
            <p><strong>Valor Recebido:</strong> R$${sale.amountReceived ? sale.amountReceived.toFixed(2) : 'N/A'}</p>
            <p><strong>Troco:</strong> R$${sale.amountReceived ? (sale.amountReceived - sale.total).toFixed(2) : 'N/A'}</p>
            <p><strong>Forma de Pagamento:</strong> ${sale.paymentMethod || 'N/A'}</p>
        `;
        _modal('#mastermodal', modalTitle, modalBody);
    }
    // Carregar dados do localStorage ao iniciar a página
    document.addEventListener('DOMContentLoaded', loadFromLocalStorage);
    // Aplicar filtro de vendas ao mudar o filtro de tempo
    document.getElementById('time-filter_vendas').addEventListener('change', filterSales);
    // Atualizar 8 horas
    setInterval(fetchAndStoreData, UPDATE_INTERVAL);
} else {
    console.log('COD RELATORIO VENDAS DESATIVO NESSA ABA');
}
