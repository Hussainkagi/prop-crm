// "use client"

// import { useState } from "react"
// import { AppHeader } from "./app-header"
// import { AppNavigation, type NavigationTab } from "./app-navigation"
// import { DashboardPage } from "@/components/dashboard/dashboard-page"
// import { DevelopersPage } from "@/components/developers/developers-page"
// import { ProjectsPage } from "@/components/projects/projects-page"
// import { CustomersPage } from "@/components/customers/customers-page"
// import { CallCenterPage } from "@/components/call-center/call-center-page"
// import { SettingsPage } from "@/components/settings/settings-page"

// export function AppShell() {
//   const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard")

//   const handleSettingsClick = () => {
//     setActiveTab("settings")
//   }

//   const renderContent = () => {
//     switch (activeTab) {
//       case "dashboard":
//         return <DashboardPage />
//       case "developers":
//         return <DevelopersPage />
//       case "projects":
//         return <ProjectsPage />
//       case "customers":
//         return <CustomersPage />
//       case "call-center":
//         return <CallCenterPage />
//       case "settings":
//         return <SettingsPage />
//       default:
//         return <DashboardPage />
//     }
//   }

//   return (
//     <div className="flex min-h-screen flex-col bg-background">
//       <AppHeader onSettingsClick={handleSettingsClick} />
//       <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
//       <main className="flex-1 p-6">{renderContent()}</main>
//     </div>
//   )
// }
