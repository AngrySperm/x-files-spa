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
					
					<Column field="nama" header="Nama" filterField="nama" filterMatchMode="contains" ref="nama" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari nama ..."/>
						</template>
					</Column>
					<Column field="route" header="Route" filterField="route" filterMatchMode="contains" ref="route" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari route ..."/>
						</template>
					</Column>
					<Column field="icon" header="Icon" filterField="icon" filterMatchMode="contains" ref="icon" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari icon ..."/>
						</template>
					</Column>
					<Column field="order" header="Order" filterField="order" filterMatchMode="contains" ref="order" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari order ..."/>
						</template>
					</Column>
					<Column field="is_menu" header="Is Menu" filterField="is_menu" filterMatchMode="contains" ref="is_menu" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari is_menu ..."/>
						</template>
					</Column>
					<Column field="status" header="Status" filterField="status" filterMatchMode="contains" ref="status" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari status ..."/>
						</template>
					</Column>
					<Column field="parent.nama" header="Parent" filterField="parent__nama" filterMatchMode="contains" ref="parent" :sortable="true" style="width:200px; min-width: 200px;">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari parent ..."/>
						</template>
					</Column>

				</DataTable>

				<Dialog v-model:visible="dataDialog" :style="{width: '450px'}" :header="detailDialogTitle" :modal="true" class="p-fluid">
					<div class="field" >
						<label for="nama">Nama</label>
						<InputText id="nama" v-model.trim="data.nama" required="true" autofocus :class="{'p-invalid': submitted && v$.data.nama.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.nama.$error && v$.data.nama.required">Nama kosong.</small>
					</div>
					<div class="field">
						<label for="route">Route</label>
						<InputText id="route" v-model.trim="data.route" :class="{'p-invalid': submitted && v$.data.route.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.route.$error  && v$.data.route.required">Route kosong.</small>
					</div>
					<div class="field">
						<label for="icon">Icon</label>
						<InputText id="icon" v-model.trim="data.icon" :class="{'p-invalid': submitted && v$.data.icon.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.icon.$error  && v$.data.icon.required">Icon kosong.</small>
					</div>
					<div class="field">
						<label for="order">Order</label>
						<InputNumber v-model="data.order" mode="decimal" :class="{'p-invalid': submitted && v$.data.order.$error}" />
						<small class="p-invalid p-error" v-if="submitted && v$.data.order.$error  && v$.data.order.required">Order kosong.</small>
					</div>
					<div class="field">
						<label for="parent">Parent</label>
						<AutoComplete id="parent" v-model="data.parent" :suggestions="filteredParents" @complete="searchParent($event)" :dropdown="true" field="nama" forceSelection>
							<template #item="slotProps">
								<div class="ml-2">{{slotProps.item.nama}}</div>
							</template>
						</AutoComplete>
					</div>
					<div class="flex flex-row field pt-3 row-gap-3">
						<div class="mr-3" >
							<ToggleButton v-model="data.is_menu_value" onLabel="Menu" offLabel="Bukan Menu" onIcon="pi pi-check" offIcon="pi pi-times" />
						</div>
						<div>
							<ToggleButton v-model="data.status_value" onLabel="Aktif" offLabel="Non Aktif" onIcon="pi pi-check" offIcon="pi pi-times" />						
						</div>
					</div>
					<template #footer>
						<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDataDialog"/>
						<Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveData" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteDataDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="data">Menghapus 1 data dari database <b>{{data.name}} </b>, lanjutkan hapus?</span>
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
			title: 'Menu',
			tableFieldName: 'menu',
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
				'nama' : { value: '', matchMode: 'contains'},
				'route' : { value: '', matchMode: 'contains'},
				'icon' : { value: '', matchMode: 'contains'},
				'order' : { value: '', matchMode: 'contains'},
				'is_menu' : { value: '', matchMode: 'contains'},
				'status' : { value: '', matchMode: 'contains'},
				'parent__nama' : { value: '', matchMode: 'contains'},
			},
			lazyParams: {},
			columns: [
				{ field: 'nama', header: 'Nama'},
				{ field: 'route', header: 'Route'},
				{ field: 'icon', header: 'Icon'},
				{ field: 'order', header: 'Order'},
				{ field: 'is_menu', header: 'Is Menu'},
				{ field: 'status', header: 'Status'},
				{ field: 'parent', header: 'Parent'},
			],
			selectedParent: null,
			filteredParents: null,
			parents: null,
		}
	},
	validations:{
		data: {
			nama: { required },
			route: { required },
			icon: { required },
			order: { required },
			is_menu: { required },
			status: { required },
		},
	},
	created() {
		// this.initFilters();
	},
	async mounted() {
		this.loading = true;

		this.loadParent();

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
		loadParent(){
			try{
				api.getMaster( 'menu', { first:0, rows:9999 } ).then( (data) =>{
					this.parents = data.data;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		loadLazyData() {
            this.loading = true;

			try{
				api.getMaster( this.tableFieldName, this.lazyParams, {
					'with_parent' : 1,
				} ).then( (data) =>{
					this.datas = data.data;
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
			this.data = { status_value: false, is_menu_value: false };
			this.submitted = false;
			this.dataDialog = true;
		},
		hideDataDialog() {
			this.dataDialog = false;
			this.subDatated = false;
		},
		async saveData() {
			this.submitted = true;

			let isEdit = false;
			let idLama = this.data.id;
			if( this.data.id )
				isEdit = true;

			if( this.data.parent ){
				this.data["parent_id"] = this.data.parent.id;
			}

			if( this.data.is_menu_value ){
				this.data["is_menu"] = 1;
			}else{
				this.data["is_menu"] = 0;
			}

			if( this.data.status_value ){
				this.data["status"] = 1;
			}else{
				this.data["status"] = 0;
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
			this.data.status_value = data.status === 1;
			this.data.is_menu_value = data.is_menu === 1;
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
		searchParent( event ){
			if ( !event.query.trim().length ) {
				this.filteredParents = [...this.parents];
			} else {
				this.filteredParents = this.parents.filter((parent) => {
					return parent.nama.toLowerCase().includes(event.query.toLowerCase());
				});
			}
		},
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
