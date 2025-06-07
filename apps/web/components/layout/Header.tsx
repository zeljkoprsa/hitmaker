import React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isMinimal?: boolean;
  showBackLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMinimal = false, showBackLink = false }) => {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="font-display text-xl font-bold">
            useless
          </Link>
        </div>
        <NavigationMenu className="ml-auto">
          <NavigationMenuList>
            {showBackLink ? (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className={navigationMenuTriggerStyle()}>
                    ← home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ) : (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/journal" className={navigationMenuTriggerStyle()}>
                      Journal
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;

