import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName = "font-semibold",
      pendingClassName,
      to,
      ...props
    },
    ref
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            // Base
            "relative transition-colors duration-200",

            // Transparent navbar (over hero)
            "text-white/90 hover:text-white",

            // Solid navbar (nav[data-scrolled=true])
            "group-data-[scrolled=true]:text-muted-foreground group-data-[scrolled=true]:hover:text-foreground",

            // Active states
            isActive &&
              "group-data-[scrolled=true]:text-foreground text-white",
            isPending && pendingClassName,

            className
          )
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
