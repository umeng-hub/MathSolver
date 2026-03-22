import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import StepCard from '../StepCard';

function renderWithProvider(ui) {
  return render(<PaperProvider theme={MD3LightTheme}>{ui}</PaperProvider>);
}

describe('StepCard', () => {
  it('renders step content for non-final steps', () => {
    const { getByText } = renderWithProvider(
      <StepCard
        step={2}
        description="Apply order of operations"
        expression="2 + (3 * 4)"
      />
    );

    expect(getByText('2')).toBeTruthy();
    expect(getByText('Apply order of operations')).toBeTruthy();
    expect(getByText('2 + (3 * 4)')).toBeTruthy();
  });

  it('renders description and expression for final steps', () => {
    const { getByText } = renderWithProvider(
      <StepCard
        step={3}
        description="Calculate the final result"
        expression="2 + 12 = 14"
        isLast
      />
    );

    expect(getByText('Calculate the final result')).toBeTruthy();
    expect(getByText('2 + 12 = 14')).toBeTruthy();
  });
});
