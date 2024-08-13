let userSettings = {
    top10Limit: 10,
    profitIntervals: [1, 7, 30], // em dias
    salesGrowthInterval: 3 // em meses
};

// Carregar configurações do usuário
async function loadUserSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('userSettings').get();
        if (settingsDoc.exists) {
            userSettings = settingsDoc.data();
        } else {
            console.warn('Configurações não encontradas, usando padrões.');
        }
    } catch (error) {
        console.error('Erro ao carregar configurações do usuário:', error);
    }
}

// Salvar configurações do usuário
async function saveUserSettings() {
    try {
        await db.collection('settings').doc('userSettings').set(userSettings);
        _modal("#mastermodal","Sucesso!","Configurações salvas com sucesso!");
    } catch (error) {
        console.error('Erro ao salvar configurações do usuário:', error);
    }
}
document.getElementById('save-settings').addEventListener('click', async () => {
    userSettings.top10Limit = parseInt(document.getElementById('top10Limit').value);
    userSettings.profitIntervals = document.getElementById('profitIntervals').value.split(',').map(Number);
    userSettings.salesGrowthInterval = parseInt(document.getElementById('salesGrowthInterval').value);
    await saveUserSettings();
});