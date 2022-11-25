<style scoped>
	.card {
		background: #ffffff;
		padding: 2rem;
		box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
		border-radius: 4px;
		margin-bottom: 2rem;
	}
	.p-dropdown {
		width: 14rem;
		font-weight: normal;
	}

	.product-name {
		font-size: 1.2rem;
		font-weight: 700;
	}

	.product-description {
		margin: 0.2rem 0 0.5rem 0;
	}

	.product-category-icon {
		vertical-align: middle;
		margin-right: .5rem;
	}

	.product-category {
		font-weight: 600;
		vertical-align: middle;
	}

	.product-grid-item {
		margin: .5rem;
		border: 1px solid var(--surface-border);
	}

	.product-grid-item .product-grid-item-top,
	.product-grid-item .product-grid-item-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.product-grid-item img {
		width: 90%;
		height: 210px;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
		margin: 0 0 1rem 0;
	}

	.product-grid-item .product-grid-item-content {
		height: 280px;
		text-align: center;
	}

	.product-grid-item .product-price {
		font-size: 1.5rem;
		font-weight: 600;
	}

</style>

<template>
	<div class="grid" @contextmenu="onRightClick">
		<div class="col-12">
			<Breadcrumb style="margin: 0 0 0.5rem 0" :home="{ icon: 'pi pi-home' }" :model="breadcrumbItems" />
			<div class="card">
				<DataView :value="snippets" layout="grid">
					<template #grid="slotProps">
						<div class="col-12 md:col-3" @contextmenu="onRightClickSnippet($event, slotProps)" @click="clickSnippet(slotProps)" >
                            <div class="product-grid-item card">
                                <div class="product-grid-item-content">
                                    <img :src="slotProps.data.image" :alt="slotProps.data.nama"/>
                                    <div class="product-name">{{slotProps.data.nama}}</div>
                                    <div class="product-description">{{slotProps.data.keterangan}}</div>
                                </div>
                            </div>
                        </div>
					</template>
				</DataView>
			</div>
		</div>
	</div>
	<ContextMenu ref="cm" :model="cmItems" />

	<Dialog v-model:visible="showEditor" :style="{width: '450px'}" :header="editorTitle" :modal="true" class="p-fluid">
		<div class="field">
			<label for="nama">Judul</label>
			<InputText id="nama" v-model.trim="editing.nama" required="true" autofocus :class="{'p-invalid': !editing.nama}" />
		</div>
		<div class="field">
			<label for="keterangan">Keterangan</label>
			<InputText id="keterangan" v-model.trim="editing.keterangan" required="true" autofocus :class="{'p-invalid': !editing.keterangan}" />
		</div>
		<div class="field">
			<label for="image">Preview</label>
			<FileUpload id="image" mode="basic" @select="onSelectFile" url="#" :customUpload="true" @uploader="()=>{}" :multiple="false" accept="image/*" />
		</div>
		<template #footer>
			<Button label="No" icon="pi pi-times" class="p-button-text" @click="onHideEditor"/>
			<Button label="Remove" icon="pi pi-trash" class="p-button-text p-button-danger" @click="onRemove" />
			<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="onConfirmEditor" />
		</template>
	</Dialog>

</template>



<script>
import api from '../api_service.js';
import store from '../store.js';

