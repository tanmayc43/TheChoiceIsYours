import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
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
      {/* Logo - Desktop only */}
      <motion.div 
        className="hidden lg:flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-xl font-bold gradient-text playfair">letterboxdPaglu</span>
      </motion.div>

      {/* Mobile menu - Left side */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden glass-effect border-rose-red/30 hover:bg-rose-red/20">
            <Menu className="h-6 w-6 text-cream" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="glass-effect border-rose-red/30">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu for Film Paglu</SheetDescription>
          <div className="grid gap-2 py-6">
            {/* Logo in mobile menu */}
            <motion.div 
              className="flex items-center justify-start mb-6 ml-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xl font-bold gradient-text playfair">letterboxdPaglu</span>
            </motion.div>
            
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

      {/* Theme Toggle - Right side */}
      <div className="flex items-center ml-auto">
        <ThemeToggle />
      </div>
    </motion.header>
  )
}