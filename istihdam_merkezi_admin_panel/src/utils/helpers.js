/**
 * Utility function to merge class names
 * Similar to clsx/classnames but simpler
 * @param {...any} classes - Class names to merge
 * @returns {string} - Merged class names
 */
export const cn = (...classes) => {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'string') {
        return cls;
      }
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, condition]) => condition)
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
};

