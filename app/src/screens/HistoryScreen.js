import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Dialog,
  Portal,
  useTheme,
} from 'react-native-paper';

import { useHistory } from '../context/HistoryContext';
import HistoryItem from '../components/HistoryItem';

/**
 * HistoryScreen
 *
 * Displays a scrollable list of previously solved expressions.
 * Each item shows the expression, result, and timestamp.
 * Users can delete individual entries or clear all history at once.
 */
export default function HistoryScreen({ navigation }) {
  const theme = useTheme();
  const { history, clearHistory, removeEntry } = useHistory();

  const [clearDialogVisible, setClearDialogVisible] = useState(false);

  const openClearDialog  = () => setClearDialogVisible(true);
  const closeClearDialog = () => setClearDialogVisible(false);

  const handleClearConfirm = () => {
    clearHistory();
    closeClearDialog();
  };

  /** Navigate to Solver tab and pre-fill the expression */
  const handleItemPress = (item) => {
    navigation.navigate('Solver', { prefill: item.expression });
  };

  const renderItem = ({ item }) => (
    <HistoryItem
      item={item}
      onPress={() => handleItemPress(item)}
      onDelete={() => removeEntry(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        variant="headlineMedium"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
      >
        📋
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
      >
        No history yet.{'\n'}Solve some expressions and they'll appear here.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ── Clear all button ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <View style={[styles.toolbar, { borderBottomColor: theme.colors.outlineVariant }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </Text>
          <Button
            mode="text"
            icon="trash-can-outline"
            onPress={openClearDialog}
            textColor={theme.colors.error}
            compact
          >
            Clear all
          </Button>
        </View>
      )}

      {/* ── History list ─────────────────────────────────────────────────── */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={history.length === 0 ? styles.emptyList : styles.list}
      />

      {/* ── Confirm-clear dialog ─────────────────────────────────────────── */}
      <Portal>
        <Dialog visible={clearDialogVisible} onDismiss={closeClearDialog}>
          <Dialog.Title>Clear history?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will permanently delete all {history.length} history{' '}
              {history.length === 1 ? 'entry' : 'entries'}.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeClearDialog}>Cancel</Button>
            <Button onPress={handleClearConfirm} textColor={theme.colors.error}>
              Clear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
});
