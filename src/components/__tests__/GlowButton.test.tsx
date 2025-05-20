import React from 'react';
import { render } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import GlowButton from '../GlowButton';

describe('GlowButton', () => {
  it('should match snapshot for default (medium) size', () => {
    const tree = render(<GlowButton label="Test" onPress={() => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot for large size', () => {
    const tree = render(<GlowButton label="Test Large" onPress={() => {}} size="large" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot for small size', () => {
    const tree = render(<GlowButton label="Test Small" onPress={() => {}} size="small" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
}); 