import React from 'react';
import { Text, TextProps } from 'react-native';

interface SafeTextProps extends TextProps {
  children?: React.ReactNode;
  fallback?: string;
}

/**
 * SafeText component that ensures text is always safely rendered
 * Prevents "Text strings must be rendered within a <Text> component" errors
 */
export const SafeText: React.FC<SafeTextProps> = ({ 
  children, 
  fallback = '', 
  style,
  ...props 
}) => {
  // Handle different types of children
  const getSafeText = () => {
    if (children === null || children === undefined) {
      return fallback;
    }
    
    if (typeof children === 'string') {
      return children.trim() || fallback;
    }
    
    if (typeof children === 'number') {
      return children.toString();
    }
    
    if (typeof children === 'boolean') {
      return children.toString();
    }
    
    // For React elements, return as is
    if (React.isValidElement(children)) {
      return children;
    }
    
    // For arrays, filter out invalid elements
    if (Array.isArray(children)) {
      const validChildren = children.filter(child => 
        child !== null && 
        child !== undefined && 
        child !== ''
      );
      
      if (validChildren.length === 0) {
        return fallback;
      }
      
      return validChildren;
    }
    
    // Fallback for any other type
    return fallback;
  };

  const safeText = getSafeText();
  
  // Don't render if no valid content
  if (!safeText && !fallback) {
    return null;
  }

  return (
    <Text style={style} {...props}>
      {safeText}
    </Text>
  );
};

/**
 * Hook to safely get text content
 */
export const useSafeText = (text: any, fallback: string = '') => {
  return React.useMemo(() => {
    if (text === null || text === undefined || text === '') {
      return fallback;
    }
    
    if (typeof text === 'string') {
      return text.trim() || fallback;
    }
    
    if (typeof text === 'number') {
      return text.toString();
    }
    
    return String(text) || fallback;
  }, [text, fallback]);
};
