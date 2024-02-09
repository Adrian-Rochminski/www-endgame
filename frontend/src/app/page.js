"use client"
import {Button} from "primereact/button";
import {getSession, signIn, signOut, useSession} from "next-auth/react"
import {LinkButton} from "@/components/Basics";
import {MySecondaryButton} from "@/components/MyButtons";

export default async function Home() {
    const session = await getSession();
    let authorized = session != null && session.user != null;


    return (
        <div style={loginContainer}>
            <div style={headerDiv}>
            <p className="text-6xl" style={headerStyle}>ParkingOS</p>
            </div>
            {authorized ?
                <div>
                    <br></br>
                    <br></br>
                    <MySecondaryButton label="Wyloguj się" onClick={() => signOut()}/>
                </div> :
                <div>
                    <LinkButton name={"Zarejestruj się"} link={"/auth/register"}/>
                    <br></br>
                    <br></br>
                    <MySecondaryButton label="Zaloguj się" onClick={() => signIn(undefined, {callbackUrl: '/driver'})}/>
                </div>
            }
        </div>
    )
}

const loginContainer = {
    width: "500px",
    height: "300px",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
}

const headerDiv = {
    marginBottom: "30px",
    textAlign: "center"
}

const headerStyle = {
    color: "black",
    textAlign: "center",

}