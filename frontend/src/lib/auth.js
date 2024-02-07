import CredentialsProvider from 'next-auth/providers/credentials'
import axios from "axios";
import {SERVER_ADDRESS} from "../../utils/Links";

export const authOptions = {
    pages: {
        signIn: '/auth/signin',
        //signOut: '/auth/signout',
    },

    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: 'username', type: 'text' },
                password: { label: 'password', type: 'password' }
            },
            async authorize (credentials) {
                console.log('Authorizing...');
                let url = SERVER_ADDRESS + '/login'
                let res = await axios.post(url, credentials, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = res.data;
                console.log(data);
                if (res.status === 200 && data) {
                    return {
                        token: data.token,
                        user: data.username,
                        role: data.role
                    };
                } else {
                    return null;
                }
            }
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user.user;
                token.token = user.token;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token.user;
            session.role = token.role;
            session.token = token;
            return session;
        },
    },
}