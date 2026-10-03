import { cva } from "class-variance-authority";

/** Kept outside the client `Button` module so server components can style links with it. */
export const buttonVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover hover:shadow-glow",
        soft: "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft/70",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        outline:
          "border border-input bg-card text-foreground shadow-xs hover:border-foreground/25 hover:bg-subtle",
        ghost: "text-foreground hover:bg-muted",
        inverse: "bg-foreground text-background hover:bg-foreground/85",
        glass:
          "border border-white/25 bg-white/15 text-white backdrop-blur-md hover:bg-white/25",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        "destructive-soft":
          "bg-destructive-soft text-destructive-soft-foreground hover:bg-destructive-soft/70",
        success: "bg-success text-white shadow-xs hover:bg-success/90",
        link: "h-auto rounded-none px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-3 text-xs [&_svg]:size-3.5",
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-xs": "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
