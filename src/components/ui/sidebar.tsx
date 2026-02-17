import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const value: SidebarContextValue = {
    open,
    toggle: () => setOpen(prev => !prev),
    close: () => setOpen(false),
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("Sidebar components must be used within <SidebarProvider>");
  }
  return ctx;
};

export const Sidebar: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, children, ...props }) => {
  const { open, close } = useSidebar();

  const content = (
    <aside
      className={cn(
        "w-72 flex-shrink-0 border-r border-white/40 bg-white/85 backdrop-blur-xl shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transform border-r border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl transition-transform lg:hidden",
          open && "translate-x-0"
        )}
      >
        {children}
      </div>
    </>
  );
};

export const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex-1 overflow-y-auto", className)} {...props} />
);

export const SidebarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("space-y-2", className)} {...props} />
);

export const SidebarGroupContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("space-y-2", className)} {...props} />
);

export const SidebarMenu: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({ className, ...props }) => (
  <ul className={cn("space-y-1", className)} {...props} />
);

export const SidebarMenuItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({ className, ...props }) => (
  <li className={cn("list-none", className)} {...props} />
);

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({ className, children, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
        className,
        (children as React.ReactElement).props.className
      ),
      ...props
    });
  }

  return (
    <button
      type="button"
      className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all", className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("border-b border-white/40", className)} {...props} />
);

export const SidebarTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => {
  const { toggle } = useSidebar();
  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center", className)}
      onClick={() => toggle()}
      {...props}
    >
      {children}
    </button>
  );
};
