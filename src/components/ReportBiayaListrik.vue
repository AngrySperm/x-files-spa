<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toolbar class="mb-4">
					<template #start >
						<div class="flex flex-wrap column-gap-3 row-gap-1">
							<SelectButton v-model="selectedBagian" :options="bagianOptions" style="min-width: 170px;" class="flex-grow-1 mt-1" @change="changeBagian($event,$value)" />
							<AutoComplete v-if="showWilayah" v-model="selectedWilayah" :suggestions="filteredWilayahs" @complete="searchWilayah($event)" class="flex-grow-1 mt-1" style="width: 12em;" :dropdown="true" field="nama" forceSelection>
								<template #item="slotProps">
									<div class="ml-2">{{slotProps.item.nama}}</div>
								</template>
							</AutoComplete>
							<AutoComplete v-if="!showWilayah" v-model="selectedDepot" :suggestions="filteredDepots" @complete="searchDepot($event)" class="flex-grow-1 mt-1" style="width: 12em;" :dropdown="true" field="nama" forceSelection>
								<template #item="slotProps">
									<div class="ml-2">{{slotProps.item.nama}}</div>
								</template>
							</AutoComplete>
							<Calendar v-model="yearTo" class="flex-grow-1 mt-1" view="year" dateFormat="yy" style="width: 7em"/>
							<Button icon="pi pi-refresh" class="p-button-primary mt-1" @click="load($event)"  />
						</div>
					</template>

					<template #end>
						<div class="flex flex-wrap gap-3">
							<Button icon="pi pi-print" label="Print" v-print="'#printMe'" class="p-button-info mt-1"  />
							<Button icon="pi pi-upload" class="p-button-info mt-1" @click="exportCSV($event)" />
						</div>
					</template>
				</Toolbar>

				<div id="printMe">
					<h4 class="mb-4"> {{this.getTitle()}}</h4>
	
					<Chart class="mb-4" :height="80" type="line" :data="chartDatas" :options="basicOptions" />	

					<DataTable ref="dt" :value="datas" responsiveLayout="scroll" scrollDirection="both" stripedRows >
						<Column field="month" header="Bulan" footer="Total" frozen></Column>
						<Column v-for="(depot,index) in objectColumns" v-bind:key="index" :field="aliasColumns[index]" :header="depot.nama" :footer="formatNumber(mapTotals[aliasColumns[index]])" class="column-align-right" >
							<template #body="slotProps">
								<!-- {{formatCurrency(slotProps.data)}} -->
								{{ formatNumber(slotProps.data[aliasColumns[index]]) }}
							</template>
						</Column>

						<Column v-if="showWilayah" field="total" header="Total" :footer="formatNumber(totalAll)" class="column-align-right" style="background-color: #E8EAF6" >
							<template #body="slotProps">
								<b>{{ formatNumber(slotProps.data["total"]) }}</b>
							</template>
						</Column>
					</DataTable>
				</div>
			</div>
		</div>
	</div>

</template>

<style>
::v-deep(.col-total) {
    background-color: rgba(0,0,0,.15) !important;
}
/* .align-right{
  text-align:right;
}
.align-center{
  text-align:center;
}
.p-datatable th[class*="align-"] .p-column-header-content {
  display: inline-flex ;
} */
</style>

<script>
import api from '../api_service.js';
import store from '../store.js';

