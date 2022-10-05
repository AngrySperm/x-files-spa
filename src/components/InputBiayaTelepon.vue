<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toolbar class="mb-4">
					<template v-slot:start>
						<h4> <i class="pi pi-phone"></i> {{title}}</h4>
					</template>

					<template v-slot:end>
						<div class="my-2">
							<Calendar v-model="selectedYear" class="mt-1 mr-4" view="year" dateFormat="yy" style="width: 12em"/>
							<Button icon="pi pi-refresh" class="p-button-info" @click="load($event)"  />
						</div>
					</template>
				</Toolbar>

				<div class="card-container">
					<div v-for="(biaya,index) in biayas" v-bind:key="index" class="inline-block shadow-4 w-10em mr-5 mb-4 p-4">
						<div class="flex flex-column">
							<h5 class="mb-4"> {{ this.monthNames[index] }} </h5>
							<InputNumber v-model="biaya.jumlah" class="mb-2" style="text-align: right;" @focusin="(event) => event.target.select()" />
							<Button icon="pi pi-save" class="p-button-primary" label="Save" @click="save($event,index)" />							
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>

</template>

<style>
.p-inputnumber-input {
	text-align: right;
}
</style>


<script>
import api from '../api_service.js';
import store from '../store.js';

export default {
	data() {
		return {
			title: 'Input Biaya Telepon',
			tableFieldName: 'biaya',
			field: 'telepon',

			selectedYear: new Date(),

			monthNames: [ 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember' ],
			biayas: [],
		}
	},
	created() {
		// this.initFilters();
	},
	async mounted() {
		this.refreshBiayas();
	},
	methods: {
		refreshBiayas(){			
			this.biayas = [];
			for( let i=0; i<12; i++ ){
				this.biayas.push( { jumlah: 0 } );
			}

			try{
				let user = store.getters.getUser;
				api.get( this.tableFieldName, {
					take: 100,
					page: 1,
					filter: `tanggal_transaksi:startsWith:${this.selectedYear.getFullYear()},jenis_biaya:equals:${this.field},depot_id:equals:${user.depot.id}`,
				} ).then( (data) =>{
					for( let i=0; i<data.data.length; i++ ){
						let biaya = data.data[i];
						let tanggalTxt = biaya.tanggal_transaksi;

						let bulan = parseInt(tanggalTxt.split("-")[1]);
						this.biayas[bulan-1] = biaya;
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		load(  ){
			this.refreshBiayas();
		},
		save( event, index ){
			let biaya = this.biayas[index];
			const transactionDateTxt = this.selectedYear.getFullYear() + "-" + ((index+1)<10? "0" + (index + 1) : (index+1)) + "-01 00:00:00";
			let user = store.getters.getUser;
			biaya['depot_id'] = user.depot.id;
			biaya['tanggal_transaksi'] = transactionDateTxt;
			biaya['jenis_biaya'] = this.field;

			try{
				api.save( this.tableFieldName, biaya ).then( (data) =>{
					if( data.success ){
						this.biayas[index] = data.data;
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
			}
			
		}
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
