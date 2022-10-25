<template>
	<div class="layout-menu-container">
		<h6>{{ categories }}</h6>
		<AppSubmenu :items="categories" class="layout-menu" :root="true" @menuitem-click="onMenuItemClick" @keydown="onKeyDown" />
	</div>
</template>

<script>
import AppSubmenu from './AppSubmenu';
import api from './api_service.js';

export default {
	data() {
		return {
			categories :[],
			language : {}
		}
	},
	// created(){
	// 	this.selectedLanguageName = this.$store.getters['storeApps/selectedLanguage'].nama;
	// },
	computed:{
		selectedLanguage(){
			return this.$store.getters['storeApps/selectedLanguage'];
		},
		darkTheme() {
			return this.$appState.darkTheme;
		}
	},
	watch: {
		selectedLanguage(newValue){
			this.language = newValue;
			if( newValue.id!=null && newValue.id>0 ){
				this.loadCategories( newValue.id );
			}
		}
	},
    methods: {
		loadCategories( languageId ){
			try{
				api.get( 'kategori/data', { page:1, take:9999, data_master: languageId } ).then( (data) =>{
					const message = data.message;
					const success = data.success;
					const dataList = data.data;

					if( success ){
						this.categories = dataList;
						// if( this.categories.length>0 ){
						// 	if( this.selectedLanguage==null ){
						// 		this.selectedLanguage = this.languages[0];
						// 		store.commit('storeApps/selectedLanguage', this.languages[0] );
						// 	}
						// }
					}else{
						this.$toast.add({severity:'success', summary: 'Error', detail: message, life: 5000});
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},

        onMenuItemClick(event) {
            this.$emit('menuitem-click', event);
        },
		onKeyDown(event) {
			const nodeElement = event.target;
			if (event.code === 'Enter' || event.code === 'Space') {
				nodeElement.click();
				event.preventDefault();
			}
		},
		bannerImage() {
			return this.$appState.darkTheme ? 'images/banner-primeblocks-dark.png' : 'images/banner-primeblocks.png';
		}
    },
	components: {
		'AppSubmenu': AppSubmenu
	}
}
</script>