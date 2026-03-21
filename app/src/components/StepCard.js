import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * StepCard – displays a single step from the solver response.
 *
 * Props:
 *   step        {number}  – step number
 *   description {string}  – human-readable explanation
 *   expression  {string}  – the mathematical expression for this step
 *   isLast      {boolean} – renders with a distinct style when it's the final step
 */
export default function StepCard({ step, description, expression, isLast = false }) {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: isLast
        ? theme.colors.primaryContainer
        : theme.colors.surfaceVariant,
    },
  ];

  return (
    <Card style={cardStyle} mode="contained">
      <Card.Content style={styles.content}>
        {/* Step number badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: isLast ? theme.colors.primary : theme.colors.secondary },
          ]}
        >
          {isLast ? (
            <MaterialCommunityIcons name="check-bold" size={14} color="#FFF" />
          ) : (
            <Text style={styles.badgeText}>{step}</Text>
          )}
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text
            variant="labelMedium"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {description}
          </Text>
          <Text
            variant="bodyLarge"
            style={[
              styles.expression,
              { color: isLast ? theme.colors.primary : theme.colors.onSurface },
            ]}
          >
            {expression}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  description: {
    marginBottom: 4,
    lineHeight: 18,
  },
  expression: {
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
