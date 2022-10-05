<template>
	<div class="layout-topbar">

		<router-link to="/" class="layout-topbar-logo">
			<img alt="Logo" :src="topbarImage()" />
			<span>Depot Report</span>
		</router-link>
		<button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
			<i class="pi pi-bars"></i>
		</button>

		<button class="p-link layout-topbar-menu-button layout-topbar-button"
			v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', 
			leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true}">
			<i class="pi pi-ellipsis-v"></i>
		</button>
		<ul class="layout-topbar-menu hidden lg:flex origin-top">
			<li>
				<div class="flex flex-column" style="text-align: right;">
					<div><b>{{ getUserName() }}</b></div>
					<div><small>{{ getDepotName() }}</small></div>
				</div>
			</li>
			<li>
				<button class="p-link layout-topbar-button" @click="onShowEditProfile">
					<i class="pi pi-user"></i>
					<span>Profile</span>
				</button>
			</li>
			<li>
				<button class="p-link layout-topbar-button"  @click="onLogout">
					<i class="pi pi-power-off"></i>
					<span>Logout</span>
				</button>
			</li>
		</ul>

		<Dialog v-model:visible="showEditProfile" :style="{width: '450px'}" header="Edit Profile" :modal="true" class="p-fluid">
			<div class="field">
				<label for="namaDepan">Nama Depan</label>
				<InputText id="namaDepan" v-model.trim="profile.first_name" required="true" autofocus :class="{'p-invalid': submitted && !profile.first_name}" />
			</div>
			<div class="field">
				<label for="namaBelakang">Nama Belakang</label>
				<InputText id="namaBelakang" v-model.trim="profile.last_name" :class="{'p-invalid': submitted && !profile.last_name}" />
			</div>
			<div class="field">
				<label for="userId">User Id</label>
				<InputText id="userId" v-model.trim="profile.username" required="true" autofocus :class="{'p-invalid': submitted && !profile.username}" />
				<small class="p-invalid" v-if="submitted && !profile.username">User Id kosong.</small>
			</div>
			<div class="field">
				<label for="email">Email</label>
				<InputText id="email" v-model.trim="profile.email" required="true" autofocus :class="{'p-invalid': submitted && !profile.email}" />
				<small class="p-invalid" v-if="submitted && !profile.email">Email kosong.</small>
			</div>
			<div class="field">
				<label for="password">Password</label>
				<Password id="password" v-model="profile.password" placeholder="Password" :toggleMask="true" 
					class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>
			</div>
			<div class="field">
				<label for="passwordConfirm">Confirm Password</label>
				<Password id="passwordConfirm" v-model="profile.password_confirm" placeholder="Password" :toggleMask="true"
					class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>
			</div>
			<template #footer>
				<Button label="No" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
				<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="onConfirmEditProfile" />
			</template>
		</Dialog>

	</div>
</template>

<script>
import store from './store.js';
import api from './api_service.js';

export default {
	data() {
		return {
			showEditProfile: false,
			profile: {
				id: "",
				first_name: "",
				last_name: "",
				username: "",
				password: "",
				password_confirm: "",
			},
			submitted: false,
			user: {}
		}
	},
    methods: {
		//UI RELATED
        onMenuToggle(event) {
            this.$emit('menu-toggle', event);
        },
		onTopbarMenuToggle(event) {
            this.$emit('topbar-menu-toggle', event);
        },
		topbarImage() {
			return this.$appState.darkTheme ? 'images/logo-white.svg' : 'images/logo-dark.svg';
		},
		onLogout( event ){
			this.$confirm.require({
                target: event.currentTarget,
                message: 'Log out dari aplikasi?',
                icon: 'pi pi-info-circle',
                acceptClass: 'p-button-danger',
                accept: () => {
					store.dispatch( 'logout' );
					this.$router.push("/login");
                },
                reject: () => {
                }
            });
		},
		onShowEditProfile(){
			this.refreshProfileData();
			this.showEditProfile = true;
		},
		hideDialog(){
			this.submitted = false;
			this.showEditProfile = false;
		},
		
		//BUSSINESS LOGIC RELATED
		validateComfirmEditProfile(){
			if( this.profile.password!=this.profile.password_confirm ){
				this.$toast.add({severity:'info', summary: 'Kesalahan Prosedur', detail: "Konfirmasi password tidak sesuai", life: 4000});
				return false;
			}

			return true;
		},
		onConfirmEditProfile(){
			if( this.validateComfirmEditProfile() ){
				this.submitted = false;

				try{
					let data = {
						id: this.profile.id,
						first_name: this.profile.first_name,
						last_name: this.profile.last_name,
						username: this.profile.username,
						email: this.profile.email,
						jabatan_id: this.profile.jabatan.id,
						depot_id: this.profile.depot.id,
						wilayah_id: this.profile.wilayah.id
					};

					if( this.profile.password.length>0 ){
						data['password'] = this.profile.password;
					}

					api.save( 'user', data ).then( (data) =>{
						if( data.success ){
							store.commit( 'setUser', JSON.stringify(data.data) );
							this.$toast.add({severity:'success', summary: 'Info', detail: data.message, life: 3000});
							this.showEditProfile = false;
						}else{
							this.$toast.add({severity:'error', summary: 'Error', detail: data.message, life: 5000});							
						}
					} );
				}catch( e ){
					this.$toast.add({severity:'error', summary: 'Ex - Error', detail: e.response.data.message, life: 5000});
				}

			}
		},
		refreshProfileData(){
			let user = store.getters.getUser;

			this.profile.id = user.id;
			this.profile.email = user.email;
			this.profile.first_name = user.first_name;
			this.profile.last_name = user.last_name;
			this.profile.username = user.username;
			this.profile.password = "";
			this.profile.password_confirm = "";
			this.profile.jabatan = user.jabatan;
			this.profile.depot = user.depot;
			this.profile.wilayah = user.wilayah;

			this.user = user;
		},
		getUserName(){
			return this.user.first_name + " " + this.user.last_name;
		},
		getDepotName(){
			let result = "";
			if(this.user.depot ){
				result += this.user.depot.nama;
			}
			if( this.user.grup ){
				result += " ( " + this.user.grup + " )"; 
			}
			return result;
		}

    },
	computed: {
		darkTheme() {
			return this.$appState.darkTheme;
		}
	},
	async mounted() {
		this.refreshProfileData();
	}	
}
</script>