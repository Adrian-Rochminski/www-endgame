import CredentialsProvider from 'next-auth/providers/credentials'

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
                let res = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                const user = await res.json();
                if (res.ok && user) {
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