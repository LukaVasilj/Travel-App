import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  debug: true, // Uključuje dodatne debug poruke u server konzoli
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',       // Prilagođena stranica za prijavu
    error: '/auth/error',   // Prilagođena stranica za error
  },
  callbacks: {
    async jwt({ token, account, user, profile }) {
      console.log("JWT callback pozvan s:", { token, account, user, profile });
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("Session callback pozvan s:", { session, token, user });
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log("signIn callback pozvan s:", { user, account, profile, email, credentials });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect callback pozvan s:", { url, baseUrl });
      return baseUrl;
    },
  },
});
