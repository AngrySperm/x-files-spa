<template>
	<div class="layout-menu-container"  @contextmenu="onCategoryRightClick" >
		<AppSubmenu :items="items" class="layout-menu" :root="true" @menuitem-click="onMenuItemClick" @keydown="onKeyDown" />
	</div>
	<ContextMenu ref="cmCategory" :model="cmCategoryItems" />

	<Dialog v-model:visible="showCategoryEditor" :style="{width: '450px'}" :header="categoryEditorTitle" :modal="true" class="p-fluid">
		<div class="field">
			<label for="nama">Nama Kategori</label>
			<InputText id="nama" v-model.trim="editingCategory.nama" required="true" autofocus :class="{'p-invalid': !editingCategory.nama}" />
		</div>
		<template #footer>
			<Button label="No" icon="pi pi-times" class="p-button-text" @click="onHideCategoryEditor"/>
			<Button label="Remove" icon="pi pi-trash" class="p-button-text p-button-danger" @click="onRemoveCategory" />
			<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="onConfirmCategoryEditor" />
		</template>
	</Dialog>

</template>

<script>
import AppSubmenu from './AppSubmenu';
import api from './api_service.js';

export default {
	data() {
		return {
			cmCategoryItems : [
				{
					label: "Add",
					icon: "pi pi-plus",
					command: () => this.onShowCategoryEditor(true)
				},
				{
					label: "Edit",
					icon: "pi pi-pencil",
					command: () => this.onShowCategoryEditor(false)
				},
				{
					separator: true,
				},
				{
					label: "Delete",
					icon: "pi pi-trash",
					command: () => this.onRemoveCategory()
				}
			],

			itemsFirst: {},
			categories :[],
			items: [],
			language : {},

			categoryEditorTitle : "",
			showCategoryEditor: false,
			newCategory: false,
			editingCategory: {},

		}
	},
	created(){
		this.items =  [ this.itemsFirst ];
	},
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
				this.itemsFirst.label = "Lang:  " + newValue.nama;
			}else{
				this.itemsFirst.label = "";
			}
		}
	},
    methods: {
		onCategoryRightClick(event){
			this.$refs.cmCategory.show(event);
		},
		loadCategories( languageId ){
			try{
				api.get( 'kategori/data', { page:1, take:9999, filter: 'master_id', value: languageId } ).then( (data) =>{
					const message = data.message;
					const success = data.success;
					const dataList = data.data;

					if( success ){
						this.categories = dataList;
						this.categories.forEach( (item) =>{
							item.label = item.nama;
							item.icon = '';
							item.command = () => console.log(item.nama);
						});
						this.itemsFirst.items = this.categories;
					}else{
						this.$toast.add({severity:'success', summary: 'Error', detail: message, life: 5000});
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},

        onMenuItemClick(event) {
			this.selectedCategory = event.item;
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
		},

		//Categories Editor
		onShowCategoryEditor( newMode ){
			console.log( newMode, "On Show Category ");
			this.newCategory = newMode;
			if( newMode ){
				this.categoryEditorTitle = "Tambah Kategori";
				this.editingCategory = {};
			}else{
				if( this.selectedCategory==null ){
					this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Pilih kategori yang akan di-edit", life: 5000});							
					return;
				}
				this.categoryEditorTitle = "Edit Kategori";
				const mapKeys = ["id", "nama", "master_id"];
				for( let i=0; i<mapKeys.length; i++ ){
					const key = mapKeys[i];
					this.editingCategory[key] = this.selectedCategory[key];
				}
			}
			this.showCategoryEditor = true;
		},
		onHideCategoryEditor(){
			console.log("Hide Category Editor");
			this.showCategoryEditor = false;
		},
		onConfirmCategoryEditor(){
			console.log("Confirm Category Editor");
			if( !this.editingCategory.nama ){
				this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Nama tidak boleh kosong", life: 5000});							
			}

			try{
				let data = {};
				const mapKeys = ["id", "nama", "master_id"];
				for( let i=0; i<mapKeys.length; i++ ){
					const key = mapKeys[i];
					if( this.newCategory && key=="id" ){
						continue;
					}
					data[key] = this.editingCategory[key];
				}
				if( this.newCategory ){
					data['master_id'] = this.language.id;
				}

				api.save( 'kategori/save', data ).then( (data) =>{
					if( data.success ){
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
						this.showCategoryEditor = false;
						if( !this.newCategory ){
							const mapKeys = ["id", "nama", "master_id"];
							for( let i=0; i<mapKeys.length; i++ ){
								const key = mapKeys[i];
								this.selectedCategory[key] = data.data[key];
							}
							this.selectedCategory.label = this.selectedCategory.nama;
						}else{
							data.data.label = data.data.nama;
							data.data.icon = "";
							this.categories.unshift( data.data );
						}
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
			}

		},
		onRemoveCategory(){
			this.$confirm.require({
                target: event.currentTarget,
                message: `Hapus bahasa "${this.selectedCategory.nama}" ?`,
				header: "Konfirmasi",
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
					this.showCategoryEditor = false;
					try{
						let idLama = this.selectedCategory.id;
						api.delete( 'kategori/delete', [this.selectedCategory.id] ).then( (data) =>{
							if( data.success ){
								this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
								this.showCategoryEditor = false;
								this.categories = this.categories.filter(val => val.id !== idLama);
								this.itemsFirst.items = this.itemsFirst.items.filter( val => val.id !== idLama);
								this.selectedCategory = {};
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
		'AppSubmenu': AppSubmenu
	}
}
</script>