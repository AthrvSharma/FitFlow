import React, { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value?: string;
  onChange: (value: string) => void;
  registerItem: (value: string, label: string) => void;
  getLabel: (value?: string) => string | undefined;
}

const SelectContext = createContext<SelectContextValue | null>(null);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ children, value, defaultValue, onValueChange }) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  const currentValue = value ?? internalValue;

  const handleChange = useCallback((newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);

  const registerItem = useCallback((itemValue: string, label: string) => {
    setLabelMap(prev => prev[itemValue] === label ? prev : { ...prev, [itemValue]: label });
  }, []);

  const getLabel = useCallback((val?: string) => {
    if (!val) return undefined;
    return labelMap[val] ?? val;
  }, [labelMap]);

  const contextValue: SelectContextValue = {
    isOpen,
    setIsOpen,
    value: currentValue,
    onChange: handleChange,
    registerItem,
    getLabel,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const useSelectContext = () => {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select components must be used within <Select>");
  }
  return ctx;
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({
  className,
  children,
  ...props
}, ref) => {
  const { isOpen, setIsOpen, value, getLabel } = useSelectContext();
  const fallbackLabel = getLabel(value) ?? "Select an option";

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <span className="flex-1 text-left truncate">{children ?? fallbackLabel}</span>
      <svg
        className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = "Select" }) => {
  const { value, getLabel } = useSelectContext();
  const label = getLabel(value);
  return <span>{label ?? placeholder}</span>;
};

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  const { isOpen } = useSelectContext();
  if (!isOpen) return null;
  return (
    <div
      className={cn(
        "absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, className, children, ...props }) => {
  const { onChange, setIsOpen, registerItem } = useSelectContext();

  React.useEffect(() => {
    const label = typeof children === "string"
      ? children
      : React.isValidElement(children)
        ? React.Children.toArray(children).join(" ")
        : value;
    registerItem(value, label);
  }, [children, registerItem, value]);

  const handleSelect = () => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={cn(
        "cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
