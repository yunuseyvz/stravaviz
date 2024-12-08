"use client";
import { ChevronsDown, Github, Menu, ChevronDown, Home, BarChart2, PieChart, Gitlab, Activity, Heart, Calendar } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ToggleTheme } from "./toogle-theme";

interface RouteProps {
  href: string;
  label: string;
  icon: React.ComponentType;
}

const routeList: RouteProps[] = [
  {
    href: "/distance-time",
    label: "Distance - Time",
    icon: Activity,
  },
  {
    href: "/heart-speed",
    label: "Heart Rate - Speed",
    icon: Heart,
  },
  {
    href: "/alt-heart",
    label: "Altitude - Heart Rate",
    icon: BarChart2,
  },
  {
    href: "/times-holidays",
    label: "Times - Holidays",
    icon: Calendar,
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card">
      <Link href="/" className="font-bold text-lg flex items-center">
        <div className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg p-2 border border-secondary">
          <PieChart className="w-6 h-6 text-white" />
        </div>
        <span className="ml-2">InfoVis</span>
      </Link>
     
      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className="text-base px-2 flex items-center hover:text-blue-500">
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="relative group">
            <NavigationMenuTrigger className="text-base px-2 flex items-center hover:text-blue-500">
              Data
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              {routeList.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                >
                  <Icon />
                  <span className="ml-2">{label}</span>
                </Link>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

       {/* <!-- Mobile --> */}
       <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <div className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg p-2 border border-secondary">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <span className="ml-2">InfoVis</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label, icon: Icon }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base flex items-center"
                  >
                    <Link href={href}>
                      <Icon />
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />

              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:flex">
        <ToggleTheme />

        <Button asChild size="sm" variant="ghost" aria-label="View on GitHub">
          <Link
            aria-label="View on GitLab"
            href="https://gitlab.lrz.de/iv2425-projects/team-07"
            target="_blank"
          >
            <Gitlab className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
};