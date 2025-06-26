import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

import { Home, Menu, Star, ScrollText, Repeat, MessageCircleHeart, Film} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navLinks = [
    { to: "/", label: "Watchlist", icon: ScrollText },
    { to: "/recommend", label: "Recommend", icon: MessageCircleHeart },
    { to: "/random", label: "Random", icon: Repeat },
  ];

  return (
    <motion.header 
      className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 relative z-20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo */}
      <motion.div 
        className="flex items-center mr-auto lg:mr-0"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Film className="w-8 h-8 text-rose-red mr-2" />
        <span className="text-xl font-bold gradient-text playfair">FilmPaglu</span>
      </motion.div>

      {/* Theme Toggle - Desktop */}
      <div className="hidden lg:flex items-center ml-auto">
        <ThemeToggle />
      </div>

      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden glass-effect border-rose-red/30 hover:bg-rose-red/20 ml-auto">
            <Menu className="h-6 w-6 text-cream" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="glass-effect border-rose-red/30">
          <div className="grid gap-2 py-6">
            {/* Theme toggle in mobile menu */}
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-cream font-medium">Theme</span>
              <ThemeToggle />
            </div>
            
            {navLinks.map(link => {
              const IconComponent = link.icon;
              return (
                <motion.div
                  key={link.to}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    asChild
                    variant={location.pathname === link.to ? "default" : "ghost"}
                    className={`w-full justify-start transition-all duration-300 ${
                      location.pathname === link.to 
                        ? "bg-rose-red text-cream shadow-lg" 
                        : "text-cream hover:bg-rose-red/20 hover:text-cream"
                    }`}
                  >
                    <Link to={link.to} className="flex items-center">
                      <IconComponent className="w-4 h-4 mr-2" />
                      {link.label}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop nav centered */}
      <nav className="hidden lg:flex gap-2 mx-auto">
        {navLinks.map((link, index) => {
          const IconComponent = link.icon;
          return (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Button
                asChild
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
            </motion.div>
          );
        })}
      </nav>
    </motion.header>
  )
}