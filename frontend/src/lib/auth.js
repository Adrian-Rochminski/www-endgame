import CredentialsProvider from 'next-auth/providers/credentials'
import axios from "axios";
import {SERVER_ADDRESS} from "../../utils/Links";

export const authOptions = {
    pages: {
        signIn: '/auth/signin',
        //signOut: '/auth/signout',
    },

    session: {
        strategy: 'jwt'
    },

    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: 'username', type: 'text' },
                password: { label: 'password', type: 'password' }
            },
            async authorize (credentials) {
                console.log('Authorizing...');
                let url = SERVER_ADDRESS + 'login'
                let res = await axios.post(url, credentials, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const user = res.data;
                if (res.status === 200 && user) {
                    return user;
                } else {
                    return null;
                }
            }
        }),
    ],

    callbacks: {
        async jwt({token, user}){
            console.log('JWT Callback:', {token, user});
            if (user) {
                token.accessToken = user.token
                token.username = user.username
            }
            return token
        },
        async session({ session, token, user }) {
            console.log('Session Callback:', { session, token, user });
            session.accessToken = token.accessToken
            user.accessToken = token.accessToken
            user.username = token.username
            return session
        }
    },
}