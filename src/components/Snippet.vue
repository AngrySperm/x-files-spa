<template>
	<div class="grid" @contextmenu="onRightClick">
		<div class="col-12">
			<Breadcrumb style="margin: 0 0 0.5rem 0" :home="{ icon: 'pi pi-home' }" :model="breadcrumbItems" />
			<div class="card">
				<DataView :value="snippets" layout="grid">
					<template #grid="slotProps">
						<div class="col-12 md:col-3" @contextmenu="onRightClickSnippet($event, slotProps)" >
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

<style>
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

<script>
import api from '../api_service.js';
// import store from '../store.js';

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

	// 		title: 'Total Biaya Telepon',
	// 		apiPath: 'report/biaya',
	// 		jenisBiaya: 'telepon',
	// 		monthNames: [ 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember' ],

	// 		wilayahTxt: "Wilayah",
	// 		depotTxt: "Depot",

	// 		// yearFrom: null,
	// 		yearTo: null,

	// 		selectedBagian: null,
	// 		bagianOptions: null,

	// 		selectedWilayah: null,
	// 		filteredWilayahs: null,
	// 		wilayahs: null,

	// 		selectedDepot: null,
	// 		filteredDepots: null,
	// 		depots: null,

	// 		showWilayah: true,

	// 		datas: [],
	// 		objectColumns: [],
	// 		aliasColumns: [],
	// 		mapTotals: [],

	// 		totalAll: 0,

	// 		chartDatas: {
    //             labels: [],
    //             datasets: []
    //         },
	// 		chartColors: [ '#42A5F5', '#FFA726', '#00bb7e', '#66BB6A', '#FFA726', '#495057', '#ebedef', '#ff0000', '#00ff00', '#0000ff',  ],
	// 		basicOptions: {
    //             plugins: {
    //                 legend: {
    //                     labels: {
    //                         color: '#495057'
    //                     }
    //                 }
    //             },
    //             scales: {
    //                 x: {
    //                     ticks: {
    //                         color: '#495057'
    //                     },
    //                     grid: {
    //                         color: '#ebedef'
    //                     }
    //                 },
    //                 y: {
    //                     ticks: {
    //                         color: '#495057'
    //                     },
    //                     grid: {
    //                         color: '#ebedef'
    //                     }
    //                 }
    //             }
    //         },
		}
	},
	// created() {
	// 	// this.initFilters();
	// },
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
	// async mounted() {
	// 	this.loadWilayah();
	// 	this.loadDepot();

	// 	// this.yearFrom = new Date();
	// 	this.yearTo = new Date();

	// 	this.selectedBagian = this.wilayahTxt;
	// 	this.bagianOptions = [ this.wilayahTxt, this.depotTxt ];
	// },
	methods: {
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
			// console.log( this.selectedFiles[0] );
		},
		loadSnippets( subCategoryId ){
			try{
				api.get( 'snippet/data', { page:1, take:9999, filter: 'sub_kategori_id', value: subCategoryId } ).then( (data) =>{
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
				// let data = {};
				// const mapKeys = ["id", "nama", "keterangan" ];
				// for( let i=0; i<mapKeys.length; i++ ){
				// 	const key = mapKeys[i];
				// 	if( this.isNew && key=="id" ){
				// 		continue;
				// 	}
				// 	data[key] = this.editing[key];
				// }
				// data['sub_kategori_id'] = this.subCategory.id;
				// if( this.selectedFiles && this.selectedFiles.length>0 ){
				// 	data['image'] = this.selectedFiles[0];
				// }
				// if( !this.isNew ){

				// }

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

	// 	//UI RELATED METHODS
	// 	loadWilayah(){
	// 		let user = store.getters.getUser;
	// 		let grup = user.grup;
	// 		this.wilayahs = [];
	// 		try{
	// 			api.getMaster( 'wilayah', { first:0, rows:9999 }, { with_depot: "1" } ).then( (data) =>{
	// 				if( grup=="IT" || grup=="OWNER" ){
	// 					this.wilayahs = data.data;
	// 				}else if( grup=="KAWIL" ){
	// 					for( let i=0; i<data.data.length; i++ ){
	// 						let wilayah = data.data[i];
	// 						if( user.wilayah.id==wilayah.id ){
	// 							this.wilayahs.push( wilayah );
	// 						}
	// 					}
	// 				}else if( grup=="ADMIN" || grup=="KADEPOT" ){
	// 					this.wilayahs = [];
	// 				}

	// 				if( this.wilayahs.length<=0 ){
	// 					this.selectedBagian = this.bagianOptions[1];
	// 					this.showWilayah = false;
	// 				}else if( this.wilayahs.length==1 ){
	// 					this.selectedWilayah = this.wilayahs[0];
	// 				}
	// 			} );
	// 		}catch( e ){
	// 			this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
	// 		}
	// 	},
	// 	loadDepot(){
	// 		let user = store.getters.getUser;
	// 		let grup = user.grup;
	// 		this.depots = [];
	// 		try{
	// 			api.getMaster( 'depot', { first:0, rows:9999 } ).then( (data) =>{
	// 				if( grup=="IT" || grup=="OWNER" ){
	// 					this.depots = data.data;
	// 				}else if( grup=="KAWIL" ){
	// 					for( let i=0; i<data.data.length; i++ ){
	// 						let depot = data.data[i];
	// 						if( user.wilayah.id==depot.wilayah.id ){
	// 							this.depots.push( depot );
	// 						}
	// 					}
	// 				}else if( grup=="KADEPOT" || grup=="ADMIN" ){
	// 					for( let i=0; i<data.data.length; i++ ){
	// 						let depot = data.data[i];
	// 						if( user.depot.id==depot.id ){
	// 							this.depots.push( depot );
	// 						}
	// 					}
	// 				}

	// 				if( this.depots.length==1 ){
	// 					this.selectedDepot = this.depots[0];
	// 				}
	// 			} );
	// 		}catch( e ){
	// 			this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
	// 		}
	// 	},
	// 	searchWilayah( event ){
	// 		if (!event.query.trim().length) {
	// 			this.filteredWilayahs = [...this.wilayahs];
	// 		} else {
	// 			this.filteredWilayahs = this.wilayahs.filter((wilayah) => {
	// 				return wilayah.nama.toLowerCase().includes(event.query.toLowerCase());
	// 			});
	// 		}
	// 	},
	// 	getWilayahById( id ){
	// 		for( let i=0; i<this.wilayahs.length; i++ ){
	// 			let o = this.wilayahs[i];
	// 			if( o.id == id ){
	// 				return o;
	// 			}
	// 		}
	// 		return null;
	// 	},
	// 	searchDepot( event ){
	// 		if (!event.query.trim().length) {
	// 			this.filteredDepots = [...this.depots];
	// 		} else {
	// 			this.filteredDepots = this.depots.filter((depot) => {
	// 				return depot.nama.toLowerCase().includes(event.query.toLowerCase());
	// 			});
	// 		}
	// 	},
	// 	getDepotById( id ){
	// 		for( let i=0; i<this.depots.length; i++ ){
	// 			let o = this.depots[i];
	// 			if( o.id == id ){
	// 				return o;
	// 			}
	// 		}
	// 		return null;
	// 	},
	// 	changeBagian(){
	// 		this.showWilayah = ( this.selectedBagian==this.wilayahTxt );
	// 	},
	// 	formatNumber(value) {
	// 		if( value ){
	// 			let total = value.toString(),
	// 				sisa    = total.length % 3,
	// 				rupiah  = total.substr(0, sisa),
	// 				ribuan  = total.substr(sisa).match(/\d{3}/g);
						
	// 			if (ribuan) {
	// 				let separator = sisa ? ',' : '';
	// 				rupiah += separator + ribuan.join(',');
	// 			}
	// 			return rupiah;
	// 		}
	// 		return '-';
    //     },
	// 	getTitle(){
	// 		let year = "";
	// 		if( this.yearTo ){
	// 			year = this.yearTo.getFullYear();
	// 		}
	// 		let lokasi = "";
	// 		if( this.showWilayah ){
	// 			if( this.selectedWilayah && this.selectedWilayah.nama ){
	// 				lokasi = this.selectedWilayah.nama;
	// 				if( this.selectedWilayah && this.selectedWilayah.depots && this.selectedWilayah.depots.length>0 ){
	// 					lokasi += " (Total " + this.selectedWilayah.depots.length + " Depot)";
	// 				}
	// 			}
	// 		}
	// 		if( !this.showWilayah ){
	// 			if( this.selectedDepot && this.selectedDepot.nama ){
	// 				lokasi = this.selectedDepot.nama;
	// 			}
	// 		}
	// 		return this.title + " Tahun " + year + " di " + lokasi;
		// },

	// 	//REPORT RELATED METHODS
	// 	validateLoad(){
	// 		if( this.showWilayah && !this.selectedWilayah ){
	// 			this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Wilayah tidak boleh kosong", life: 4000});
	// 			return false;
	// 		}
	// 		if( this.showDepot && !this.selectedDepot ){
	// 			this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Depot tidak boleh kosong", life: 4000});
	// 			return false;
	// 		}

	// 		// let yearFromValue = this.yearFrom.getFullYear();
	// 		// let yearToValue = this.yearTo.getFullYear();
	// 		// if( yearFromValue > yearToValue ){
	// 		// 	this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Tahun akhir < tahun awal", life: 4000});
	// 		// 	return false;
	// 		// }

	// 		return true;
	// 	},
	// 	load(){
	// 		const validated = this.validateLoad();

	// 		if( validated ){
	// 			this.datas = [];
	// 			this.objectColumns = [];
	// 			this.mapTotals = [];
	// 			this.aliasColumns = [];
	// 			this.chartDatas.labels = this.monthNames;
	// 			this.chartDatas.datasets = [];
	// 			this.totalAll = 0;

	// 			// let yearFromValue = this.yearFrom.getFullYear();
	// 			let yearToValue = this.yearTo.getFullYear();

	// 			try{
	// 				let params = {
	// 					year_from: yearToValue,
	// 					year_to: yearToValue,
	// 					jenis_biaya: this.jenisBiaya,
	// 				};

	// 				if( this.showWilayah ){
	// 					params['wilayah_id'] = this.selectedWilayah.id;
	// 				}
	// 				if( !this.showWilayah ){
	// 					params['depot_id'] = this.selectedDepot.id;
	// 				}

	// 				api.get( `${this.apiPath}`, params).then( (data) =>{
	// 					if( this.showWilayah ){
	// 						for( let j=0; j<this.selectedWilayah.depots.length; j++ ){
	// 							let depot = this.selectedWilayah.depots[j];
	// 							this.objectColumns.push( depot );
	// 							let alias = depot.kode.replace(" ", "_");
	// 							this.aliasColumns.push( alias );
	// 						}
	// 					}
	// 					if( !this.showWilayah ){
	// 						let depot = this.selectedDepot;
	// 						this.objectColumns.push( depot );
	// 						let alias = depot.kode.replace(" ", "_");
	// 						this.aliasColumns.push( alias );
	// 					}

	// 					for( let i=0; i<12; i++ ){
	// 						let d = {
	// 							month: this.monthNames[i],
	// 						};
	// 						let total = 0;
	// 						for( let j=0; j<data.data.length; j++ ){
	// 							let o = data.data[j];
	// 							let tanggal_transaksi = new Date(o.tanggal_transaksi);

	// 							if( tanggal_transaksi.getMonth()==i ){
	// 								let depot_kode = o.depot_kode;
	// 								let jumlah = o.jumlah;

	// 								let depotAlias = depot_kode.replace(" ", "_");
	// 								d[depotAlias] = jumlah;
	// 								total += jumlah;
	// 								this.mapTotals[depotAlias] = ( this.mapTotals[depotAlias]? this.mapTotals[depotAlias] : 0 ) + d[depotAlias];
	// 							}
	// 						}
	// 						d['total'] = total;
	// 						this.totalAll += total;
	// 						this.datas.push( d );
	// 					}

	// 					for( let i=0; i<this.aliasColumns.length; i++ ){
	// 						let alias = this.aliasColumns[i];
	// 						let datasetData = [];
	// 						for( let j=0; j<this.datas.length; j++ ){
	// 							datasetData.push( this.datas[j][alias] );
	// 						}
	// 						let dataset = {
	// 							label: this.objectColumns[i]? this.objectColumns[i].nama : "",
	// 							data: datasetData,
	// 							fill: false,
	// 							borderColor: this.chartColors[i],
	// 							tension: .4
	// 						};
	// 						this.chartDatas.datasets.push( dataset );
	// 					}

	// 				} );
	// 			}catch( e ){
	// 				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
	// 			}


	// 		}
		},
	// 	exportCSV() {
	// 		this.$refs.dt.exportCSV();
	// 	},
	// }
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
