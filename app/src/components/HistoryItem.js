import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';

/**
 * HistoryItem – displays a single entry from the solve history.
 *
 * Props:
 *   item     { id, expression, result, solvedAt } – history entry
 *   onPress  () => void   – called when the card is tapped
 *   onDelete () => void   – called when the delete icon is tapped
 */
export default function HistoryItem({ item, onPress, onDelete }) {
  const theme = useTheme();

  const formattedDate = new Date(item.solvedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      mode="outlined"
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.textContainer}>
          {/* Expression */}
          <Text
            variant="titleMedium"
            style={[styles.expression, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {item.expression}
          </Text>

          {/* Result */}
          <View style={styles.resultRow}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              = {''}
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.result, { color: theme.colors.primary }]}
            >
              {item.result}
            </Text>
          </View>

          {/* Date stamp */}
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {formattedDate}
          </Text>
        </View>

        {/* Delete button */}
        <IconButton
          icon="close"
          size={18}
          iconColor={theme.colors.outline}
          onPress={onDelete}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  expression: {
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  result: {
    fontWeight: '700',
  },
  deleteButton: {
    margin: 0,
  },
});
