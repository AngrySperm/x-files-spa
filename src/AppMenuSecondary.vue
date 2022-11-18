<template>
	<div class="layout-menu-container"  @contextmenu="onSubCategoryRightClick" >
		<AppSubmenuSecondary :items="items" class="layout-menu" :root="true" @menuitem-click="onMenuItemClick" @keydown="onKeyDown" />
	</div>
	<ContextMenu ref="cmSubCategory" :model="cmSubCategoryItems" />

	<Dialog v-model:visible="showSubCategoryEditor" :style="{width: '450px'}" :header="subCategoryEditorTitle" :modal="true" class="p-fluid">
		<div class="field">
			<label for="nama">Nama Sub Kategori</label>
			<InputText id="nama" v-model.trim="editingSubCategory.nama" required="true" autofocus :class="{'p-invalid': !editingSubCategory.nama}" />
		</div>
		<template #footer>
			<Button label="No" icon="pi pi-times" class="p-button-text" @click="onHideSubCategoryEditor"/>
			<Button label="Remove" icon="pi pi-trash" class="p-button-text p-button-danger" @click="onRemoveSubCategory" />
			<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="onConfirmSubCategoryEditor" />
		</template>
	</Dialog>

</template>

<script>
import AppSubmenuSecondary from './AppSubmenuSecondary.vue';
import api from './api_service.js';
import store from './store.js';

export default {
	data() {
		return {
			cmSubCategoryItems : [
				{
					label: "Add",
					icon: "pi pi-plus",
					command: () => this.onShowSubCategoryEditor(true)
				},
				{
					label: "Edit",
					icon: "pi pi-pencil",
					command: () => this.onShowSubCategoryEditor(false)
				},
				{
					separator: true,
				},
				{
					label: "Delete",
					icon: "pi pi-trash",
					command: () => this.onRemoveSubCategory()
				}
			],

			itemsFirst: {},
			language : {},
			subCategories :[],
			items: [],
			category : {},

			subCategoryEditorTitle : "",
			showSubCategoryEditor: false,
			newSubCategory: false,
			editingSubCategory: {},

		}
	},
	created(){
		this.items =  [ this.itemsFirst ];
	},
	computed:{
		selectedLanguage(){
			return this.$store.getters['storeApps/selectedLanguage'];
		},
		selectedCategory(){
			return this.$store.getters['storeApps/selectedCategory'];
		},
		darkTheme() {
			return this.$appState.darkTheme;
		}
	},
	watch: {
		selectedLanguage(newValue){
			this.language = newValue;
			this.itemsFirst.items = [];
		},
		selectedCategory(newValue){
			this.category = newValue;
			if( newValue!=null && newValue.id!=null && newValue.id>0 ){
				this.loadSubCategories( newValue.id );
				this.itemsFirst.label = "Cate:  " + newValue.nama;
			}else{
				this.itemsFirst.label = "";
			}
		}
	},
    methods: {
		onSubCategoryRightClick(event){
			this.$refs.cmSubCategory.show(event);
		},
		loadSubCategories( categoryId ){
			try{
				api.get( 'subkategori/data', { page:1, take:9999, filter: 'kategori_id', value: categoryId } ).then( (data) =>{
					const message = data.message;
					const success = data.success;
					const dataList = data.data;

					if( success ){
						this.subCategories = dataList;
						this.subCategories.forEach( (item) =>{
							item.label = item.nama;
							item.icon = '';
							// item.command = () => console.log(item.nama);
						});
						this.itemsFirst.items = this.subCategories;
					}else{
						this.$toast.add({severity:'success', summary: 'Error', detail: message, life: 5000});
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},

        onMenuItemClick(event) {
			this.selectedSubCategory = event.item;
			store.commit('storeApps/selectedSubCategory', event.item );
			store.commit('storeApps/selectedSnippet', null );
            this.$emit('menuitem-click', event);
			this.$router.push('/');
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
		},

		//Categories Editor
		onShowSubCategoryEditor( newMode ){
			console.log( newMode, "On Show Sub Category ");
			this.newSubCategory = newMode;
			if( newMode ){
				this.subCategoryEditorTitle = "Tambah Sub Kategori";
				this.editingSubCategory = {};
			}else{
				if( this.selectedSubCategory==null ){
					this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Pilih sub kategori yang akan di-edit", life: 5000});							
					return;
				}
				this.categoryEditorTitle = "Edit Sub Kategori";
				const mapKeys = ["id", "nama"];
				for( let i=0; i<mapKeys.length; i++ ){
					const key = mapKeys[i];
					this.editingSubCategory[key] = this.selectedSubCategory[key];
				}
			}
			this.showSubCategoryEditor = true;
		},
		onHideSubCategoryEditor(){
			// console.log("Hide Sub Category Editor");
			this.showSubCategoryEditor = false;
		},
		onConfirmSubCategoryEditor(){
			// console.log("Confirm Sub Category Editor");
			if( !this.editingSubCategory.nama ){
				this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Nama tidak boleh kosong", life: 5000});							
			}

			try{
				let data = {};
				const mapKeys = ["id", "nama" ];
				for( let i=0; i<mapKeys.length; i++ ){
					const key = mapKeys[i];
					if( this.newSubCategory && key=="id" ){
						continue;
					}
					data[key] = this.editingSubCategory[key];
				}
				if( this.newSubCategory ){
					data['kategori_id'] = this.category.id;
				}

				api.save( 'subkategori/save', data ).then( (data) =>{
					if( data.success ){
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
						this.showSubCategoryEditor = false;
						if( !this.newSubCategory ){
							const mapKeys = ["id", "nama"];
							for( let i=0; i<mapKeys.length; i++ ){
								const key = mapKeys[i];
								this.selectedSubCategory[key] = data.data[key];
							}
							this.selectedSubCategory.label = this.selectedSubCategory.nama;
						}else{
							data.data.label = data.data.nama;
							data.data.icon = "";
							this.subCategories.unshift( data.data );
						}
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
			}

		},
		onRemoveSubCategory(){
			this.$confirm.require({
                target: event.currentTarget,
                message: `Hapus sub kategori "${this.selectedSubCategory.nama}" ?`,
				header: "Konfirmasi",
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
					this.showSubCategoryEditor = false;
					try{
						let idLama = this.selectedSubCategory.id;
						api.delete( 'subkategori/delete', [this.selectedSubCategory.id] ).then( (data) =>{
							if( data.success ){
								this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
								this.showSubCategoryEditor = false;
								this.subCategories = this.subCategories.filter(val => val.id !== idLama);
								this.itemsFirst.items = this.itemsFirst.items.filter( val => val.id !== idLama);
								this.selectedSubCategory = {};
								// this.items.items = this.categories;
								console.log(this.items);
							}else{
								this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
							}
						} );
					}catch( e ){
						this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
					}					
                },
                reject: () => {
                }
            });
		},

    },
	components: {
		'AppSubmenuSecondary': AppSubmenuSecondary
	}
}
</script>