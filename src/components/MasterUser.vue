<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toolbar class="mb-4">
					<template v-slot:start>
						<div class="my-2">
							<Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
							<Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedDatas || !selectedDatas.length" />
						</div>
					</template>

					<template v-slot:end>
						<!-- <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" /> -->
						<Button label="" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)"  />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="datas" :lazy="true" v-model:selection="selectedDatas" dataKey="id" :paginator="true" :rows="5" v-model:filters="filters"
							:totalRecords="totalRecords" :loading="loading" @page="onPage($event)" @sort="onSort($event)" @filter="onFilter($event)"
							filterDisplay="row" :globalFilterFields="['kode','nama']"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25,50,100]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} datas" responsiveLayout="scroll"  scrollDirection="both"
							:selectAll="selectAll" @select-all-change="onSelectAllChange" @row-select="onRowSelect" @row-unselect="onRowUnselect">

					<Column selectionMode="multiple" headerStyle="width: 3em"></Column>

					<Column headerStyle="width:9rem; min-width:9rem;">
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editData(slotProps.data)" />
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteData(slotProps.data)" />
						</template>
					</Column>
					
					<Column field="grup" header="Grup" filterField="grup" filterMatchMode="contains" ref="grup" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari grup ..."/>
						</template>
					</Column>
					<Column field="wilayah.nama" header="Wilayah" filterField="wilayah__nama" filterMatchMode="contains" ref="wilayah" :sortable="true"  style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari wilayah ..."/>
						</template>
					</Column>
					<Column field="depot.nama" header="Depot" filterField="depot__nama" filterMatchMode="contains" ref="depot" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari depot ..."/>
						</template>
					</Column>
					<Column field="jabatan.nama" header="Jabatan" filterField="jabatan__nama" filterMatchMode="contains" ref="jabatan" :sortable="true" style="width:220px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari jabatan ..."/>
						</template>
					</Column>
					<Column field="first_name" header="Nama Depan" filterField="user__first_name" filterMatchMode="contains" ref="first_name" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari nama ..."/>
						</template>
					</Column>
					<Column field="last_name" header="Nama Belakang" filterField="user__last_name" filterMatchMode="contains" ref="last_name" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari nama ..."/>
						</template>
					</Column>
					<Column field="username" header="User Id" filterField="user__username" filterMatchMode="contains" ref="username" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari user id ..."/>
						</template>
					</Column>
					<Column field="email" header="Email" filterField="user__email" filterMatchMode="contains" ref="email" :sortable="true" style="width:200px; min-width: 250px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari email ..."/>
						</template>
					</Column>

				</DataTable>

				<Dialog v-model:visible="dataDialog" :style="{width: '450px'}" :header="detailDialogTitle" :modal="true" class="p-fluid">
					<div class="field">
						<label for="grup">Grup</label>
						<Dropdown v-model="data.grup" :options="grups" optionLabel="name" optionValue="name" placeholder="Pilih Grup" :class="{'p-invalid': submitted && v$.data.grup.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.grup.$error && v$.data.grup.required">Grup kosong.</small>
					</div>
					<div class="field">
						<label for="namaDepan">Nama Depan</label>
						<InputText id="namaDepan" v-model.trim="data.first_name" required="true" autofocus :class="{'p-invalid': submitted && v$.data.first_name.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.first_name.$error && v$.data.first_name.required">Nama depan kosong.</small>
					</div>
					<div class="field">
						<label for="namaBelakang">Nama Belakang</label>
						<InputText id="namaBelakang" v-model.trim="data.last_name" required="true" autofocus :class="{'p-invalid': submitted && v$.data.last_name.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.last_name.$error && v$.data.last_name.required">Nama belakang kosong.</small>
					</div>
					<div class="field">
						<label for="userId">User Id</label>
						<InputText id="userId" v-model.trim="data.username" required="true" autofocus :class="{'p-invalid': submitted && v$.data.username.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.username.$error && v$.data.username.required">User Id kosong.</small>
					</div>
					<div class="field">
						<label for="email">Email</label>
						<InputText id="email" v-model.trim="data.email" required="true" autofocus :class="{'p-invalid': submitted && v$.data.email.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.email.$error && v$.data.email.required">Email kosong.</small>
					</div>
					<div class="field">
						<label for="password">Password</label>
						<Password id="password" v-model="data.password" placeholder="Password" :toggleMask="true" 
							:class="{ 'w-full': true, 'mb-3': true, 'p-invalid': submitted && v$.data.password.$error}" inputClass="w-full" inputStyle="padding:1rem"></Password>
					</div>
					<div class="field">
						<label for="passwordConfirm">Confirm Password</label>
						<Password id="passwordConfirm" v-model="data.password_confirm" placeholder="Password" :toggleMask="true"
							class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>
					</div>
					<div class="field">
						<label for="jabatan">Jabatan</label>
						<AutoComplete id="jabatan" v-model="data.jabatan" :suggestions="filteredJabatans" @complete="searchJabatan($event)" :dropdown="true" field="nama" 
								:class="{'p-invalid': submitted && v$.data.jabatan.$error}" forceSelection>
							<template #item="slotProps">
								<div class="ml-2">{{slotProps.item.nama}}</div>
							</template>
						</AutoComplete>
						<small class="p-invalid p-error" v-if="submitted && v$.data.jabatan.$error && v$.data.jabatan.required">Jabatan kosong.</small>
					</div>
					<div class="field">
						<label for="wilayah">Wilayah</label>
						<AutoComplete id="wilayah" v-model="data.wilayah" :suggestions="filteredWilayahs" @complete="searchWilayah($event)" :dropdown="true" field="nama" 
								:class="{'p-invalid': submitted && v$.data.wilayah.$error}" forceSelection>
							<template #item="slotProps">
								<div class="ml-2">{{slotProps.item.nama}}</div>
							</template>
						</AutoComplete>
						<small class="p-invalid p-error" v-if="submitted && v$.data.wilayah.$error && v$.data.wilayah.required">Wilayah kosong.</small>
					</div>
					<div class="field">
						<label for="depot">Depot</label>
						<AutoComplete id="depot" v-model="data.depot" :suggestions="filteredDepots" @complete="searchDepot($event)" :dropdown="true" field="nama" 
								:class="{'p-invalid': submitted && v$.data.depot.$error}" forceSelection>
							<template #item="slotProps">
								<div class="ml-2">{{slotProps.item.nama}}</div>
							</template>
						</AutoComplete>
						<small class="p-invalid p-error" v-if="submitted && v$.data.depot.$error && v$.data.depot.required">Depot kosong.</small>
					</div>

					<template #footer>
						<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDataDialog"/>
						<Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveData" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteDataDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="data">Menghapus 1 data dari database <b>{{data.username}} </b>, lanjutkan hapus?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDataDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteData" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteDatasDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="data">Menghapus beberapa data terseleksi dari database, lanjutkan hapus?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDatasDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedDatas" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script>
