import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export const UserSession = async () => {
    let session = await getServerSession(authOptions);
    return (
        <pre>{JSON.stringify(session, null, 2)}</pre>
    )
};