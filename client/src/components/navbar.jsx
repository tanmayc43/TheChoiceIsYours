import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom";
import { Home, Menu, Dice6, Star } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/recommend", label: "Recommend", icon: Star },
    { to: "/random", label: "Random", icon: Dice6 },
  ];

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 relative z-20">
      {/* Logo */}
      <div className="flex items-center mr-auto lg:mr-0">
        <span className="text-xl font-bold gradient-text playfair">FilmPaglu</span>
      </div>

      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden glass-effect border-rose-red/30 hover:bg-rose-red/20">
            <Menu className="h-6 w-6 text-cream" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="glass-effect border-rose-red/30">
          <div className="grid gap-2 py-6">
            {navLinks.map(link => {
              const IconComponent = link.icon;
              return (
                <Button
                  asChild
                  variant={location.pathname === link.to ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-300 ${
                    location.pathname === link.to 
                      ? "bg-rose-red text-cream shadow-lg" 
                      : "text-cream hover:bg-rose-red/20 hover:text-cream"
                  }`}
                  key={link.to}
                >
                  <Link to={link.to} className="flex items-center">
                    <IconComponent className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop nav centered */}
      <nav className="hidden lg:flex gap-2 mx-auto">
        {navLinks.map(link => {
          const IconComponent = link.icon;
          return (
            <Button
              asChild
              key={link.to}
              variant={location.pathname === link.to ? "default" : "ghost"}
              className={`transition-all duration-300 transform hover:scale-105 ${
                location.pathname === link.to 
                  ? "bg-rose-red text-cream shadow-lg pulse-glow" 
                  : "text-cream hover:bg-rose-red/20 hover:text-cream glass-effect border-rose-red/20"
              }`}
            >
              <Link to={link.to} className="flex items-center">
                <IconComponent className="w-4 h-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </header>
  )
}