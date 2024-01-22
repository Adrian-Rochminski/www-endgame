"use client"
import {Button} from "primereact/button";
import { signIn } from "next-auth/react"
import {UserSession} from "@/components/Authenticated";
import {LinkButton} from "@/components/Basics";

export default function Home() {
  return (
      <div className="block">
          <p className="text-6xl w-10">ParkingOS</p>
          <UserSession />
          <div className="flex justify-content-between flex-wrap">
              <Button onClick={() => signIn(undefined, { callbackUrl: '/driver' })}>Zaloguj się</Button>
              <LinkButton name={"Zarejestruj się"} link={"/auth/register"} />
          </div>
      </div>
  )
}
