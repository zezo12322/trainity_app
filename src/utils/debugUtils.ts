import React from 'react';

/**
 * Debug utility to help identify components that might be rendering text directly
 */
export const withTextDebug = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    // Check if any prop might be a problematic text value
    React.useEffect(() => {
      Object.entries(props || {}).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
          console.warn(`${componentName}: Empty string prop "${key}"`);
        }
        if (value === null || value === undefined) {
          console.warn(`${componentName}: Null/undefined prop "${key}"`);
        }
      });
    }, [props]);

    return <Component ref={ref} {...props} />;
  });
};

/**
 * Safe text renderer that prevents empty string errors
 */
export const renderSafeText = (text: any, fallback: string = '') => {
  if (text === null || text === undefined || text === '') {
    return fallback || null;
  }
  
  if (typeof text === 'string') {
    return text.trim() || fallback || null;
  }
  
  if (typeof text === 'number') {
    return text.toString();
  }
  
  return String(text) || fallback || null;
};

/**
 * Hook to safely handle text values
 */
export const useSafeText = (text: any, fallback: string = '') => {
  return React.useMemo(() => {
    return renderSafeText(text, fallback);
  }, [text, fallback]);
};

/**
 * Debug component to wrap suspicious areas
 */
export const DebugWrapper: React.FC<{
  children: React.ReactNode;
  name: string;
}> = ({ children, name }) => {
  React.useEffect(() => {
    if (React.Children.count(children) === 0) {
      console.warn(`${name}: No children provided`);
    }
    
    React.Children.forEach(children, (child, index) => {
      if (typeof child === 'string' && child.trim() === '') {
        console.warn(`${name}: Empty string child at index ${index}`);
      }
      if (child === null || child === undefined) {
        console.warn(`${name}: Null/undefined child at index ${index}`);
      }
    });
  }, [children, name]);

  return <>{children}</>;
};
