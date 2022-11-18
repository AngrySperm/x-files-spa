import { createRouter, createWebHashHistory } from 'vue-router';
import store from './store.js';
import App from './App.vue';
import api from './api_service.js';

const routes = [
    {
        path: '/',
        name: 'app',
        component: App,
        children: [
            {
                path: '',
                name: 'snippet',
                component: () => import('./components/Snippet.vue')
            }
            // {
            //     path: '',
            //     name: 'dashboard',
            //     component: () => import('./components/Dashboard.vue')
            // },
            // {
            //     path: '/master-wilayah',
            //     name: 'wilayah',
            //     component: () => import('./components/MasterWilayah.vue')
            // },
            // {
            //     path: '/master-depot',
            //     name: 'depot',
            //     component: () => import('./components/MasterDepot.vue') 
            // },
            // {
            //     path: '/master-grup-user',
            //     name: 'grup-user',
            //     component: () => import('./components/MasterGrupUser.vue')
            // },
            // {
            //     path: '/master-user',
            //     name: 'user',
            //     component: () => import('./components/MasterUser.vue')
            // },
            // {
            //     path: '/master-group',
            //     name: 'group',
            //     component: () => import('./components/MasterGroup.vue')
            // },
            // {
            //     path: '/master-permission',
            //     name: 'permission',
            //     component: () => import('./components/MasterPermission.vue')
            // },
            // {
            //     path: '/master-menu',
            //     name: 'menu',
            //     component: () => import('./components/MasterMenu.vue')
            // },
            // {
            //     path: '/input-biaya-listrik',
            //     name: 'input_biaya_listrik',
            //     component: () => import('./components/InputBiayaListrik.vue')
            // },
            // {
            //     path: '/input-biaya-air',
            //     name: 'input_biaya_air',
            //     component: () => import('./components/InputBiayaAir.vue')
            // },
            // {
            //     path: '/input-biaya-telepon',
            //     name: 'input_biaya_telepon',
            //     component: () => import('./components/InputBiayaTelepon.vue')
            // },
            // {
            //     path: '/input-biaya-internet',
            //     name: 'input_biaya_internet',
            //     component: () => import('./components/InputBiayaInternet.vue')
            // },
            // {
            //     path: '/report-biaya-listrik',
            //     name: 'report_biaya_listrik',
            //     component: () => import('./components/ReportBiayaListrik.vue')
            // },
            // {
            //     path: '/report-biaya-air',
            //     name: 'report_biaya_air',
            //     component: () => import('./components/ReportBiayaAir.vue')
            // },
            // {
            //     path: '/report-biaya-telepon',
            //     name: 'report_biaya_telepon',
            //     component: () => import('./components/ReportBiayaTelepon.vue')
            // },
            // {
            //     path: '/report-biaya-internet',
            //     name: 'report_biaya_internet',
            //     component: () => import('./components/ReportBiayaInternet.vue')
            // },
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('./pages/Login.vue')
    },
    {
        path: '/error',
        name: 'error',
        component: () => import('./pages/Error.vue')
    },
    {
        path: '/notfound',
        name: 'notfound',
        component: () => import('./pages/NotFound.vue')
    },
    {
        path: '/access',
        name: 'access',
        component: () => import('./pages/Access.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});


router.beforeEach( async (to) => {
    const publicPages = ['/login/', '/login'];

    const authRequired = !publicPages.includes(to.path);
    let isLoggedIn = false;

    if( !authRequired ){
        isLoggedIn = true;
    }else{
        try{
            if( store.getters.getUser==null ){
                return '/login';
            }
            await api.refreshToken();
            isLoggedIn = true;
        }catch( e ){
            console.log("Exception On Routing");
            console.log( e );
        }
    }

    if ( authRequired && !isLoggedIn ) {
        return '/login';
    }

});

export default router;
