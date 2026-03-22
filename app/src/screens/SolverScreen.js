import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  TextInput,
  Button,
  Text,
  Divider,
  Switch,
  useTheme,
  Snackbar,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';

import { solveExpression } from '../services/api';
import { useHistory } from '../context/HistoryContext';
import { useAppTheme } from '../context/ThemeContext';
import StepCard from '../components/StepCard';

/**
 * SolverScreen
 *
 * The main screen of the app.
 * Provides an input field for math expressions, a Solve button,
 * a result display area, and a scrollable list of step-by-step cards.
 */
export default function SolverScreen({ navigation }) {
  const theme = useTheme();
  const { isDark, toggleTheme } = useAppTheme();
  const { addEntry } = useHistory();

  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);   // { result, steps, expression }
  const [photoUri, setPhotoUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const scrollRef = useRef(null);

  // Add dark mode toggle to the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
            {isDark ? '🌙' : '☀️'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            color={theme.colors.primary}
            style={styles.switch}
          />
        </View>
      ),
    });
  }, [navigation, isDark, toggleTheme, theme]);

  const handleSolve = async () => {
    if (!expression.trim()) {
      setError('Please enter a math expression');
      setSnackVisible(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const data = await solveExpression(expression.trim());
      setResult(data);
      addEntry(data);
      // Scroll to top of results after a short delay
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (err) {
      setError(err.message);
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setExpression('');
    setResult(null);
    setPhotoUri('');
    setError('');
  };

  const showMessage = (message) => {
    setError(message);
    setSnackVisible(true);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showMessage('Photo library permission is required to upload a problem image.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!picked.canceled && picked.assets?.length) {
      setPhotoUri(picked.assets[0].uri);
      showMessage('Image attached. Type the expression to solve it.');
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showMessage('Camera permission is required to take a photo of the problem.');
      return;
    }

    const captured = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (!captured.canceled && captured.assets?.length) {
      setPhotoUri(captured.assets[0].uri);
      showMessage('Photo captured. Type the expression to solve it.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* ── Input area ─────────────────────────────────────────────────────── */}
      <Surface style={[styles.inputSurface, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <TextInput
          label="Enter a math expression"
          value={expression}
          onChangeText={setExpression}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. sqrt(144), 2^8, sin(pi/2)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={handleSolve}
          right={
            expression.length > 0 ? (
              <TextInput.Icon icon="close" onPress={handleClear} />
            ) : null
          }
        />

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleSolve}
            disabled={loading}
            style={styles.solveButton}
            contentStyle={styles.solveButtonContent}
            icon="calculator"
          >
            {loading ? 'Solving…' : 'Solve'}
          </Button>

          {result && (
            <Button
              mode="outlined"
              onPress={handleClear}
              style={styles.clearButton}
              icon="refresh"
            >
              Clear
            </Button>
          )}
        </View>

        <View style={styles.photoButtonRow}>
          <Button
            mode="outlined"
            onPress={pickFromGallery}
            style={styles.photoButton}
            icon="image"
          >
            Upload photo
          </Button>
          <Button
            mode="outlined"
            onPress={takePhoto}
            style={styles.photoButton}
            icon="camera"
          >
            Take photo
          </Button>
        </View>

        {photoUri ? (
          <View style={styles.photoPreviewWrapper}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <Button
              mode="text"
              icon="close"
              onPress={() => setPhotoUri('')}
              compact
            >
              Remove image
            </Button>
          </View>
        ) : null}
      </Surface>

      {/* ── Results area ───────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              Solving…
            </Text>
          </View>
        )}

        {result && !loading && (
          <>
            {/* Result hero card */}
            <Surface
              style={[
                styles.resultCard,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              elevation={2}
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onPrimaryContainer }}
              >
                {result.expression}
              </Text>
              <Text
                variant="displaySmall"
                style={[styles.resultValue, { color: theme.colors.primary }]}
              >
                {result.result}
              </Text>
            </Surface>

            {/* Steps */}
            <Text
              variant="titleMedium"
              style={[styles.stepsHeader, { color: theme.colors.onSurface }]}
            >
              Step-by-step solution
            </Text>
            <Divider style={styles.divider} />

            {result.steps.map((s, idx) => (
              <StepCard
                key={s.step}
                step={s.step}
                description={s.description}
                expression={s.expression}
                isLast={idx === result.steps.length - 1}
              />
            ))}

            <View style={styles.bottomPad} />
          </>
        )}

        {!result && !loading && (
          <View style={styles.placeholder}>
            <Text
              variant="headlineMedium"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
            >
              🧮
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
            >
              Enter an expression above and tap Solve to see step-by-step solutions.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Error snackbar ─────────────────────────────────────────────────── */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inputSurface: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  solveButton: {
    flex: 1,
  },
  solveButtonContent: {
    height: 44,
  },
  clearButton: {
    flex: 0,
  },
  photoButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  photoButton: {
    flex: 1,
  },
  photoPreviewWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  centered: {
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
  },
  resultCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultValue: {
    marginTop: 8,
    fontWeight: '700',
  },
  stepsHeader: {
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 16,
    fontWeight: '600',
  },
  divider: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  bottomPad: {
    height: 24,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  switch: {
    marginLeft: 4,
  },
});
