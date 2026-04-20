import { useState, useRef, useEffect, Children } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * Dropdown Component
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - Trigger element
 * @param {React.ReactNode} props.children - Dropdown content
 * @param {string} props.align - Alignment (left|right|center)
 * @param {string} props.className - Additional classes
 * @param {string} props.ariaLabel - ARIA label for dropdown
 */
const Dropdown = ({
  trigger,
  children,
  align = "left",
  className = "",
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const alignments = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const items = menu.querySelectorAll(
      'button:not([disabled]), a:not([aria-disabled="true"])'
    );
    let currentIndex = -1;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          currentIndex = Math.min(currentIndex + 1, items.length - 1);
          items[currentIndex]?.focus();
          break;

        case "ArrowUp":
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, 0);
          items[currentIndex]?.focus();
          break;

        case "Home":
          e.preventDefault();
          currentIndex = 0;
          items[0]?.focus();
          break;

        case "End":
          e.preventDefault();
          currentIndex = items.length - 1;
          items[items.length - 1]?.focus();
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;

        case "Tab":
          setIsOpen(false);
          break;
      }
    };

    // Focus first item when opened
    if (items.length > 0) {
      currentIndex = 0;
      setTimeout(() => items[0]?.focus(), 0);
    }

    menu.addEventListener("keydown", handleKeyDown);
    return () => menu.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on ESC key (for trigger)
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={cn("relative inline-block", className)}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
    >
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          className={cn(
            "absolute top-full mt-2 z-50 min-w-[200px]",
            "bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700",
            "py-1 focus:outline-none",
            alignments[align]
          )}
          tabIndex={-1}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Dropdown Item Component
 */
export const DropdownItem = ({
  children,
  icon,
  onClick,
  href,
  danger = false,
  disabled = false,
  className = "",
  ariaLabel,
}) => {
  const classes = cn(
    "flex items-center gap-3 px-4 py-2 text-sm transition-colors w-full text-left",
    "focus:outline-none focus:bg-blue-50 dark:focus:bg-gray-700 focus:text-blue-700 dark:focus:text-blue-400",
    danger ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
    disabled && "opacity-50 cursor-not-allowed",
    !disabled && "cursor-pointer",
    className
  );

  const content = (
    <>
      {icon && (
        <span className="text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={classes}
        role="option"
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
      role="option"
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
    >
      {content}
    </button>
  );
};

/**
 * Dropdown Divider Component
 */
export const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-200 dark:border-gray-700" />;
};

/**
 * Dropdown Label Component
 */
export const DropdownLabel = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Dropdown;
