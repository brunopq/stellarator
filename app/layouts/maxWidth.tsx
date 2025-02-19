import { Outlet } from "react-router"

export default function MaxWidth() {
  return (
    <div className="mx-auto mt-6 w-[min(calc(100%-2rem),48rem)]">
      <Outlet />
    </div>
  )
}
