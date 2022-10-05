<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toolbar class="mb-4">
					<template v-slot:start>
						<h4>{{title}}</h4>
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="datas" :lazy="true" v-model:selection="selectedDatas" dataKey="id" :paginator="true" :rows="5" v-model:filters="filters"
							:totalRecords="totalRecords" :loading="loading" @page="onPage($event)" @sort="onSort($event)" @filter="onFilter($event)"
							filterDisplay="row" :globalFilterFields="['name']"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25,50,100]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} datas" responsiveLayout="scroll"  scrollDirection="both"
							:selectAll="selectAll" @select-all-change="onSelectAllChange" @row-select="onRowSelect" @row-unselect="onRowUnselect">

					<Column field="name" header="Name" filterField="name" filterMatchMode="contains" ref="name" :sortable="true">
						<template #filter="{filterModel,filterCallback}">
							<InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Cari name ..."/>
						</template>
					</Column>

					<Column headerStyle="min-width:8rem;">
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editData(slotProps.data)" />
							<!-- <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteData(slotProps.data)" /> -->
						</template>
					</Column>
					
				</DataTable>

				<Dialog v-model:visible="dataDialog" :style="{width: '1280px'}" :header="detailDialogTitle" :modal="true" class="p-fluid">
					<div class="field">
						<label for="name">Nama</label>
						<InputText id="name" v-model.trim="data.name" required="true" autofocus :class="{'p-invalid': submitted && !data.name}" />
						<small class="p-invalid" v-if="submitted && !data.name">Nama kosong.</small>
					</div>
					<br>
					<h2>Permission</h2>
					<div v-for="(item) in listMenu" :key="item.id">
						<div v-if="item.route != '#'">
							{{item.nama}}
							<div v-for="(permission, key) in permissions[item.route] ?? []" :key="key">
								<div class="col-12 md:col-4">
									<div class="field-checkbox mb-0">
										<Checkbox :name="item.route + '_' + key" :value="permissions[item.route][key]" v-model="permission_ids"/>
										<label :for="item.route + '_' + key">{{key}}</label>
									</div>
								</div>
							</div>
						</div>
					</div>
					<template #footer>
						<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDataDialog"/>
						<Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveData" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script>
import api from '../api_service.js';

export default {
	data() {
		return {
			title: 'Permission',
			tableFieldName: 'grup',
			detailDialogTitle: 'Permission',
			datas: null,
			dataDialog: false,
			deleteDataDialog: false,
			deleteDatasDialog: false,
			permission_ids: [],
			data: {},
			listMenu : [],
			action : [],
			permissions: [],
			selectedDatas: null,
			submitted: false,
			totalRecords: 0,
			loading: false,
			selectAll: false,
			filters: {
				'name' : { value: '', matchMode: 'contains'},
			},
			lazyParams: {},
			columns: [
				{ field: 'name', header: 'Name'},
			]
		}
	},
	created() {
		// this.initFilters();
	},
	async mounted() {
		this.loading = true;

		this.lazyParams = {
            first: 0,
            rows: this.$refs.dt.rows,
            sortField: null,
            sortOrder: null,
            filters: this.filters
        };

		await this.loadLazyData();
		await this.getListMenu();
		await this.getAction();
		this.generatePermisson();
	},
	methods: {
		async getListMenu() {
			try{
				await api.get('menu', { page:1, take:99999 } ).then( (data) =>{
					this.listMenu = data.data;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		async getAction() {
			try{
				await api.get('authorization/permission', {} ).then( (data) =>{
					this.action = data.data;
				} );
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
		},
		generatePermisson(){
			let permissions = [];
			let action = this.action;

			this.listMenu.forEach(function(menu){
				if(menu.route != "#")
				{
					if(permissions[menu.route] == undefined){
						permissions[menu.route] = {};
					}
					if(menu.is_menu){
						action.forEach(function(act){
							permissions[menu.route][act] = 0;
						});
					}else{
						permissions[menu.route]["action"] = 0;
					}
				}
			});

			this.permissions = permissions;
		},
		loadLazyData() {
            this.loading = true;

			try{
				api.getMaster( this.tableFieldName, this.lazyParams ).then( (data) =>{
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
			this.loading = true;

			let body = {
				group_id: this.data.id,
				permission_ids: this.permission_ids
			};

			try{
				api.saveMaster( "authorization", body ).then( (data) =>{
					if( data.success ){
						this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
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
		async editData(data) {
			this.data = {...data};
			this.permission_ids = [];

			try{
				await api.get('authorization', { group_id:data.id } ).then( (response) =>{
					let list = response.data;
					list.forEach(function(detail){
						let arr = detail.codename.split("_");
						let route = arr[0];
						let action = arr[1];
						this.permissions[route][action] = detail.id;
						if(detail.checked){
							this.permission_ids.push(detail.id);
						}
					}, this);
					this.dataDialog = true;
				});
			}catch( e ){
				this.$toast.add({severity:'success', summary: 'Error', detail: e.response.data.message, life: 5000});
			}
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
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
