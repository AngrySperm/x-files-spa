<template>
    <div :class="containerClass" @click="onWrapperClick">

        <AppTopBar @menu-toggle="onMenuToggle" />
        <div class="layout-sidebar" @click="onSidebarClick">
            <AppMenu :model="menu" @menuitem-click="onMenuItemClick" />
        </div>

        <div class="layout-main-container">
            <div class="layout-main">
                <router-view />
            </div>
            <AppFooter />
        </div>

		<AppConfig :layoutMode="layoutMode" @layout-change="onLayoutChange" />
        <transition name="layout-mask">
            <div class="layout-mask p-component-overlay" v-if="mobileMenuActive"></div>
        </transition>
	</div>
</template>

<script>

import AppTopBar from './AppTopbar.vue';
import AppMenu from './AppMenu.vue';
import AppConfig from './AppConfig.vue';
import AppFooter from './AppFooter.vue';
import store from './store.js';

// import router from './router.js';

export default {
    emits: ['change-theme'],
    data() {
        let grup = null;
        if( store.getters.getUser ){
            grup = store.getters.getUser.grup;
        }else{
            this.$router.push({ name: 'login' });
            // router.push( 'login' );
            // window.location = '/#/login';
        }

        return {

            layoutMode: 'static',
            staticMenuInactive: false,
            overlayMenuActive: false,
            mobileMenuActive: false,
            menu : [
                {
                    label: 'Home',
                    items: [{
                        label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/'
                    }]
                },
				{
					label: 'Laporan',
					items: [
                        {
                            label: 'Biaya', icon: 'pi pi-fw pi-chart-bar',
                            items: [
                                {label: 'Biaya Listrik', icon: 'pi pi-fw pi-bolt', to: '/report-biaya-listrik'},
                                {label: 'Biaya Air', icon: 'pi pi-fw pi-spinner', to: '/report-biaya-air'},
                                {label: 'Biaya Telepon', icon: 'pi pi-fw pi-phone', to: '/report-biaya-telepon'},
                                {label: 'Biaya Internet', icon: 'pi pi-fw pi-wifi', to: '/report-biaya-internet'},
                            ]
                        },
                        // {
                        //     label: 'Hasil D&P', icon: 'pi pi-fw pi-chart-bar',
                        //     items: [
                        //         {label: 'D&P Rokok', icon: 'pi pi-fw pi-book'},
                        //         {label: 'D&P Kopi', icon: 'pi pi-fw pi-book'}
                        //     ]
                        // },
                        // {
                        //     label: 'Sisa Stok Rokok', icon: 'pi pi-fw pi-chart-bar',
                        //     items: [
                        //         {label: 'Stok Rokok', icon: 'pi pi-fw pi-book'},
                        //         {label: 'Stok Kopi', icon: 'pi pi-fw pi-book'}
                        //     ]
                        // },
                        // {
                        //     label: 'Lain-Lain', icon: 'pi pi-fw pi-chart-bar',
                        //     items: [
                        //         {label: 'Transfer Ke Pusat', icon: 'pi pi-fw pi-book'},
                        //         {label: 'Outlet Aktif', icon: 'pi pi-fw pi-book'},
                        //         {label: 'Retur/Rusak/Usang', icon: 'pi pi-fw pi-book'}
                        //     ]
                        // },
					]
				},
                {
                    label: 'Input Data',
					items: [
                        {
                            label: 'Biaya', icon: 'pi pi-fw pi-pencil',
                            items: [
                                {label: 'Biaya Listrik', icon: 'pi pi-fw pi-bolt', to: '/input-biaya-listrik'},
                                {label: 'Biaya Air', icon: 'pi pi-fw pi-spinner', to: '/input-biaya-air'},
                                {label: 'Biaya Telepon', icon: 'pi pi-fw pi-phone', to: '/input-biaya-telepon'},
                                {label: 'Biaya Internet', icon: 'pi pi-fw pi-wifi', to: '/input-biaya-internet'},
                            ]
                        },
                        // {
                        //     label: 'Hasil D&P', icon: 'pi pi-fw pi-pencil',
                        //     items: [
                        //         {label: 'D&P Rokok', icon: 'pi pi-fw pi-book'},
                        //         {label: 'D&P Kopi', icon: 'pi pi-fw pi-book'}
                        //     ]
                        // },
                        // {
                        //     label: 'Sisa Stok Rokok', icon: 'pi pi-fw pi-pencil',
                        //     items: [
                        //         {label: 'Stok Rokok', icon: 'pi pi-fw pi-book'},
                        //         {label: 'Stok Kopi', icon: 'pi pi-fw pi-book'}
                        //     ]
                        // },
                        // {
                        //     label: 'Lain-Lain', icon: 'pi pi-fw pi-pencil',
                        //     items: [
                        //         {label: 'Transfer Ke Pusat', icon: 'pi pi-fw pi-book'},
                        //         {label: 'Outlet Aktif', icon: 'pi pi-fw pi-book'},
                        //         {label: 'Retur/Rusak/Usang', icon: 'pi pi-fw pi-book'}
                        //     ]
                        // },
					]
                },
                ( grup!==null && ["IT"].indexOf(grup) > -1) ? 
                {
                    label: 'Master Data',
                    items: [
                        // {label: 'Kategori', icon: 'pi pi-fw pi-list'},
                        {label: 'Wilayah', icon: 'pi pi-fw pi-table', to: '/master-wilayah'},
                        {label: 'Depot', icon: 'pi pi-fw pi-th-large', to: '/master-depot'},
                        {
                            label: 'Setting', icon: 'pi pi-fw pi-cog',
                            items: [
                                {label: 'Grup User', icon: 'fa fa-users', to: '/master-grup-user'},
                                {label: 'User', icon: 'pi pi-fw pi-android', to: '/master-user'},
                                {label: 'Menu', icon: 'fa fas fa-bars', to: '/master-menu'},
                                {label: 'Permission', icon: 'fa fas fa-lock', to: '/master-permission'},
                                // {label: 'Group', icon: 'pi pi-fw pi-clone', to: '/master-group'},
                                // {label: 'Permission', icon: 'pi pi-fw pi-shield', to: '/master-permission'},
                            ]
                        },
                    ]
                } : {} ,
            ]
        }
    },
    watch: {
        $route() {
            this.menuActive = false;
            this.$toast.removeAllGroups();
        }
    },
    methods: {
        onWrapperClick() {
            if (!this.menuClick) {
                this.overlayMenuActive = false;
                this.mobileMenuActive = false;
            }

            this.menuClick = false;
        },
        onMenuToggle() {
            this.menuClick = true;

            if (this.isDesktop()) {
                if (this.layoutMode === 'overlay') {
					if(this.mobileMenuActive === true) {
						this.overlayMenuActive = true;
					}

                    this.overlayMenuActive = !this.overlayMenuActive;
					this.mobileMenuActive = false;
                }
                else if (this.layoutMode === 'static') {
                    this.staticMenuInactive = !this.staticMenuInactive;
                }
            }
            else {
                this.mobileMenuActive = !this.mobileMenuActive;
            }

            event.preventDefault();
        },
        onSidebarClick() {
            this.menuClick = true;
        },
        onMenuItemClick(event) {
            if (event.item && !event.item.items) {
                this.overlayMenuActive = false;
                this.mobileMenuActive = false;
            }
        },
		onLayoutChange(layoutMode) {
			this.layoutMode = layoutMode;
		},
        addClass(element, className) {
            if (element.classList)
                element.classList.add(className);
            else
                element.className += ' ' + className;
        },
        removeClass(element, className) {
            if (element.classList)
                element.classList.remove(className);
            else
                element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        },
        isDesktop() {
            return window.innerWidth >= 992;
        },
        isSidebarVisible() {
            if (this.isDesktop()) {
                if (this.layoutMode === 'static')
                    return !this.staticMenuInactive;
                else if (this.layoutMode === 'overlay')
                    return this.overlayMenuActive;
            }

            return true;
        }
    },
    computed: {
        containerClass() {
            return ['layout-wrapper', {
                'layout-overlay': this.layoutMode === 'overlay',
                'layout-static': this.layoutMode === 'static',
                'layout-static-sidebar-inactive': this.staticMenuInactive && this.layoutMode === 'static',
                'layout-overlay-sidebar-active': this.overlayMenuActive && this.layoutMode === 'overlay',
                'layout-mobile-sidebar-active': this.mobileMenuActive,
				'p-input-filled': this.$primevue.config.inputStyle === 'filled',
				'p-ripple-disabled': this.$primevue.config.ripple === false
            }];
        },
        logo() {
            return (this.$appState.darkTheme) ? "images/logo-white.svg" : "images/logo.svg";
        }
    },
    beforeUpdate() {
        if (this.mobileMenuActive)
            this.addClass(document.body, 'body-overflow-hidden');
        else
            this.removeClass(document.body, 'body-overflow-hidden');
    },
    components: {
        'AppTopBar': AppTopBar,
        'AppMenu': AppMenu,
        'AppConfig': AppConfig,
        'AppFooter': AppFooter,
    }
}
</script>

<style lang="scss">
@import './App.scss';
</style>
