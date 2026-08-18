import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const emptyVariants = cva(
  "flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center",
);

const emptyMediaVariants = cva(
  "mb-4 flex items-center justify-center rounded-lg border bg-background shadow-sm [&>svg]:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-12 w-12 [&>svg]:h-6 [&>svg]:w-6",
        icon: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Empty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof emptyVariants>
>(({ className, ...props }, ref) => (
  <div className={cn(emptyVariants(), className)} ref={ref} {...props} />
));
Empty.displayName = "Empty";

const EmptyHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn("flex max-w-sm flex-col items-center", className)}
    ref={ref}
    {...props}
  />
));
EmptyHeader.displayName = "EmptyHeader";

const EmptyMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof emptyMediaVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    className={cn(emptyMediaVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
));
EmptyMedia.displayName = "EmptyMedia";

const EmptyTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    className={cn("text-sm font-semibold tracking-tight", className)}
    ref={ref}
    {...props}
  />
));
EmptyTitle.displayName = "EmptyTitle";

const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn("mt-2 text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));
EmptyDescription.displayName = "EmptyDescription";

const EmptyContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn("mt-5 flex flex-col items-center gap-2", className)}
    ref={ref}
    {...props}
  />
));
EmptyContent.displayName = "EmptyContent";

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
