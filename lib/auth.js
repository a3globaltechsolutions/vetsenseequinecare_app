import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export const getSession = async () => {
  return await getServerSession(authOptions);
};

export const withAuth = (handler) => {
  return async (request) => {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    return handler(request);
  };
};
