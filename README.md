#Gerenciamento de Compras e Estoque

Este projeto é uma aplicação web desenvolvida para gerenciar compras e o estoque de produtos. Utilizando tecnologias como HTML, JavaScript, jQuery e Firebase, a aplicação permite o cadastro de produtos, registro de compras, atualização de estoque, cálculos automáticos de valores e geração de relatórios de compras.
Funcionalidades

    Cadastro de Produtos: Registre novos produtos com detalhes como nome, data de criação, quantidade inicial e informações do fornecedor.
    Registro de Compras: Adicione compras de múltiplos produtos, calculando automaticamente o valor total da nota fiscal.
    Atualização de Estoque: O estoque é atualizado automaticamente após o registro de novas compras.
    Relatório de Compras: Exiba relatórios detalhados com informações sobre produtos vendidos, clientes, lucros e total geral, com filtros para diferentes períodos.

#Configuração do Projeto
1. Requisitos

    Node.js (recomendado: v14 ou superior)
    Firebase: Uma conta Firebase com um projeto configurado para Firestore.
    Servidor Web: Pode ser um servidor local como o http-server ou diretamente no Firebase Hosting.

2. Clonar o Repositório

bash

git clone https://github.com/felipenewtonad/inventario.git
cd seu-repositorio

3. Configurar o Firebase

    Crie um projeto no Firebase:
        Acesse o Firebase Console.
        Crie um novo projeto e configure o Firestore.
        Copie as credenciais do Firebase (configurações do app web) e substitua no arquivo js/iniciarFB.js.

    Configurar Firestore:
        Crie as coleções necessárias, como products e purchases.
        Defina as regras de segurança conforme suas necessidades.

4. Instalar Dependências

Este projeto usa bibliotecas CDN, então não há necessidade de instalar dependências via npm. Certifique-se de que a conexão com a internet está disponível para carregar as bibliotecas necessárias.
5. Executar o Projeto

Você pode executar o projeto diretamente abrindo o arquivo index.html em seu navegador ou servindo-o através de um servidor local:

bash

npx http-server

Abra seu navegador e acesse http://localhost:8080.
6. Hospedagem no Firebase (Opcional)

Para hospedar o projeto no Firebase Hosting:

bash

firebase init
firebase deploy

Contribuição e Suporte

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

Se este projeto foi útil para você, considere apoiar seu desenvolvimento. Qualquer forma de suporte é muito apreciada!
