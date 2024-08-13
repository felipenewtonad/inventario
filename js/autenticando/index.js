// Verifica se o usuário está autenticado ao carregar a página
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // Usuário está logado
        localStorage.setItem('logado', user.email);
        checkAdmin(user.uid);
    } else {
        // Usuário não está logado
        location.href = "/login.html";
    }
});
// Função para fazer logout
function logout() {
    firebase.auth().signOut().then(function () {
        // Logout bem-sucedido
        location.href = "/login.html";
    }).catch(function (error) {
        // Tratamento de erros
        console.error("Erro ao fazer logout:", error);
    });
}
// Verifica se o usuário é administrador
function checkAdmin(userId) {
    // Consulta o Firestore para verificar se o usuário é administrador
    db.collection('settings').doc(userId).get().then(function (doc) {
        if (doc.exists) {
            var userData = doc.data();
            if (userData.isAdmin) {
                // Usuário é administrador
                console.log("Usuário é administrador.");
                // Ações específicas para administradores
            } else {
                // Usuário não é administrador
                console.log("Usuário não é administrador.");
                // Ações específicas para usuários comuns
            }
        } else {
            console.log("Dados de privilégio não encontrados.");
        }
    }).catch(function (error) {
        console.error("Erro ao verificar administrador:", error);
    });
}
// Verifica o status do usuário
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // Usuário está logado, verifica o privilégio
        db.collection('settings').doc(user.uid).get().then(function (doc) {
            if (doc.exists) {
                var userData = doc.data();
                var isAdmin = userData.isAdmin;
                // Ações específicas para administradores ou usuários comuns
                // Exemplo: precos(isAdmin);
                console.log(user.email);
                localStorage.setItem('logado', user.email);
                localStorage.setItem('isAdmin', isAdmin);
            } else {
                console.log("Dados de privilégio não encontrados.");
            }
        }).catch(function (error) {
            console.error("Erro ao verificar privilégio:", error);
        });
    } else {
        // Usuário não está logado, redireciona ou mostra mensagem de erro
        console.log('Você precisa estar logado para acessar esta página.');
        location.href = "/login.html";
    }
});
function iniciarCadasstro(){
    //ao chamar função
    location.href = "/cadastrar.html";
}
