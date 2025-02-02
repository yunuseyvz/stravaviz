"use client";
import { ChevronsDown, Github, Menu, ChevronDown, Home, BarChart2, PieChart, Gitlab, Activity, Heart, Calendar, Info, MapPin, GalleryHorizontal, GalleryThumbnails, Images } from "lucide-react";
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
import ProfileSelector from "./ProfileSelector"; 
import YearSelector from "./YearSelector";
import { useUser } from "@/context/UserContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { selectedUser, selectUser, userSelected } = useUser();

  return (
    <header className="shadow-inner bg-opacity-50 backdrop-blur-2xl w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 -mb-6">
      {/* Left Section: Logo */}
      <Link href="/" className="font-bold text-lg flex items-center">
        <div className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg p-2 border border-secondary">
          <PieChart className="w-6 h-6 text-white" />
        </div>
        <span className="ml-2">StravaViz</span>
      </Link>

      {/* Center Section: ProfileSelector (Desktop) */}
      {userSelected && (
        <div className="hidden lg:flex flex-1 justify-center space-x-4">
          <ProfileSelector />
        </div>
      )}

      {/* Right Section: YearSelector and Other Items (Desktop) */}
      <div className="hidden lg:flex items-center space-x-4 justify-end">
        <ToggleTheme /> 
        <Button asChild size="sm" variant="ghost" aria-label="About">
          <Link href="/gallery">
            <Images className="size-5" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost" aria-label="About">
          <Link href="/about">
            <Info className="size-5" />
          </Link>
        </Button>
      </div>

      {/* Mobile View */}
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

              <div className="flex flex-col gap-4">
                <ProfileSelector />
               </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />
              <ToggleTheme />
              <div className="flex space-x-2 mt-2">
                <Button asChild size="sm" variant="ghost" aria-label="View on GitLab">
                  <Link
                    aria-label="View on GitLab"
                    href="https://gitlab.lrz.de/iv2425-projects/team-07"
                    target="_blank"
                  >
                    <Gitlab className="size-5" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost" aria-label="About">
                  <Link href="/about">
                    <Info className="size-5" />
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
