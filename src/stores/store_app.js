export default {
    namespaced: true,
    state: {
        hostURL: "http://x-files.miseven.net",
        selectedLanguage: {},
        selectedCategory: {},
        selectedSubCategory: {},
        selectedSnippet: {},
    },
    getters: {
        hostURL: state => state.hostURL,
        selectedLanguage: state => state.selectedLanguage,
        selectedCategory: state => state.selectedCategory,
        selectedSubCategory: state => state.selectedSubCategory,
        selectedSnippet: state => state.selectedSnippet,
    },
    actions: {
    },
    mutations: {
        hostURL: (state,url) => state.hostURL = url,
        selectedLanguage: (state,language) => state.selectedLanguage = language,
        selectedCategory: (state,category) => state.selectedCategory = category,
        selectedSubCategory: (state,subcategory) => state.selectedSubCategory = subcategory,
        selectedSnippet: (state,snippet) => state.selectedSnippet = snippet,
    }
}