import { SidebarTrigger } from "@/components/ui/sidebar"

const AppHeader = () => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg transition-all" />
    </div>
  )
}
export default AppHeader