export default {
	data() {
		return {
			title: 'Total Biaya Listrik',
			apiPath: 'report/biaya',
			jenisBiaya: 'listrik',
			monthNames: [ 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember' ],

			wilayahTxt: "Wilayah",
			depotTxt: "Depot",

			// yearFrom: null,
			yearTo: null,

			selectedBagian: null,
			bagianOptions: null,

			selectedWilayah: null,
			filteredWilayahs: null,
			wilayahs: null,

			selectedDepot: null,
			filteredDepots: null,
			depots: null,

			showWilayah: true,

			datas: [],
			objectColumns: [],
			aliasColumns: [],
			mapTotals: [],

			totalAll: 0,

			chartDatas: {
                labels: [],
                datasets: []
            },
			chartColors: [ '#42A5F5', '#FFA726', '#00bb7e', '#66BB6A', '#FFA726', '#495057', '#ebedef', '#ff0000', '#00ff00', '#0000ff',  ],
			basicOptions: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#495057'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#495057'
                        },
                        grid: {
                            color: '#ebedef'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#495057'
                        },
                        grid: {
                            color: '#ebedef'
                        }
                    }
                }
            },
		}
	},
	created() {
		// this.initFilters();
	},
	async mounted() {
		this.loadWilayah();
		this.loadDepot();

		// this.yearFrom = new Date();
		this.yearTo = new Date();

		this.selectedBagian = this.wilayahTxt;
		this.bagianOptions = [ this.wilayahTxt, this.depotTxt ];
	},
	methods: {

		//UI RELATED METHODS
		loadWilayah(){
			let user = store.getters.getUser;
			let grup = user.grup;
			this.wilayahs = [];
			try{
				api.getMaster( 'wilayah', { first:0, rows:9999 }, { with_depot: "1" } ).then( (data) =>{
					if( grup=="IT" || grup=="OWNER" ){
						this.wilayahs = data.data;
					}else if( grup=="KAWIL" ){
						for( let i=0; i<data.data.length; i++ ){
							let wilayah = data.data[i];
							if( user.wilayah.id==wilayah.id ){
								this.wilayahs.push( wilayah );
							}
						}
					}else if( grup=="ADMIN" || grup=="KADEPOT" ){
						this.wilayahs = [];
					}

					if( this.wilayahs.length<=0 ){
						this.selectedBagian = this.bagianOptions[1];
						this.showWilayah = false;
					}else if( this.wilayahs.length==1 ){
						this.selectedWilayah = this.wilayahs[0];
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		loadDepot(){
			let user = store.getters.getUser;
			let grup = user.grup;
			this.depots = [];
			try{
				api.getMaster( 'depot', { first:0, rows:9999 } ).then( (data) =>{
					if( grup=="IT" || grup=="OWNER" ){
						this.depots = data.data;
					}else if( grup=="KAWIL" ){
						for( let i=0; i<data.data.length; i++ ){
							let depot = data.data[i];
							if( user.wilayah.id==depot.wilayah.id ){
								this.depots.push( depot );
							}
						}
					}else if( grup=="KADEPOT" || grup=="ADMIN" ){
						for( let i=0; i<data.data.length; i++ ){
							let depot = data.data[i];
							if( user.depot.id==depot.id ){
								this.depots.push( depot );
							}
						}
					}

					if( this.depots.length==1 ){
						this.selectedDepot = this.depots[0];
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		searchWilayah( event ){
			if (!event.query.trim().length) {
				this.filteredWilayahs = [...this.wilayahs];
			} else {
				this.filteredWilayahs = this.wilayahs.filter((wilayah) => {
					return wilayah.nama.toLowerCase().includes(event.query.toLowerCase());
				});
			}
		},
		getWilayahById( id ){
			for( let i=0; i<this.wilayahs.length; i++ ){
				let o = this.wilayahs[i];
				if( o.id == id ){
					return o;
				}
			}
			return null;
		},
		searchDepot( event ){
			if (!event.query.trim().length) {
				this.filteredDepots = [...this.depots];
			} else {
				this.filteredDepots = this.depots.filter((depot) => {
					return depot.nama.toLowerCase().includes(event.query.toLowerCase());
				});
			}
		},
		getDepotById( id ){
			for( let i=0; i<this.depots.length; i++ ){
				let o = this.depots[i];
				if( o.id == id ){
					return o;
				}
			}
			return null;
		},
		changeBagian(){
			this.showWilayah = ( this.selectedBagian==this.wilayahTxt );
		},
		formatNumber(value) {
			if( value ){
				let total = value.toString(),
					sisa    = total.length % 3,
					rupiah  = total.substr(0, sisa),
					ribuan  = total.substr(sisa).match(/\d{3}/g);
						
				if (ribuan) {
					let separator = sisa ? ',' : '';
					rupiah += separator + ribuan.join(',');
				}
				return rupiah;
			}
			return '-';
        },
		getTitle(){
			let year = "";
			if( this.yearTo ){
				year = this.yearTo.getFullYear();
			}
			let lokasi = "";
			if( this.showWilayah ){
				if( this.selectedWilayah && this.selectedWilayah.nama ){
					lokasi = this.selectedWilayah.nama;
					if( this.selectedWilayah && this.selectedWilayah.depots && this.selectedWilayah.depots.length>0 ){
						lokasi += " (Total " + this.selectedWilayah.depots.length + " Depot)";
					}
				}
			}
			if( !this.showWilayah ){
				if( this.selectedDepot && this.selectedDepot.nama ){
					lokasi = this.selectedDepot.nama;
				}
			}
			return this.title + " Tahun " + year + " di " + lokasi;
		},

		//REPORT RELATED METHODS
		validateLoad(){
			if( this.showWilayah && !this.selectedWilayah ){
				this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Wilayah tidak boleh kosong", life: 4000});
				return false;
			}
			if( this.showDepot && !this.selectedDepot ){
				this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Depot tidak boleh kosong", life: 4000});
				return false;
			}

			// let yearFromValue = this.yearFrom.getFullYear();
			// let yearToValue = this.yearTo.getFullYear();
			// if( yearFromValue > yearToValue ){
			// 	this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Tahun akhir < tahun awal", life: 4000});
			// 	return false;
			// }

			return true;
		},
		load(){
			const validated = this.validateLoad();

			if( validated ){
				this.datas = [];
				this.aliasColumns = [];
				this.objectColumns = [];
				this.mapTotals = [];
				this.chartDatas.labels = this.monthNames;
				this.chartDatas.datasets = [];
				this.totalAll = 0;

				// let yearFromValue = this.yearFrom.getFullYear();
				let yearToValue = this.yearTo.getFullYear();

				try{
					let params = {
						year_from: yearToValue,
						year_to: yearToValue,
						jenis_biaya: this.jenisBiaya,
					};

					if( this.showWilayah ){
						params['wilayah_id'] = this.selectedWilayah.id;
					}
					if( !this.showWilayah ){
						params['depot_id'] = this.selectedDepot.id;
					}

					api.get( `${this.apiPath}`, params).then( (data) =>{
						if( this.showWilayah ){
							for( let j=0; j<this.selectedWilayah.depots.length; j++ ){
								let depot = this.selectedWilayah.depots[j];
								this.objectColumns.push( depot );
								let alias = depot.kode.replace(" ", "_");
								this.aliasColumns.push( alias );
							}
						}
						if( !this.showWilayah ){
							let depot = this.selectedDepot;
							this.objectColumns.push( depot );
							let alias = depot.kode.replace(" ", "_");
							this.aliasColumns.push( alias );
						}

						for( let i=0; i<12; i++ ){
							let d = {
								month: this.monthNames[i],
							};
							let total = 0;
							for( let j=0; j<data.data.length; j++ ){
								let o = data.data[j];
								let tanggal_transaksi = new Date(o.tanggal_transaksi);

								if( tanggal_transaksi.getMonth()==i ){
									let depot_kode = o.depot_kode;
									let jumlah = o.jumlah;

									let depotAlias = depot_kode.replace(" ", "_");
									d[depotAlias] = jumlah;
									total += jumlah;
									this.mapTotals[depotAlias] = ( this.mapTotals[depotAlias]? this.mapTotals[depotAlias] : 0 ) + d[depotAlias];
								}
							}
							d['total'] = total;
							this.totalAll += total;
							this.datas.push( d );
						}

						for( let i=0; i<this.aliasColumns.length; i++ ){
							let alias = this.aliasColumns[i];
							let datasetData = [];
							for( let j=0; j<this.datas.length; j++ ){
								datasetData.push( this.datas[j][alias] );
							}
							let dataset = {
								label: this.objectColumns[i]? this.objectColumns[i].nama : "",
								data: datasetData,
								fill: false,
								borderColor: this.chartColors[i],
								tension: .4
							};
							this.chartDatas.datasets.push( dataset );
						}

					} );
				}catch( e ){
					this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
				}


			}
		},
		exportCSV() {
			this.$refs.dt.exportCSV();
		},
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
