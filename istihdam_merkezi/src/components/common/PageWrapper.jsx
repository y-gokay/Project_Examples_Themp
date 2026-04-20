import React from "react";
import { useLocation } from "react-router-dom";

const PageWrapper = ({ children }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-in w-full h-full">
      {children}
    </div>
  );
};

export default PageWrapper;
