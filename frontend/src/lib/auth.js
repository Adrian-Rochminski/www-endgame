import CredentialsProvider from 'next-auth/providers/credentials'
import axios from "axios";

export const authOptions = {
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
    },
    
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: 'username', type: 'text' },
                password: { label: 'password', type: 'password' }
            },
            async authorize (credentials) {
                let url = process.env.BACKEND_URL + 'login'
                let res = await axios.post(url, credentials);
                console.log(res);
                const user = await res.data;
                if (res.status && user) {
                    return user;
                } else {
                    return null;
                }
            }
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token.user;
            return session;
        },
    },
}