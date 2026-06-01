import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { logError } from '../../utils/logger';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error, errorInfo });
    logError('Unhandled application error caught by ErrorBoundary', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>An unexpected error occurred.</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Error</Text>
          <Text style={styles.message}>{error?.message || 'Unknown error'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Stack trace</Text>
          <ScrollView style={styles.stackContainer} contentContainerStyle={styles.stackContent}>
            <Text style={styles.stackText}>{errorInfo?.componentStack || error?.stack || 'No stack available'}</Text>
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.button} onPress={this.handleReset}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#111',
  },
  stackContainer: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  stackContent: {
    padding: 12,
  },
  stackText: {
    fontSize: 12,
    color: '#333',
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
