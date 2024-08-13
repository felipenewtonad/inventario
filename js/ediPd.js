// Verificar se a aba ativa é a de cadastro
if (localStorage.getItem('abaAtiva') === 'cadastro-tab') {
    const CHAVE = 'products';
    const UPDATES = 'lastUpdated_editarProduto';
    const url_null = '';

    // Função para carregar produtos do Firestore e atualizar o localStorage
    function updateLocalStorage() {
        db.collection(CHAVE).get().then(snapshot => {
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            localStorage.setItem(CHAVE, JSON.stringify(products));
            localStorage.setItem(UPDATES, Date.now().toString());
            loadProductsFromLocalStorage();
        }).catch(error => {
            console.error('Erro ao carregar produtos do Firestore:', error);
        });
    }

    // Função para carregar produtos do localStorage
    function loadProductsFromLocalStorage() {
        const products = JSON.parse(localStorage.getItem(CHAVE));
        const productList = document.getElementById('product-list');
        productList.innerHTML = `
            <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" id="listaprodutos_jfab">
                <thead>
                    <tr>
                        <th>Barras</th>
                        <th>Nome</th>
                        <th>Quantidade</th>
                        <th>Fornecedor</th>
                        <th>Marca</th>
                        <th>Valor</th>
                        <th>V. Venda</th>
                        <th>Data de Criação</th>
                        <th>Data da Última Edição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="product-table-body"></tbody>
            </table>
        `;

        const productTableBody = document.getElementById('product-table-body');
        products.forEach(data => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.supplier.bars||'N/A'}</td>
                <td>
                    <span class="mdl-chip mdl-chip--contact mdl-chip--deletable">
                        <img class="mdl-chip__contact" src="${data.imageUrl || url_null}" alt="Product Image">
                        <span class="mdl-chip__text">${data.name}</span>
                    </span>
                </td>
                <td>${data.quantity}</td>
                <td>${data.supplier.name}</td>
                <td>${data.supplier.brand}</td>
                <td>${data.supplier.price}</td>
                <td>${data.supplier.price_venda||'N/A'}</td>
                <td>${new Date(data.creationDate).toLocaleString()}</td>
                <td>${data.lastEdited ? new Date(data.lastEdited).toLocaleString() : 'Nunca'}</td>
                <td>
                    <md-filled-tonal-button onclick="editProduct('${data.id}')">Editar<md-icon slot="icon">edit</md-icon></md-filled-tonal-button>
                    <md-filled-tonal-button onclick="deleteProduct('${data.id}')">Deletar<md-icon slot="icon">delete</md-icon></md-filled-tonal-button>
                </td>
            `;
            productTableBody.appendChild(tr);
        });

        $('#listaprodutos_jfab').DataTable({
            "pagingType": "full_numbers"
        });
    }

    // Função para editar produto
    function editProduct(id) {
        const products = JSON.parse(localStorage.getItem(CHAVE));
        const product = products.find(p => p.id === id);
        if (product) {
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-bars').value = product.supplier.bars;
            document.getElementById('edit-product-name').value = product.name;
            document.getElementById('edit-quantity').value = product.quantity;
            document.getElementById('edit-supplier-name').value = product.supplier.name;
            document.getElementById('edit-brand').value = product.supplier.brand;
            document.getElementById('edit-price').value = product.supplier.price;
            document.getElementById('edit-price-venda').value = product.supplier.price_venda;
            document.getElementById('edit-form').style.display = 'block';
            document.querySelector('#modalediPd').setAttribute('open', '');
        }
    }

    // Função para atualizar produto
    function updateProduct() {
        const id = document.getElementById('edit-id').value;
        const bars = document.getElementById('edit-bars').value;
        const productName = document.getElementById('edit-product-name').value.trim();
        const quantity = document.getElementById('edit-quantity').value.trim();
        const supplierName = document.getElementById('edit-supplier-name').value.trim();
        const brand = document.getElementById('edit-brand').value.trim();
        const price = document.getElementById('edit-price').value.trim();
        const price_venda = document.getElementById('edit-price-venda').value.trim();
        const productImage = document.getElementById('edit-product-image').files[0];

        if (productName && quantity && supplierName && brand && price) {
            if (isNaN(quantity) || isNaN(price)) {
                _modal('#mastermodal', 'Erro', 'Quantidade e preço devem ser valores numéricos.');
                return;
            }

            const updatedProduct = {
                name: productName,
                quantity: parseInt(quantity),
                supplier: {
                    name: supplierName,
                    brand: brand,
                    bars: bars,
                    price: parseFloat(price),
                    price_venda: parseFloat(price_venda),
                    user: _user
                },
                lastEdited: new Date().toISOString()
            };

            const updateProductData = (imageUrl = null) => {
                if (imageUrl) {
                    updatedProduct.imageUrl = imageUrl;
                }

                db.collection('products').doc(id).update(updatedProduct)
                    .then(() => {
                        _modal('#mastermodal', 'Sucesso!', 'Produto atualizado com sucesso!');
                        document.getElementById('edit-form').style.display = 'none';
                        updateLocalStorage();
                        document.querySelector('#modalediPd').removeAttribute('open', '');
                    })
                    .catch(error => {
                        _modal('#mastermodal', 'ERRO 200!', `Erro ao atualizar produto: ${error}`);
                    });
            };

            if (productImage) {
                const storageRef = firebase.storage().ref('product-images/' + productImage.name);
                storageRef.put(productImage)
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => updateProductData(url))
                    .catch(error => {
                        _modal('#mastermodal', 'Erro 300', `Erro ao carregar a imagem: ${error.message}`);
                    });
            } else {
                updateProductData();
            }
        } else {
            _modal('#mastermodal', 'Informações!', 'Por favor, preencha todos os campos.');
        }
    }

    // Função para deletar um produto pelo ID com confirmação
    function deleteProduct(id) {
        if (confirm('Você tem certeza de que deseja deletar este produto?')) {
            db.collection('products').doc(id).delete()
                .then(() => {
                    _modal('#mastermodal', 'Sucesso!', 'Produto deletado com sucesso!');
                    updateLocalStorage();
                })
                .catch(error => {
                    _modal('#mastermodal', 'ERRO 200!', `Erro ao deletar produto: ${error}`);
                });
        } else {
            _modal('#mastermodal', 'Cancelado', 'Ação de deleção cancelada.');
        }
    }

    // Verificar se a última atualização foi há mais 8 hrs
    const lastUpdated = parseInt(localStorage.getItem(UPDATES));
    const thirtyMinutes = 8 * 60 * 60 * 1000;

    if (!lastUpdated || (Date.now() - lastUpdated) > thirtyMinutes) {
        updateLocalStorage();
    } else {
        loadProductsFromLocalStorage();
    }

    // Adicionar evento para o botão "Atualizar Dados"
    document.getElementById('update-data-button').addEventListener('click', updateLocalStorage);

    // Carregar produtos ao iniciar a página
    document.addEventListener('DOMContentLoaded', loadProductsFromLocalStorage);
    document.addEventListener('DOMContentLoaded', updateLocalStorage);
}
