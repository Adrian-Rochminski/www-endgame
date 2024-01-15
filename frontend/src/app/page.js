import {Button} from "primereact/button";
import {UserSession} from "@/components/Authenticated";
import {LinkButton} from "@/components/Basics";

export default function Home() {
  return (
      <div className="block">
          <p className="text-6xl w-10">ParkingOS</p>
          <UserSession />
          <div className="flex justify-content-between flex-wrap">
              <LinkButton name={"Login"} link={"/auth/signin"} />
              <LinkButton name={"Register"} link={"/auth/register"} />
          </div>
      </div>
  )
}
