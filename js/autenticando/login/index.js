
localStorage.removeItem('logado');
localStorage.removeItem('uid');
// Função para fazer login
function login() {
    var email = $("#email").val();
    var password = $("#password").val();
    
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function () {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        }).then(function (userCredential) {
            // Sucesso ao fazer login
            var user = userCredential.user;
            localStorage.setItem("uid", user.uid);
            localStorage.setItem("logado", user.email);

            // Buscar os privilégios do usuário no Firestore
            return db.collection('settings').doc(user.uid).get();
        }).then(function (doc) {
            if (doc.exists) {
                var userData = doc.data();
                localStorage.setItem("isAdmin", userData.isAdmin);
                location.href = "/index.html";
            } else {
                // Documento não encontrado
                console.log("Dados de privilégio não encontrados.");
            }
        }).catch(function (error) {
            // Tratamento de erros
            var errorCode = error.code;
            var errorMessage = error.message;
            document.querySelector("#alerta").setAttribute('open', '');
            alert(`Erro: ${errorCode}, ${errorMessage}`);
        });
}