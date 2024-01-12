import {Button} from "primereact/button";
import {UserSession} from "@/components/Authenticated";

export default function Home() {
  return (
      <div className="block">
          <p className="text-6xl w-10">ParkingOS</p>
          <UserSession />
          <div className="flex justify-content-between flex-wrap">
              <Button className="flex p-button font-bold" label="Login" />
              <Button className="flex p-button font-bold" label="Register" />
          </div>
      </div>
  )
}
