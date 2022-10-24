export default {
    namespaced: true,
    state: {
        selectedLanguage: {},
    },
    getters: {
        selectedLanguage: state => state.selectedLanguage,
    },
    actions: {
    },
    mutations: {
        selectedLanguage: (state,language) => state.selectedLanguage = language,
    }
}