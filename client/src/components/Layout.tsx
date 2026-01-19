import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Calendar,
  LogOut, 
  Menu,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/assignments", label: "Assignments", icon: CheckSquare },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 text-primary mb-8">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">UniPlan</span>
        </div>
        
        <div className="mb-6">
          <ThemeToggle />
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block" onClick={() => setIsMobileOpen(false)}>
                <div 
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "" : "opacity-70"}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.firstName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r border-border bg-card/50 backdrop-blur-xl fixed h-screen z-20">
        <NavContent />
      </aside>

      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-30 flex items-center px-4 justify-between">
         <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="w-6 h-6" />
            <span className="font-display font-bold text-lg">UniPlan</span>
         </div>
         <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-16 md:pt-0 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
