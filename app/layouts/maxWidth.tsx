import { Outlet } from "react-router"

import { Sidebar, SidebarProvider } from "~/components/ui/sidebar"

export default function MaxWidth() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen justify-center">
        <Sidebar />

        <div className="mx-auto mt-6 mb-32 w-[min(calc(100%-2rem),64rem)]">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}
