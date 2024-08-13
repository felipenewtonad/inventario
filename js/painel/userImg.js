// Função para gerar o hash MD5
function md5(string) {
    return CryptoJS.MD5(string).toString();
}
// Gerar o hash MD5 do email
const emailHash = md5(_user.trim().toLowerCase());

// Construir a URL do Gravatar
const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}`;
$("#infouser").html(`
    <img class="mdl-chip__contact" src="${gravatarUrl}"></img>
     <span class="mdl-chip__text">${_user} (<b title="Total de notificações" id="ntfs">0</b>)</span>
       <a id="usage-anchor-2" href="#" class="mdl-chip__action">
        <i class="material-icons">settings</i></a>`);