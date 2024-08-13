// Função para fazer cadastro
function register() {
    var email = $("#reg-email").val();
    var password = $("#reg-password").val();
    var privilege = $("#reg-privilege").val();

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            // Sucesso ao cadastrar
            var user = userCredential.user;
            alert("Cadastro realizado com sucesso!");
            $("#cadhome").show();
            // Salva o nível de privilégio no Firestore
            return db.collection('settings').doc(user.uid).set({
                email: email,
                isAdmin: privilege === "admin"
            });
        })
        .catch(function (error) {
            // Tratamento de erros
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorCode, errorMessage);
        });
}
