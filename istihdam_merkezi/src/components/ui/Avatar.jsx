import { User } from "lucide-react";
import { cn } from "../../utils/helpers";
import { getInitials } from "../../utils/helpers";

/**
 * Avatar Component
 * @param {Object} props
 * @param {string} props.src - Image source
 * @param {string} props.alt - Alt text
 * @param {string} props.name - Name for initials fallback
 * @param {string} props.size - Avatar size (xs|sm|md|lg|xl)
 * @param {boolean} props.rounded - Use rounded (circle) style
 * @param {string} props.className - Additional classes
 */
const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  rounded = true,
  className = "",
}) => {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    "2xl": "w-10 h-10",
  };

  const classes = cn(
    "inline-flex items-center justify-center bg-gray-200 text-gray-600 font-medium overflow-hidden flex-shrink-0",
    rounded ? "rounded-full" : "rounded-lg",
    sizes[size],
    className
  );

  // Show image if src is provided
  if (src) {
    return (
      <div className={classes}>
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Show initials if name is provided
  if (name) {
    const initials = getInitials(name);
    return (
      <div className={classes} title={name}>
        <span>{initials}</span>
      </div>
    );
  }

  // Fallback to user icon
  return (
    <div className={classes}>
      <User className={iconSizes[size]} />
    </div>
  );
};

/**
 * Avatar Group Component
 */
export const AvatarGroup = ({
  children,
  max = 4,
  size = "md",
  className = "",
}) => {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remaining = Math.max(0, avatars.length - max);

  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          {avatar}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "inline-flex items-center justify-center bg-gray-300 text-gray-700 font-medium rounded-full ring-2 ring-white",
            sizes[size]
          )}
          title={`${remaining} kişi daha`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
