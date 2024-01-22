import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export const UserSession = async () => {
    return await getServerSession(authOptions);
};