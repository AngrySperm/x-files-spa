
<style scoped>
.card {
	background: #ffffff;
	padding: 1.5rem;
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

.file-name {
	font-style: italic;
	font-size: 1.1rem;
	font-weight: 700;
}

.file-description {
	margin: 1rem 0 1rem 0.5rem;
	font-size: 1.0rem;
}

.product-code {
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
	padding: 1.3rem;
	/* width: 300; */
	/* margin: .5rem; */
	border: 1px solid var(--surface-border);
}

.product-grid-item .product-grid-item-top,
.product-grid-item .product-grid-item-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.product-grid-item img {
	width: 60px;
	height: 60px;
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
	/* margin: 0 0 1rem 0; */
}

.product-grid-item .product-price {
	font-size: 1.5rem;
	font-weight: 600;
}

.product-list-item {
	display: flex;
	padding: 1rem;
	width: 100%;
}

.product-list-item img {
	width: 50px;
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
	margin-right: 2rem;
}

.product-list-item .product-list-detail {
	flex: 1 1 0;
	/* align-items: stretch; */
}

.product-list-item .p-rating {
	margin: 0 0 .5rem 0;
}

.product-list-item .product-price {
	font-size: 1.5rem;
	font-weight: 600;
	margin-bottom: .5rem;
	align-self: flex-end;
}

.product-list-item .product-list-action {
	display: flex;
	flex-direction: column;
}

.product-list-item .p-button {
	margin-bottom: .5rem;
}

</style>

<template>

	<div class="grid"  @contextmenu="onRightClick">
		<div class="col-12">
			<Breadcrumb style="margin: 0 0 0.5rem 0" :home="{ icon: 'pi pi-home' }" :model="breadcrumbItems" />
			<div class="card">
				<div class="col-12 md:col-4"  >
					<div class="product-grid-item card">
						<div class="product-grid-item-content flex">
							<img class="mr-4" :src="getSnippetImageUrl()" :alt="image"/>
							<div class="flex-column" >
								<div class="product-name">{{ snippet!=null? (snippet.nama?? "") : ""}}</div>
								<div class="product-description">{{ snippet!=null? (snippet.keterangan?? "") : ""}}</div>
							</div>
						</div>
					</div>
				</div>
				<DataView :value="snippetDetails" layout="list">
				<template #list="slotProps">
					<div class="col-12"  @contextmenu="onRightClickCode($event, slotProps)"  >
						<div class="product-list-item">
							<div class="product-list-detail">
								<div class="file-name">{{slotProps.data.file}}</div>
								<div class="file-description">{{slotProps.data.keterangan}}</div>
								<Vue3Prism theme="a11y-dark" language="dart" :source="slotProps.data.code" ></Vue3Prism>
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
			<label for="file">File</label>
			<InputText id="file" v-model.trim="editing.file" required="file" autofocus :class="{'p-invalid': !editing.file}" />
		</div>
		<div class="field">
			<label for="keterangan">Keterangan</label>
			<InputText id="keterangan" v-model.trim="editing.keterangan" required="true" autofocus :class="{'p-invalid': !editing.keterangan}" />
		</div>
		<div class="field">
			<label for="code">Code</label>
			<Textarea id="code" v-model="editing.code" rows="10" cols="60" autofocus :class="{'p-invalid': !editing.code}" />
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
import 'prismjs/components/prism-dart'
import 'prismjs/themes/prism-tomorrow.css';
import Prism from 'prismjs';
import Vue3Prism from '@/custom';

export default {
    data() {
        return {
			cmItems : [],
            snippetDetails: [],
            snippet: {},
            language: {},
            category: {},
            subCategory: {},
            breadcrumbItems: [],

			editorTitle : "",
			showEditor: false,
			isNew: false,
			editing: {},
			selectedCode : null,
		};
    },
    mounted() {
        this.language = this.$store.getters["storeApps/selectedLanguage"];
        this.category = this.$store.getters["storeApps/selectedCategory"];
        this.subCategory = this.$store.getters["storeApps/selectedSubCategory"];
        this.snippet = this.$store.getters["storeApps/selectedSnippet"];
        this.updateViewBeadcrumb();
        this.loadSnippetDetails(this.snippet.id);
        window.Prism = window.Prism || {};
        window.Prism.manual = true;
        Prism.highlightAll();
    },
    computed: {
        selectedLanguage() {
            return this.$store.getters["storeApps/selectedLanguage"];
        },
        selectedCategory() {
            return this.$store.getters["storeApps/selectedCategory"];
        },
        selectedSubCategory() {
            return this.$store.getters["storeApps/selectedSubCategory"];
        },
        selectedSnippet() {
            return this.$store.getters["storeApps/selectedSnippet"];
        },
        darkTheme() {
            return this.$appState.darkTheme;
        }
    },
    watch: {
        selectedLanguage(newValue) {
            this.language = newValue;
            this.updateViewBeadcrumb();
        },
        selectedCategory(newValue) {
            this.category = newValue;
            this.updateViewBeadcrumb();
        },
        selectedSubCategory(newValue) {
            this.subCategory = newValue;
            this.updateViewBeadcrumb();
        },
        selectedSnippet(newValue) {
            this.snippet = newValue;
            this.updateViewBeadcrumb();
        },
    },
    methods: {
        getSnippetImageUrl() {
            if (this.snippet == null || this.snippet.image == null) {
                return "#";
            }
            // let hostUrl = this.$store.getters['storeApps/hostURL'];
            // return hostUrl + this.snippet.image  + "?tmp=" + Math.floor(Math.random() *10000);
            return this.snippet.image + "?tmp=" + Math.floor(Math.random() * 10000);
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
			this.selectedCode = null;
			if( this.selectedSnippet && this.selectedSnippet.id ){
				this.updateViewContextMenu(true, false, false, false);
				this.$refs.cm.show(event);
			}
		},
		onRightClickCode(event, snippetWrapper){
			this.selectedCode = snippetWrapper.data;
			this.updateViewContextMenu(true, true, true, true);
			this.$refs.cm.show(event);
		},
        // 		onSelectFile(event){
        // 			this.selectedFiles = event.files;
        // 		},
        loadSnippetDetails(snippetId) {
            try {
                api.get("snippetdetail/data", { page: 1, take: 9999, filter: "snippet_id:=:" + snippetId }).then((data) => {
                    const message = data.message;
                    const success = data.success;
                    const dataList = data.data;
                    if (success) {
                        this.snippetDetails = dataList;
                    }
                    else {
                        this.$toast.add({ severity: "success", summary: "Error", detail: message, life: 5000 });
                    }
                });
            }
            catch (e) {
                this.$toast.add({ severity: "success", summary: "Error", detail: e.response.data.message, life: 5000 });
            }
        },
        updateViewBeadcrumb() {
            this.breadcrumbItems = [];
            if (this.language && this.language.nama) {
                this.breadcrumbItems.push({ label: this.language.nama });
            }
            if (this.category && this.category.nama) {
                this.breadcrumbItems.push({ label: this.category.nama });
            }
            if (this.subCategory && this.subCategory.nama) {
                this.breadcrumbItems.push({ label: this.subCategory.nama });
            }
            if (this.snippet && this.snippet.nama) {
                this.breadcrumbItems.push({ label: this.snippet.nama });
            }
            // console.log( this.breadcrumbItems );
        },
		onShowEditor( newMode ){
			if( !newMode && !this.selectedCode ){
				return;
			}
			this.isNew = newMode;
			if( newMode ){
				this.editorTitle = "Tambah Code";
				this.editing = {};
			}else{
				if( this.selectedCode==null ){
					this.$toast.add({severity:'error', summary: 'Kesalahan Prosedur', detail: "Pilih snippet yang akan di-edit", life: 5000});							
					return;
				}
				this.editorTitle = "Edit Code";
				const mapKeys = ["id", "file", "keterangan", "code"];
				for( let i=0; i<mapKeys.length; i++ ){
					const key = mapKeys[i];
					this.editing[key] = this.selectedCode[key];
				}
				// console.log( this.editing );
			}
			this.showEditor = true;
		},
		onHideEditor(){
			this.showEditor = false;
		},
		onConfirmEditor(){
			try{
				let data = new FormData();
				if( !this.isNew ){
					data.append( "id", this.editing["id"]);
				}
				data.append( "file", this.editing["file"] );
				data.append( "keterangan", this.editing["keterangan"] );
				data.append( "code", this.editing["code"] );
				data.append( "snippet_id", this.snippet.id );
				api.saveForm( 'snippetdetail/save', data ).then( (data) =>{
					if( data.success ){
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
						this.showEditor = false;
						if( !this.isNew ){
							const mapKeys = ["id", "file", "keterangan", "code"];
							for( let i=0; i<mapKeys.length; i++ ){
								const key = mapKeys[i];
								this.selectedCode[key] = data.data[key];
							}
							this.selectedCode.label = this.selectedCode.nama;

							window.Prism = window.Prism || {};
							window.Prism.manual = true;
							Prism.highlightAll();
						}else{
							data.data.label = data.data.nama;
							data.data.icon = "";
							this.snippetDetails.unshift( data.data );

							window.Prism = window.Prism || {};
							window.Prism.manual = true;
							Prism.highlightAll();
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
				message: `Hapus code "${this.selectedCode.nama}" ?`,
				header: "Konfirmasi",
				icon: 'pi pi-exclamation-triangle',
				accept: () => {
					this.showEditor = false;
					try{
						let idLama = this.selectedCode.id;
						api.delete( 'snippetdetail/delete', [this.selectedCode.id] ).then( (data) =>{
							if( data.success ){
								this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
								this.showEditor = false;
								this.snippetDetails = this.snippetDetails.filter(val => val.id !== idLama);
								this.selectedCode = {};
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
	components: { Vue3Prism }
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
