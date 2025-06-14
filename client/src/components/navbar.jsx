import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/recommend", label: "Recommend" },
    { to: "/random", label: "Random" },
  ];

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only text-black">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="grid gap-2 py-6">
            {navLinks.map(link => (
              <Button
                asChild
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                className="w-full justify-start"
                key={link.to}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop nav centered */}
      <nav className="hidden lg:flex gap-2 mx-auto">
        {navLinks.map(link => (
          <Button
            asChild
            key={link.to}
            variant={location.pathname === link.to ? "secondary" : "ghost"}
          >
            <Link to={link.to}>{link.label}</Link>
          </Button>
        ))}
      </nav>
    </header>
  )
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

