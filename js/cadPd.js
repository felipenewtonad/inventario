if (localStorage.getItem('abaAtiva') === 'cadastro-tab') {
    // Função para adicionar produto
    function addProduct() {
        const productName = document.getElementById('product-name').value.trim();
        const quantity = document.getElementById('quantity').value.trim();
        const supplierName = document.getElementById('supplier-name').value.trim();
        const brand = document.getElementById('brand').value.trim();
        const price = document.getElementById('price').value.trim();
        const price_venda = document.getElementById('price-venda').value.trim();
        let cod_produto = document.getElementById('cod_pd').value.trim();
        const productImage = document.getElementById('product-image').files[0];
        const user = _user;  // Nome do usuário

        // Verifica se todos os campos estão preenchidos
        if (productName && quantity && supplierName && brand && price && price_venda) {
            // Verifica se quantity e price são valores numéricos válidos
            if (isNaN(quantity) || isNaN(price) || isNaN(price_venda)) {
                _modal('#mastermodal', 'Erro', 'Quantidade e preço devem ser valores numéricos.');
                return;
            }

            // Gera um código de produto automático se o campo estiver vazio
            if (!cod_produto) {
                cod_produto = db.collection('products').doc().id; // Gera uma chave única automática
            }

            // Verifica se o cod_produto já existe na coleção
            db.collection('products').where('supplier.bars', '==', cod_produto).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        _modal('#mastermodal', 'Atenção!', `O código de produto <b>${cod_produto}</b> já está cadastrado.`);
                        return;
                    } else {
                        // Define a URL da imagem padrão
                        let imageUrl = 'img/sem_imagem.jpg';

                        // Função para salvar os dados do produto no Firestore
                        const saveProductData = () => {
                            const productData = {
                                name: productName,
                                creationDate: new Date().toISOString(),  // Data atual em formato ISO
                                quantity: parseInt(quantity),
                                supplier: {
                                    bars: cod_produto,
                                    name: supplierName,
                                    brand: brand,
                                    price: parseFloat(price),
                                    price_venda: parseFloat(price_venda),
                                    user: user
                                },
                                imageUrl: imageUrl
                            };

                            // Adiciona o produto à coleção 'products'
                            db.collection('products').add(productData)
                                .then(() => {
                                    _modal('#mastermodal', 'Sucesso!', `Produto <b>cadastrado</b> com sucesso!`);
                                    document.getElementById('product-form').reset();
                                    updateLocalStorage();
                                })
                                .catch(error => {
                                    _modal('#mastermodal', 'Erro 200', `Erro ao cadastrar produto: <b>${error.message}</b>`);
                                });
                        };

                        // Verifica se uma imagem foi selecionada
                        if (productImage) {
                            // Cria uma referência no Firebase Storage para a imagem do produto
                            const storageRef = firebase.storage().ref('product-images/' + productImage.name);
                            // Faz o upload da imagem para o Firebase Storage
                            storageRef.put(productImage).then(snapshot => {
                                // Obtém a URL da imagem carregada
                                snapshot.ref.getDownloadURL().then(url => {
                                    imageUrl = url;
                                    saveProductData();
                                }).catch(error => {
                                    _modal('#mastermodal', 'Erro 300', `Erro ao obter URL da imagem: <b>${error.message}</b>`);
                                });
                            }).catch(error => {
                                _modal('#mastermodal', 'Erro 300', `Erro ao carregar a imagem: <b>${error.message}</b>`);
                            });
                        } else {
                            // Nenhuma imagem foi selecionada, salva os dados do produto com a imagem padrão
                            saveProductData();
                        }
                    }
                })
                .catch(error => {
                    _modal('#mastermodal', 'Erro 400', `Erro ao verificar o código do produto: <b>${error.message}</b>`);
                });
        } else {
            _modal('#mastermodal', 'Informações!', 'Por favor, preencha <b>todos</b> os campos.');
        }
    }
}