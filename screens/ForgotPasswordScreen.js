import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      console.log('Validation Error: Empty email field');
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    console.log('Starting password reset request for email:', email);
    setLoading(true);
    try {
      console.log('Making API request to:', 'https://api.katsapp.com/api/forgot/password/link');
      
      const response = await axios.post('https://api.katsapp.com/api/forgot/password/link', {
        email: email.trim(),
      });

      // Log the complete response for debugging
      console.log('Raw API Response:', {
        status: response?.status,
        data: response?.data,
        headers: response?.headers,
      });

      // Structured logging of the response
      console.log('Password reset API response:', {
        status: response?.status || 'No status',
        statusText: response?.statusText || 'No status text',
        hasData: !!response?.data,
        success: response?.data?.success || (response?.status === 200),
        message: response?.data?.message || 'No message',
      });

      // Check for successful response
      if (response?.status === 200) {
        console.log('Password reset request successful with status:', response.status);
        Alert.alert(
          'Success',
          response?.data?.message || 'Password reset link has been sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating back to login screen');
                navigation.navigate('Login');
              }
            }
          ]
        );
      } else {
        console.error('Password reset failed with response:', {
          status: response?.status || 'No status',
          statusCode: response?.status,
          data: response?.data,
          message: response?.data?.message || 'No message'
        });
        Alert.alert('Error', response?.data?.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Forgot password error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });

      let errorMessage = 'Failed to process request. ';
      if (error.response?.status === 404) {
        errorMessage += 'Email not found.';
        console.error('Email not found in system');
      } else if (error.response?.status === 400) {
        errorMessage += 'Invalid email format.';
        console.error('Invalid email format submitted');
      } else if (error.response?.status === 429) {
        errorMessage += 'Too many attempts. Please try again later.';
        console.error('Rate limit exceeded for password reset');
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
        console.error('Server error during password reset');
      } else {
        errorMessage += error.response?.data?.message || 'Please try again.';
        console.error('Unexpected error during password reset');
      }

      Alert.alert('Error', errorMessage);
    } finally {
      console.log('Password reset request completed');
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="lock-reset" size={80} color="#A020F0" />
        </View>

        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#A020F0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Send Reset Instructions</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <MaterialIcons name="arrow-back" size={20} color="#A020F0" style={styles.buttonIcon} />
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#A020F0',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A020F0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
  },
  backToLoginText: {
    color: '#A020F0',
    fontSize: 16,
    fontWeight: '600',
  },
}); 