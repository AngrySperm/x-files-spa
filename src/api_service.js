import axios from 'axios';
import store from './store.js';

const API_URL = 'http://x-files.miseven.net/api';
// const API_URL = 'http://103.247.10.221:5100';
let myAxios = null;

export default {
    getAxios(){
        if( !myAxios ){
            myAxios = axios.create();
            myAxios.defaults.timeout = 25000;

            myAxios.interceptors.response.use( function(response){
                return response;
            }, function(error){
                if( error.response.status==401 ){
					store.dispatch( 'logout' );
                    window.location = '/#/login';
                }else{
                    return Promise.reject(error);
                }
            } );
        }
        
        return myAxios;
    },

    async refreshToken(){
        // var body = {
        //             refresh: store.getters.getTokenRefresh,
        //         };

        // const url = `${API_URL}/accounts/token/refresh/`;
        // return this.getAxios().post(url, body ).then( function(response){
        //     const token = response.data.access;
        //     store.commit( 'setToken', token );
        // }, function(error){
        //     error;
        //     console.log("Refresh Token Error");
        //     store.dispatch( 'logout' );
        //     window.location = '/#/login';
        // });
    },

    async login( userId, password ){
        var body = {
                    username: userId,
                    password: password,
                };

        const url = `${API_URL}/login/`;
        return this.getAxios().post(url, body ).then(response => response.data);
    },

    async getMaster( fieldName, params, additionalParams = {} ){
        await this.refreshToken();

        let filters = [];
        if( params.filters ){
            for( const key in params.filters ){
                let singleFilter = params.filters[key];
                if( singleFilter ){
                    if( singleFilter.value && singleFilter.value.length>0 ){
                        let value = singleFilter.value;
                        let typeTxt = singleFilter.matchMode;
                        let txt = key + ":" + typeTxt + ":" + value;
                        filters.push( txt );
                    }
                }
            }
        }

        let filtersTxt = filters.join(',');

        let page = Math.floor(params.first / params.rows) + 1;
        const token = store.getters.getToken; 
        const param = { take: params.rows, page: page, filter: filtersTxt  };

        if( params.sortField && params.sortField!=null ){
            param['order'] = params.sortField.replace(".","__");
            param['order_method'] = params.sortOrder>0? 'ASC' : 'DESC';
        }

        if( additionalParams ){
            for( const key in additionalParams ){
                param[key] = additionalParams[key];                
            }
        }

        const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        const url = `${API_URL}/${fieldName}/`;
        return this.getAxios().get(url, { params: param, headers: headers } ).then(response => response.data);
    },
    async saveMaster( fieldName, data ){
        await this.refreshToken();

        const token = store.getters.getToken; 
        let body = {
            "data": data
        };
        const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        const url = `${API_URL}/${fieldName}/`;
        return this.getAxios().post(url, JSON.stringify(body), { headers: headers } ).then(response => response.data);
    },
    async deleteMaster( fieldName, ids ){
        await this.refreshToken();

        const token = store.getters.getToken; 
        let body = {
            "soft": true,
            "id": ids
        };
        const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        const url = `${API_URL}/${fieldName}/`;
        return this.getAxios().delete(url, { headers: headers, data: body } ).then(response => response.data);
    },

    async get( fieldName, params ){
        await this.refreshToken();

        const token = store.getters.getToken; 
        const param = { };

        if( params ){
            for( const key in params ){
                param[key] = params[key];                
            }
        }
        
        const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        const url = `${API_URL}/${fieldName}/`;
        return this.getAxios().get(url, { params: param, headers: headers } ).then(response => response.data);
    },
    async save( fieldName, data ){
        await this.refreshToken();

        const token = store.getters.getToken; 
        let body = {
            "data": data
        };
        const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        const url = `${API_URL}/${fieldName}/`;
        return this.getAxios().post(url, JSON.stringify(body), { headers: headers } ).then(response => response.data);
    },

}