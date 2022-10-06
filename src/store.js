import { createStore } from 'vuex';

let tag = 'x-files-2210-'

//grup: IT, OWNER, KADEPOT, KAWIL, ADMIN

const store = createStore({

    state: {
        user: null,
        accessToken: null,
    },

    mutations: {
        setUser( state, user ){
            localStorage.setItem( tag + 'user', user);
            state.user = user;
        },

        setAccessToken( state, token ){
            localStorage.setItem( tag + 'access-token', token);
            state.token = token;
        },
    },

    actions: {
        login( {commit}, {accessToken, user} ){
            localStorage.setItem( tag + 'access-token', accessToken);
            localStorage.setItem( tag + 'user', JSON.stringify(user) );
            commit( 'setAccessToken', accessToken );
            commit( 'setUser', JSON.stringify(user) );
        },

        logout( {commit} ){
            localStorage.setItem( tag + 'access-token', '');
            localStorage.setItem( tag + 'user', '');
            commit( 'setAccessToken', '' );
            commit( 'setUser', '' );
        }
    },

    getters: {
        isLoggedIn( state ){
            state.accessToken = '';
            let localToken = localStorage.getItem( tag + 'access-token' );
            if( localToken && localToken.length>0 ){
                state.accessToken = localToken;
            }
            return !!state.accessToken;
        },

        getToken( state ){
            state.accessToken = '';
            let localToken = localStorage.getItem( tag + 'access-token' );
            if( localToken && localToken.length>0 ){
                state.accessToken = localToken;
            }
            return state.accessToken;
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