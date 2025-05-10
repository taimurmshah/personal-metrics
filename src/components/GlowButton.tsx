import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  /**
   * Optional size definition so we can use the same component for different button roles.
   * large ≈ 170px, medium ≈ 120px, small ≈ 85px diameter.
   */
  size?: 'large' | 'medium' | 'small';
  /**
   * Forwarded to the underlying Pressable for testing convenience.
   */
  testID?: string;
}

const SIZE_MAP: Record<NonNullable<GlowButtonProps['size']>, number> = {
  large: 170,
  medium: 120,
  small: 85,
};

const GlowButton: React.FC<GlowButtonProps> = ({ label, onPress, size = 'medium', testID }) => {
  const diameter = SIZE_MAP[size];
  const innerDiameter = diameter - 20; // Create a subtle ring by shrinking the inner circle

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <View
        style={[
          styles.outerCircle,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
          },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: innerDiameter,
              height: innerDiameter,
              borderRadius: innerDiameter / 2,
            },
          ]}
        >
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    // iOS shadow
    shadowColor: '#6366F1',
    shadowOpacity: 0.9,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    // Android shadow
    elevation: 10,
  },
  innerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366F1', // Indigo purple
  },
  label: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 22,
    fontWeight: '600',
  },
});

export default GlowButton; 