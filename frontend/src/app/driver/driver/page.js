import {Button} from "primereact/button";

export default function Home() {
  return (
      <div className="block">
          <p className="text-6xl w-10">ParkingOS</p>
          <div className="flex justify-content-between flex-wrap">
              <Button className="flex" label="Login" />
              <Button className="flex" label="Register" />
          </div>
      </div>
  )
}