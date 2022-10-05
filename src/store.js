import { createStore } from 'vuex';

let tag = 'x-files-2206-'

//grup: IT, OWNER, KADEPOT, KAWIL, ADMIN

const store = createStore({

    state: {
        user: null,
        token: null,
        tokenRefresh: null,
    },

    mutations: {
        setUser( state, user ){
            localStorage.setItem( tag + 'user', user);
            state.user = user;
        },

        setToken( state, token ){
            localStorage.setItem( tag + 'token', token);
            state.token = token;
        },

        setTokenRefresh( state, tokenRefresh ){
            localStorage.setItem( tag + 'token-refresh', tokenRefresh);
            state.tokenRefresh = tokenRefresh;
        }
    },

    actions: {
        login( {commit}, {token, tokenRefresh, user} ){
            localStorage.setItem( tag + 'token', token);
            localStorage.setItem( tag + 'token-refresh', tokenRefresh );
            localStorage.setItem( tag + 'user', JSON.stringify(user) );
            commit( 'setToken', token );
            commit( 'setUser', JSON.stringify(user) );
            commit( 'setTokenRefresh', tokenRefresh );
        },

        logout( {commit} ){
            localStorage.setItem( tag + 'token', '');
            localStorage.setItem( tag + 'token-refresh', '');
            localStorage.setItem( tag + 'user', '');
            commit( 'setToken', '' );
            commit( 'setUser', '' );
            commit( 'setTokenRefresh', '' );
        }
    },

    getters: {
        isLoggedIn( state ){
            state.token = '';
            let localToken = localStorage.getItem( tag + 'token' );
            if( localToken && localToken.length>0 ){
                state.token = localToken;
            }
            return !!state.token;
        },

        getToken( state ){
            state.token = '';
            let localToken = localStorage.getItem( tag + 'token' );
            if( localToken && localToken.length>0 ){
                state.token = localToken;
            }
            return state.token;
        },

        getTokenRefresh( state ){
            state.tokenRefresh = '';
            let localToken = localStorage.getItem( tag + 'token-refresh' );
            if( localToken && localToken.length>0 ){
                state.tokenRefresh = localToken;
            }
            return state.tokenRefresh;
        },

        getUser( state ){
            state.user = null;
            let userJSON = localStorage.getItem( tag + 'user' );
            if( userJSON && userJSON.length>0 ){
                let user = JSON.parse( userJSON );
                if( user!=null ){
                    state.user = user;
                }
            }
            return state.user;
        }
    }
})

export default store