export default {
	data() {
		return {
			cmItems : [],
			language : {},
			category : {},
			subCategory : {},
			snippets : [],
			breadcrumbItems: [],

			editorTitle : "",
			showEditor: false,
			isNew: false,
			editing: {},
			selectedSnippet : null,
			selectedFiles: null
		}
	},
	mounted(){
		this.language = this.$store.getters['storeApps/selectedLanguage'];
		this.category = this.$store.getters['storeApps/selectedCategory'];
		this.subCategory = this.$store.getters['storeApps/selectedSubCategory'];
		this.updateViewBeadcrumb();	
	},
	computed:{
		selectedLanguage(){
			return this.$store.getters['storeApps/selectedLanguage'];
		},
		selectedCategory(){
			return this.$store.getters['storeApps/selectedCategory'];
		},
		selectedSubCategory(){
			return this.$store.getters['storeApps/selectedSubCategory'];
		},
		darkTheme() {
			return this.$appState.darkTheme;
		}
	},
	watch: {
		selectedLanguage(newValue){
			this.language = newValue;
			this.updateViewBeadcrumb();
			this.snippets = [];
		},
		selectedCategory(newValue){
			this.category = newValue;
			this.updateViewBeadcrumb();
			this.snippets = [];
		},
		selectedSubCategory(newValue){
			this.subCategory = newValue;
			this.updateViewBeadcrumb();
			if( newValue!=null && newValue.id!=null && newValue.id>0 ){
				this.loadSnippets( newValue.id );
			}
		}
	},
	methods: {
		clickSnippet(snippetProxy) {
			store.commit('storeApps/selectedSnippet', snippetProxy.data );
			this.$router.push('/snippet-details');
		},
		updateViewContextMenu( add, edit, separator, del ){
			this.cmItems = [];
			if( add ){
				this.cmItems.push( { label: "Add", icon: "pi pi-plus", command: () => this.onShowEditor(true) } );
			}
			if( edit ){
				this.cmItems.push( { label: "Edit", icon: "pi pi-pencil", command: () => this.onShowEditor(false) } );
			}
			if( separator ){
				this.cmItems.push( { separator: true, } );
			}
			if( del ){
				this.cmItems.push( { label: "Delete", icon: "pi pi-trash", command: () => this.onRemove() } );
			}
		},
		onRightClick(event){
			this.selectedSnippet = null;
			if( this.selectedSubCategory && this.selectedSubCategory.id ){
				this.updateViewContextMenu(true, false, false, false);
				this.$refs.cm.show(event);
			}
		},
		onRightClickSnippet(event, snippetWrapper){
			this.selectedSnippet = snippetWrapper.data;
			this.updateViewContextMenu(true, true, true, true);
			this.$refs.cm.show(event);
		},
		onSelectFile(event){
			this.selectedFiles = event.files;
		},
		loadSnippets( subCategoryId ){
			try{
				api.get( 'snippet/data', { page:1, take:9999, filter: 'sub_kategori_id:=:' + subCategoryId, "order": "nama", "order_method" : "ASC" } ).then( (data) =>{
					const message = data.message;
					const success = data.success;
					const dataList = data.data;

					if( success ){
						this.snippets = dataList;
						let hostUrl = this.$store.getters['storeApps/hostURL'];

						this.snippets.forEach( (item) =>{
							item.image = hostUrl + item.image  + "?tmp=" + Math.floor(Math.random() *10000);
						});

					}else{
						this.$toast.add({severity:'success', summary: 'Error', detail: message, life: 5000});
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		updateViewBeadcrumb(){
			this.breadcrumbItems= [];
			if( this.language && this.language.nama ){
				this.breadcrumbItems.push( { label : this.language.nama} );
			}
			if( this.category && this.category.nama ){
				this.breadcrumbItems.push( { label : this.category.nama} );
			}
			if( this.subCategory && this.subCategory.nama ){
				this.breadcrumbItems.push( { label : this.subCategory.nama} );
			}
		},
		onShowEditor( newMode ){
			if( !newMode && !this.selectedSnippet ){
				return;
			}
			this.isNew = newMode;
			if( newMode ){
				this.editorTitle = "Tambah Snippet";
				this.editing = {};
			}else{
				if( this.selectedSnippet==null ){
					this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Pilih snippet yang akan di-edit", life: 5000});							
					return;
				}
				this.editorTitle = "Edit Snippet";
				const mapKeys = ["id", "nama", "keterangan", "image"];
				for( let i=0; i<mapKeys.length; i++ ){
					const key = mapKeys[i];
					this.editing[key] = this.selectedSnippet[key];
				}
			}
			this.showEditor = true;
		},
		onHideEditor(){
			this.showEditor = false;
		},
		onConfirmEditor(){
			if( !this.editing.nama ){
				this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Nama tidak boleh kosong", life: 5000});							
			}

			if( this.isNew && ( !this.selectedFiles || this.selectedFiles.length<=0) ){
				this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Preview tidak boleh kosong", life: 5000});							
			}

			try{
				let data = new FormData();
				if( !this.isNew ){
					data.append( "id", this.editing["id"]);
				}
				data.append( "nama", this.editing["nama"] );
				data.append( "keterangan", this.editing["keterangan"] );
				data.append( "sub_kategori_id", this.subCategory.id );
				if( this.selectedFiles!=null && this.selectedFiles.length>0 ){
					data.append( "image", this.selectedFiles[0], this.selectedFiles[0].name );
				}

				api.saveForm( 'snippet/save', data ).then( (data) =>{
					if( data.success ){
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
						this.showEditor = false;
						if( !this.isNew ){
							const mapKeys = ["id", "nama", "keterangan", "image"];
							for( let i=0; i<mapKeys.length; i++ ){
								const key = mapKeys[i];
								this.selectedSnippet[key] = data.data[key];
							}
							this.selectedSnippet.label = this.selectedSnippet.nama;
							let hostUrl = this.$store.getters['storeApps/hostURL'];
							this.selectedSnippet["image"] = hostUrl + data.data["image"] + "?tmp=" + Math.floor(Math.random() *10000);
							this.selectedFiles = null;
						}else{
							data.data.label = data.data.nama;
							data.data.icon = "";
							let hostUrl = this.$store.getters['storeApps/hostURL'];
							data.data["image"] = hostUrl + data.data["image"] + "?tmp=" + Math.floor(Math.random() *10000);
							this.snippets.unshift( data.data );
							this.selectedFiles = null;
						}
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
			}
		},
		onRemove(){
			this.$confirm.require({
                target: event.currentTarget,
                message: `Hapus snippet "${this.selectedSnippet.nama}" ?`,
				header: "Konfirmasi",
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
					this.showEditor = false;
					try{
						let idLama = this.selectedSnippet.id;
						api.delete( 'snippet/delete', [this.selectedSnippet.id] ).then( (data) =>{
							if( data.success ){
								this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
								this.showEditor = false;
								this.snippets = this.snippets.filter(val => val.id !== idLama);
								this.selectedSnippet = {};
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
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
