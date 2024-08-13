let _dadosDeVendas = [];
let _pdDados = {};

// Função para carregar dados de produtos
async function _cProdutos() {
    try {
        const snapshot = await db.collection('products').get();
        _pdDados = snapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
        }, {});
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Função para carregar dados de vendas
async function _cVendas() {
    try {
        await _cProdutos(); // Certifique-se de que os produtos estejam carregados
        const snapshot = await db.collection('sales').get();
        _dadosDeVendas = snapshot.docs.map(doc => ({
            id: doc.id, // Adiciona a chave (ID) ao objeto de venda
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
    }
}

// Função para calcular lucro
function calculateProfit(products) {
    return Object.entries(products).reduce((acc, [id, product]) => {
        const productInfo = _pdDados[id];
        if (productInfo && productInfo.supplier && productInfo.supplier.price && product.price && product.quantity) {
            return acc + (product.price - productInfo.supplier.price) * product.quantity;
        }
        return acc;
    }, 0);
}

// Função para calcular lucro por período
function calculateProfitByPeriod(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filteredSales = _dadosDeVendas.filter(sale => new Date(sale.date) >= cutoffDate);
    return filteredSales.reduce((acc, sale) => acc + calculateProfit(sale.products), 0);
}

// Função para calcular o crescimento percentual
function calculateGrowthPercentage(currentPeriodProfit, previousPeriodProfit) {
    if (previousPeriodProfit === 0) {
        return currentPeriodProfit > 0 ? 100 : 0; // Se o período anterior não teve vendas, crescimento é 100% se houver vendas
    }
    return ((currentPeriodProfit - previousPeriodProfit) / previousPeriodProfit) * 100;
}

// Função para exibir lucros em diferentes intervalos de tempo
async function displayProfitByPeriod() {
    try {
        await _cVendas();
        if (userSettings && userSettings.profitIntervals) {
            userSettings.profitIntervals.forEach(async (days, index) => {
                const currentProfit = calculateProfitByPeriod(days);
                const previousDays = days + 30; // Ajustar para o período anterior, se necessário
                const previousProfit = calculateProfitByPeriod(previousDays);
                const growthPercentage = calculateGrowthPercentage(currentProfit, previousProfit);
                const intervalElement = document.querySelector(`#np_${index}`);
                const profitElement = document.getElementById(`profit-${index}-days`);
                const growthElement = document.getElementById(`growth-${index}-days`);
                
                if (intervalElement && profitElement && growthElement) {
                    intervalElement.textContent = days;
                    profitElement.textContent = `R$${currentProfit.toFixed(2)}`;
                    growthElement.textContent = `Crescimento: ${growthPercentage.toFixed(2)}%`;

                    // Adiciona a cor conforme o valor do crescimento
                    if (growthPercentage > 0) {
                        growthElement.style.color = 'green'; // Verde para crescimento positivo
                    } else if (growthPercentage < 0) {
                        growthElement.style.color = 'red'; // Vermelho para crescimento negativo
                    } else {
                        growthElement.style.color = 'blue'; // Azul para crescimento zero
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao calcular lucros por período:', error);
    }
}

// Função para listar os itens mais vendidos
async function listTopProducts() {
    try {
        await _cVendas();
        const productSales = {};

        _dadosDeVendas.forEach(sale => {
            for (const [id, product] of Object.entries(sale.products)) {
                if (!productSales[id]) {
                    productSales[id] = {
                        name: product.name,
                        totalSales: 0,
                        lastSaleDate: new Date(0),
                        lastQuantity: 0
                    };
                }
                productSales[id].totalSales += product.quantity;
                const saleDate = new Date(sale.date);
                if (saleDate > productSales[id].lastSaleDate) {
                    productSales[id].lastSaleDate = saleDate;
                    productSales[id].lastQuantity = product.quantity;
                }
            }
        });

        const topProducts = Object.values(productSales).sort((a, b) => b.totalSales - a.totalSales).slice(0, userSettings.top10Limit);
        displayTopProducts(topProducts);
    } catch (error) {
        console.error('Erro ao listar produtos mais vendidos:', error);
    }
}

// Função para exibir os produtos mais vendidos
function displayTopProducts(products) {
    const container = document.getElementById('top-products-container');
    if (container) {
        container.innerHTML = ''; // Limpar conteúdo existente
        const productList = document.createElement('md-list');
        products.forEach(product => {
            const productItem = document.createElement('md-list-item');
            productItem.setAttribute('type', 'button');
            productItem.innerHTML = `
                <div slot="headline">${product.name}</div>
                <div slot="supporting-text">Última venda: ${product.lastSaleDate.toLocaleDateString('pt-BR')}, vendeu ${product.lastQuantity} ${product.lastQuantity > 1 ? 'unidades' : 'unidade'}</div>
                <div slot="trailing-supporting-text">Total de vendas: ${product.totalSales}</div>
            `;
            productList.appendChild(productItem);
        });
        container.appendChild(productList);
    }
}

// Função para calcular as vendas dos últimos meses configurados
async function calculateSalesGrowth() {
    try {
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - userSettings.salesGrowthInterval);
        const salesSnapshot = await db.collection('sales').get();
        const monthlySales = {};
        const previousMonthlySales = {};

        salesSnapshot.forEach(doc => {
            const sale = doc.data();
            const saleDate = new Date(sale.date);
            if (saleDate >= startDate) {
                const monthYear = `${saleDate.getMonth() + 1}/${saleDate.getFullYear()}`;
                if (!monthlySales[monthYear]) {
                    monthlySales[monthYear] = 0;
                }
                if (!previousMonthlySales[monthYear]) {
                    previousMonthlySales[monthYear] = 0;
                }

                if (typeof sale.products === 'object' && sale.products !== null) {
                    Object.values(sale.products).forEach(product => {
                        monthlySales[monthYear] += product.quantity;
                    });
                }
            }
        });

        const labels = Object.keys(monthlySales).sort();
        const data = labels.map(label => monthlySales[label]);
        const previousData = labels.map(label => previousMonthlySales[label] || 0);
        const growthPercentages = data.map((current, i) => calculateGrowthPercentage(current, previousData[i] || 0));

        displaySalesGrowthChart(labels, data, growthPercentages);
    } catch (error) {
        console.error('Erro ao calcular o crescimento das vendas:', error);
    }
}

// Função para exibir o gráfico de crescimento das vendas
function displaySalesGrowthChart(labels, data, growthPercentages) {
    const ctx = document.getElementById('salesGrowthChart');
    if (ctx) {
        const chartCtx = ctx.getContext('2d');
        new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Vendas nos últimos ${userSettings.salesGrowthInterval} meses`,
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function (context) {
                                const index = context.dataIndex;
                                const growth = growthPercentages[index] || 0;
                                return `Crescimento: ${growth.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Inicializar funções quando a aba estiver ativa
if (localStorage.getItem('abaAtiva') === 'painel-tab') {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadUserSettings(); // Carregar configurações do usuário
        await displayProfitByPeriod();
        await listTopProducts();
        await calculateSalesGrowth();
    });
} else {
    console.log('COD PAINEL/VENDAS.JS DESATIVADO NESSA ABA');
}
