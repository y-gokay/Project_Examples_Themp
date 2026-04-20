import { useState, useEffect } from "react";

export function usePerformance() {
  const [performance, setPerformance] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const startTime = performance.now();

    // Measure page load time
    if (window.performance && window.performance.timing) {
      const loadTime =
        window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart;
      setPerformance((prev) => ({ ...prev, loadTime }));
    }

    // Measure render time
    const endTime = performance.now();
    setPerformance((prev) => ({ ...prev, renderTime: endTime - startTime }));

    // Measure memory usage (if available)
    if (window.performance && window.performance.memory) {
      const memoryUsage =
        window.performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      setPerformance((prev) => ({ ...prev, memoryUsage }));
    }

    // Monitor performance periodically
    const interval = setInterval(() => {
      if (window.performance && window.performance.memory) {
        const memoryUsage =
          window.performance.memory.usedJSHeapSize / 1024 / 1024;
        setPerformance((prev) => ({ ...prev, memoryUsage }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return performance;
}