import api from '../api_service.js';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';

export default {
	setup() {
		return { v$: useVuelidate() };
	},
	data() {
		return {
			title: 'User',
			tableFieldName: 'user',
			detailDialogTitle: 'Tambah',
			datas: null,
			dataDialog: false,
			deleteDataDialog: false,
			deleteDatasDialog: false,
			data: {},
			selectedDatas: null,
			submitted: false,
			totalRecords: 0,
			loading: false,
			selectAll: false,
			filters: {
				'grup' : { value: '', matchMode: 'contains'},
				'wilayah__nama' : { value: '', matchMode: 'contains'},
				'depot__nama' : { value: '', matchMode: 'contains'},
				'jabatan__nama' : { value: '', matchMode: 'contains'},
				'user__first_name' : { value: '', matchMode: 'contains'},
				'user__last_name' : { value: '', matchMode: 'contains'},
				'user__username' : { value: '', matchMode: 'contains'},
				'user__email' : { value: '', matchMode: 'contains'},
			},
			lazyParams: {},
			columns: [
				{ field: 'grup', header: 'Grup'},
				{ field: 'wilayah', header: 'Wilayah'},
				{ field: 'depot', header: 'Depot'},
				{ field: 'jabatan', header: 'Jabatan'},
				{ field: 'first_name', header: 'Nama Depan'},
				{ field: 'last_name', header: 'Nama Belakang'},
				{ field: 'username', header: 'User Id'},
				{ field: 'email', header: 'Email'},
			],

			grups: [
				{ name: "IT"},
				{ name: "OWNER"},
				{ name: "KAWIL"},
				{ name: "KADEPOT"},
				{ name: "ADMIN"},
			],

			filteredWilayahs: [],
			wilayahs: null,
			filteredDepots: [],
			depots: null,
			filteredJabatans: [],
			jabatans: null,
		}
	},
	validations:{
		data: {
			username: { required },
			first_name: { required },
			last_name: { required },
			email: { required },
			jabatan: { required },
			wilayah: { required },
			depot: { required },
			grup: { required },
		},
	},
	created() {
		// this.initFilters();
	},
	async mounted() {
		this.loading = true;

		this.loadWilayah();
		this.loadDepot();
		this.loadJabatan();

		this.lazyParams = {
            first: 0,
            rows: this.$refs.dt.rows,
            sortField: null,
            sortOrder: null,
            filters: this.filters
        };

		this.loadLazyData();
	},
	methods: {
		loadWilayah(){
			try{
				api.getMaster( 'wilayah', { first:0, rows:9999 } ).then( (data) =>{
					this.wilayahs = data.data;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		loadDepot(){
			try{
				api.getMaster( 'depot', { first:0, rows:9999 } ).then( (data) =>{
					this.depots = data.data;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		loadJabatan(){
			try{
				api.getMaster( 'jabatan', { first:0, rows:9999 } ).then( (data) =>{
					this.jabatans = data.data;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		loadLazyData() {
            this.loading = true;

			try{
				api.getMaster( this.tableFieldName, this.lazyParams ).then( (data) =>{
					this.datas = data.data;
					for( let i=0; i<this.datas.length; i++ ){
						this.datas[i].jabatan = this.datas[i].detail.jabatan;
						this.datas[i].depot = this.datas[i].detail.depot;
						this.datas[i].wilayah = this.datas[i].detail.wilayah;
					}
					this.totalRecords = data.pagination.total;
					this.loading = false;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
        },
        onPage(event) {
            this.lazyParams = event;
            this.loadLazyData();
        },
        onSort(event) {
            this.lazyParams = event;
            this.loadLazyData();
        },
        onFilter() {
            this.lazyParams.filters = this.filters;
            this.loadLazyData();
        },
        onSelectAllChange(event) {
            const selectAll = event.checked;

            if (selectAll) {
				this.selectAll = true;
				this.selectedDatas = this.datas;
            } else {
                this.selectAll = false;
                this.selectedDatas = [];
            }
        },
        onRowSelect() {
            this.selectAll = this.selectedDatas.length === this.totalRecords
        },
        onRowUnselect() {
            this.selectAll = false;
        },
		formatCurrency(value) {
			if(value)
				return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
			return;
		},
		openNew() {
			this.title = "Tambah";
			this.data = {};
			this.submitted = false;
			this.dataDialog = true;
		},
		hideDataDialog() {
			this.dataDialog = false;
			this.subDatated = false;
		},
		saveData() {
			this.submitted = true;

			let isEdit = false;
			let idLama = this.data.id;
			if( this.data.id )
				isEdit = true;

			if( this.data.jabatan ){
				this.data.jabatan_id = this.data.jabatan.id;
			}

			if( this.data.depot ){
				this.data.depot_id = this.data.depot.id;
			}

			if( this.data.wilayah ){
				this.data.wilayah_id = this.data.wilayah.id;
			}

			if( this.data.password && this.data.password.length>0 ){
				if( !(this.data.password_confirm && this.data.password_confirm.length>0) ){
					this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Konfirmasi password tidak sesuai", life: 4000});
					this.loading = false;
					return;
				}
				if( this.data.password!=this.data.password_confirm ){
					this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Konfirmasi password tidak sesuai", life: 4000});
					this.loading = false;
					return;
				}
				delete this.data.password_confirm;
			}else{
				delete this.data.password;
				delete this.data.password_confirm;
			}


			this.v$.$touch();
			if ( this.v$.$invalid ) {
				return;
			}

			try{
				this.loading = true;
				api.saveMaster( this.tableFieldName, this.data ).then( (data) =>{
					if( data.success ){
						if( isEdit ){
							for( let i=0; i<this.datas.length; i++ ){
								if( this.datas[i].id === idLama ){
									this.datas[i] = data.data;
									break;
								}
							}
							this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
						} else {
							this.datas = [data.data].concat( this.datas );
							this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
						}
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
					this.loading = false;
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
			}

			this.dataDialog = false;
			this.data = {};
		},
		editData(data) {
			this.data = {...data};
			this.dataDialog = true;
		},
		confirmDeleteData(data) {
			this.data = data;
			this.deleteDataDialog = true;
		},
		deleteData() {
			this.loading = true;
			let idLama = this.data.id;
			let ids = [ idLama ];

			try{
				api.deleteMaster( this.tableFieldName, ids ).then( (data) =>{
					if( data.success ){
						this.datas = this.datas.filter(val => val.id !== idLama);
						this.deleteDataDialog = false;
						this.data = {};
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
					this.loading = false;
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
			}
		},
		exportCSV() {
			this.$refs.dt.exportCSV();
		},
		confirmDeleteSelected() {
			this.deleteDatasDialog = true;
		},
		deleteSelectedDatas() {
			this.loading = true;
			let ids = [];
			for( let i=0; i<this.selectedDatas.length; i++ ){
				ids.push( this.selectedDatas[i].id );
			}

			try{
				api.deleteMaster( this.tableFieldName, ids ).then( (data) =>{
					if( data.success ){
						this.datas = this.datas.filter(val => !this.selectedDatas.includes(val));
						this.deleteDatasDialog = false;
						this.selectedDatas = null;
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
					}else{
						this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
					}
					this.loading = false;
				} );
			}catch( e ){
				this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
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
		searchDepot( event ){
			if (!event.query.trim().length) {
				this.filteredDepots = [...this.depots];
			} else {
				this.filteredDepots = this.depots.filter((depot) => {
					return depot.nama.toLowerCase().includes(event.query.toLowerCase());
				});
			}
		},
		searchJabatan( event ){
			if (!event.query.trim().length) {
				this.filteredJabatans = [...this.jabatans];
			} else {
				this.filteredJabatans = this.jabatans.filter((jabatan) => {
					return jabatan.nama.toLowerCase().includes(event.query.toLowerCase());
				});
			}
		},

	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
