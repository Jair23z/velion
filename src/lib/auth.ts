import { compare } from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isPremium?: boolean;
            subscriptionPlan?: string;
            subscriptionEndDate?: string;
        } & DefaultSession["user"];
    }
    interface User {
        isPremium?: boolean;
        subscriptionPlan?: string;
        subscriptionEndDate?: string;
    }
    interface JWT {
        id: string;
        isPremium?: boolean;
        subscriptionPlan?: string;
        subscriptionEndDate?: string;
        lastSubscriptionCheck?: number;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    // NOTE: No usar adapter con CredentialsProvider - son incompatibles
    // adapter: PrismaAdapter(prisma),
    trustHost: true,
    session: { 
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            console.log('🔧 JWT Callback ejecutado - Trigger:', trigger, '- User:', !!user, '- TokenID:', token.id);
            
            // Cuando el usuario se loguea por primera vez
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            
            // Si se disparó un update manual (ej: cambio de imagen)
            if (trigger === "update" && session?.image) {
                token.picture = session.image;
            }
            
            // SIEMPRE verificar la suscripción cuando hay un token.id
            // Esto asegura que siempre tengamos datos frescos de la DB
            if (token.id) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        include: {
                            subscriptions: {
                                where: {
                                    status: 'active',
                                    endDate: { gte: new Date() },
                                },
                                orderBy: { endDate: 'desc' },
                                take: 1,
                                include: { plan: true },
                            },
                        },
                    });

                    if (dbUser) {
                        const activeSubscription = dbUser.subscriptions[0];
                        console.log('🔍 Verificando suscripción para:', dbUser.email, '- Premium:', !!activeSubscription);
                        
                        token.isPremium = !!activeSubscription;
                        token.subscriptionPlan = activeSubscription?.plan.name;
                        token.subscriptionEndDate = activeSubscription?.endDate.toISOString();
                        token.picture = dbUser.image;
                        token.name = dbUser.name;
                        token.email = dbUser.email;
                    }
                } catch (error) {
                    console.error('Error loading user subscription:', error);
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.isPremium = token.isPremium as boolean | undefined;
                session.user.subscriptionPlan = token.subscriptionPlan as string | undefined;
                session.user.subscriptionEndDate = token.subscriptionEndDate as string | undefined;
                session.user.image = token.picture as string | null | undefined;
            }
            return session;
        },
    },
});
