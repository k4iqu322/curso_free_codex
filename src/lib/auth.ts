import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        if (credentials?.email && credentials?.password) {
          return { id: 'user-demo', name: 'Freelancer Demo', email: String(credentials.email) };
        }
        return null;
      }
    })
  ],
  pages: { signIn: '/login' }
});
