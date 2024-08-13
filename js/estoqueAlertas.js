function saveLowStockLimit() {
    const lowStockLimit = document.getElementById('low-stock-limit').value;
    const now = new Date().toISOString();

    const stockConfig = {
        lowStockLimit: lowStockLimit,
        date: now,
        user: _user
    };

    localStorage.setItem('stockConfig', JSON.stringify(stockConfig));

    _modal('#mastermodal', 'Configurações!', `O alerta de estoque baixo foi definido em <b>${lowStockLimit}</b> ${lowStockLimit > 1 ? 'unidades' : 'unidade'} com sucesso!`);
    document.getElementById('current-limit-value').innerHTML = `
        <md-chip-set aria-label="Limites de estoque">
            <md-assist-chip>
                Limite: ${lowStockLimit}, Definido em: ${now}
            </md-assist-chip>
        </md-chip-set>`;
}

function saveUpdateInterval() {
    const updateInterval = document.getElementById('update-interval').value;
    const now = new Date().toISOString();

    const updateConfig = {
        updateInterval: updateInterval,
        date: now,
        user: _user
    };

    localStorage.setItem('updateConfig', JSON.stringify(updateConfig));

    _modal('#mastermodal', 'Configurações!', `O intervalo de <b>atualizações</b> automáticas é de: <b>${updateInterval}</b> ${updateInterval > 1 ? 'minutos' : 'minuto'}`);
    document.getElementById('current-interval-value').innerHTML = `
        <md-chip-set aria-label="Intervalos de updates de estoque">
            <md-assist-chip>
                Intervalo: ${updateInterval} minutos, Definido em: ${now}
            </md-assist-chip>
        </md-chip-set>`;
}

function loadSettings() {
    const stockConfig = JSON.parse(localStorage.getItem('stockConfig'));
    const updateConfig = JSON.parse(localStorage.getItem('updateConfig'));

    if (stockConfig) {
        document.getElementById('current-limit-value').innerHTML = `
            <md-chip-set aria-label="Limites de estoque">
                <md-assist-chip>
                    Limite: ${stockConfig.lowStockLimit}, Definido em: ${stockConfig.date}
                </md-assist-chip>
            </md-chip-set>`;
    }

    if (updateConfig) {
        document.getElementById('current-interval-value').innerHTML = `
            <md-chip-set aria-label="Intervalos de updates de estoque">
                <md-assist-chip>
                    Intervalo: ${updateConfig.updateInterval} minutos, Definido em: ${updateConfig.date}
                </md-assist-chip>
            </md-chip-set>`;
    }
}

function updateStockStatus() {
    const stockConfig = JSON.parse(localStorage.getItem('stockConfig'));
    const lowStockLimit = stockConfig ? stockConfig.lowStockLimit : 10;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const criticalStock = JSON.parse(localStorage.getItem('criticalStock')) || [];

    const now = new Date().toISOString();
    const updatedCriticalStock = products.map(product => {
        const quantity = product.quantity;
        const productId = product.id;
        let updateData = null;

        if (quantity === 0) {
            updateData = { productId: productId, date: now, type: 'zero' };
        } else if (quantity <= lowStockLimit) {
            updateData = { productId: productId, date: now, type: 'low' };
        }

        return updateData;
    }).filter(data => data !== null);

    localStorage.setItem('criticalStock', JSON.stringify(updatedCriticalStock));

    updateStockCounts();
    loadLowStockProducts();
    loadZeroStockProducts();
}

function updateStockCounts() {
    const stockConfig = JSON.parse(localStorage.getItem('stockConfig'));
    const lowStockLimit = stockConfig ? stockConfig.lowStockLimit : 10;

    const products = JSON.parse(localStorage.getItem('products')) || [];

    let lowStockCount = 0;
    let zeroStockCount = 0;

    products.forEach(product => {
        const quantity = product.quantity;

        if (quantity === 0) {
            zeroStockCount++;
        } else if (quantity <= lowStockLimit) {
            lowStockCount++;
        }
    });

    document.querySelector('#zero-stock-badge').innerText = zeroStockCount;
    document.querySelector('#low-stock-badge').innerText = lowStockCount;
    document.querySelector('#ntfs').innerText = zeroStockCount + lowStockCount;
}

function timeSince(date) {
    const now = new Date();
    const pastDate = new Date(date);

    if (isNaN(pastDate)) {
        return 'Data inválida';
    }

    const diff = now - pastDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const daysText = days === 1 ? 'dia' : 'dias';
    const hoursText = hours === 1 ? 'hora' : 'horas';

    return `${days} ${daysText} e ${hours} ${hoursText}`;
}

function loadLowStockProducts() {
    const list = document.getElementById('low-stock-list');
    list.innerHTML = '';

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const criticalStock = JSON.parse(localStorage.getItem('criticalStock')) || [];

    const lowStockProducts = criticalStock.filter(item => item.type === 'low');

    lowStockProducts.forEach(item => {
        const productId = item.productId;
        const date = item.date;
        const product = products.find(p => p.id === productId);

        if (product) {
            const productName = product.name;
            const quantity = product.quantity;
            const timeInStock = timeSince(date);

            const listItem = document.createElement('md-list-item');
            listItem.setAttribute('type', 'button');
            listItem.innerHTML = `
                <div slot="headline">${productName}</div>
                <div slot="supporting-text">Estoque Baixo por ${timeInStock}</div>
                <div slot="trailing-supporting-text">${quantity}</div>
            `;
            list.appendChild(listItem);
        }
    });
}

function loadZeroStockProducts() {
    const list = document.getElementById('zero-stock-list');
    list.innerHTML = '';

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const criticalStock = JSON.parse(localStorage.getItem('criticalStock')) || [];

    const zeroStockProducts = criticalStock.filter(item => item.type === 'zero');

    zeroStockProducts.forEach(item => {
        const productId = item.productId;
        const date = item.date;
        const product = products.find(p => p.id === productId);

        if (product) {
            const productName = product.name;
            const quantity = product.quantity;
            const timeInStock = timeSince(date);

            const listItem = document.createElement('md-list-item');
            listItem.setAttribute('type', 'button');
            listItem.innerHTML = `
                <div slot="headline">${productName}</div>
                <div slot="supporting-text">Estoque Zerado por ${timeInStock}</div>
                <div slot="trailing-supporting-text">${quantity}</div>
            `;
            list.appendChild(listItem);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateStockCounts();
    updateStockStatus();
    /*
        setInterval(() => {
            updateStockStatus();
        }, 1 * 60 * 1000); // Exemplo: Atualização a cada 10 minutos
        */
});
