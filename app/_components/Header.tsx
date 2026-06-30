"use client"
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MenuOptions = [
  {
    name: "Pricing",
    path: "/pricing",
  },
  {
    name: "Contact us",
    path: "/contact",
  },
];

const Header = () => {
  const { user } = useUser();

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl flex items-center justify-between px-5 py-3 shadow-sm">
      {/* Logo */}
      <div className="flex gap-2.5 items-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
          <Image
            src={"/logo.svg"}
            alt="logo"
            width={30}
            height={30}
            className="relative rounded-lg"
          />
        </div>
        <h2 className="font-bold text-[17px] tracking-tight">
          <span className="hero-gradient-text">AI Creator</span>
        </h2>
      </div>

      {/* Menu */}
      <div className="flex gap-1">
        {MenuOptions.map((menu, index) => (
          <Link href={menu.path} key={index} passHref legacyBehavior>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors hover:bg-accent/50 rounded-lg text-sm font-normal"
            >
              {menu.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* Get Started */}
      <div>
        {!user ? (
          <SignInButton mode="modal" forceRedirectUrl={"/workspace"}>
            <Button className="rounded-full px-5 bg-primary hover:opacity-90 text-primary-foreground shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center gap-1.5 text-sm font-medium">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </SignInButton>
        ) : (
          <Link href={"/workspace"}>
            <Button className="rounded-full px-5 bg-primary hover:opacity-90 text-primary-foreground shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center gap-1.5 text-sm font-medium">
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
export default Header;
