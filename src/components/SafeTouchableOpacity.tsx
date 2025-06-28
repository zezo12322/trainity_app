import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';

interface SafeTouchableOpacityProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

/**
 * Safe TouchableOpacity that prevents "Text strings must be rendered within a <Text> component" errors
 */
export const SafeTouchableOpacity: React.FC<SafeTouchableOpacityProps> = ({
  children,
  ...props
}) => {
  // Process children to ensure text is wrapped in Text components
  const safeChildren = React.useMemo(() => {
    return React.Children.map(children, (child, index) => {
      // If child is a string, number, or other primitive, wrap it in Text
      if (typeof child === 'string') {
        if (child.trim() === '') {
          console.warn('SafeTouchableOpacity: Empty string child detected, skipping');
          return null;
        }
        console.warn('SafeTouchableOpacity: String child detected, wrapping in Text:', child);
        return <Text>{child}</Text>;
      }
      
      if (typeof child === 'number') {
        console.warn('SafeTouchableOpacity: Number child detected, wrapping in Text:', child);
        return <Text>{child}</Text>;
      }
      
      if (typeof child === 'boolean') {
        console.warn('SafeTouchableOpacity: Boolean child detected, wrapping in Text:', child);
        return <Text>{child.toString()}</Text>;
      }
      
      // Skip null, undefined, or empty values
      if (child === null || child === undefined) {
        return null;
      }
      
      // Return React elements as-is
      return child;
    });
  }, [children]);

  // Filter out null values
  const validChildren = safeChildren?.filter(child => child !== null);

  return (
    <TouchableOpacity {...props}>
      {validChildren}
    </TouchableOpacity>
  );
};
