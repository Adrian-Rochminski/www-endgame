"use client"
import {Button} from "primereact/button";
import {getSession, signIn, signOut, useSession} from "next-auth/react"
import {LinkButton} from "@/components/Basics";

export default async function Home() {
    const session = await getSession();
    let authorized = session != null && session.user != null;


    return (
        <div className="block">
            <p className="text-6xl w-10">ParkingOS</p>
            {authorized ?
                <div>
                    <Button onClick={() => signOut()}>Wyloguj się</Button>
                </div> :
                <div className="flex justify-content-between flex-wrap">
                    <Button onClick={() => signIn(undefined, {callbackUrl: '/driver'})}>Zaloguj się</Button>
                    <LinkButton name={"Zarejestruj się"} link={"/auth/register"}/>
                </div>
            }
        </div>
    )
}
