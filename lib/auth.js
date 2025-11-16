import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

/**
 * Get the session inside a server component or server action
 */
export const getSession = async () => {
  return await getServerSession(authOptions);
};

/**
 * Protect API routes inside the App Router
 */
export const withAuth = (handler) => {
  return async (request) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    return handler(request, session);
  };
};
