import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const ConfirmPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'The password reset link appears to be invalid or expired.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [token, navigation]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      errors: {
        minLength: !minLength ? 'Password must be at least 8 characters long' : null,
        hasUpperCase: !hasUpperCase ? 'Must contain an uppercase letter' : null,
        hasLowerCase: !hasLowerCase ? 'Must contain a lowercase letter' : null,
        hasNumber: !hasNumber ? 'Must contain a number' : null,
        hasSpecialChar: !hasSpecialChar ? 'Must contain a special character' : null,
      }
    };
  };

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Both passwords must match');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      const errors = Object.values(validation.errors).filter(error => error !== null);
      Alert.alert('Password Requirements', errors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.katsapp.com/api/forgot/update/password',
        data: {
          token: token,
          newPassword: newPassword
        },
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        Alert.alert(
          'Success',
          'Your password has been updated successfully',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password. ';
      
      if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
        errorMessage = 'Server is taking too long to respond. Please check your internet connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage += 'Invalid token or password format.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Token has expired.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Token not found.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage += error.response?.data?.message || 'Please try again.';
      }
      
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => handleResetPassword(),
            style: 'default'
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set New Password</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>
            Please enter and confirm your new password
          </Text>

          {/* Token Status */}
          <View style={styles.tokenStatus}>
            <MaterialIcons 
              name={token ? "check-circle" : "error"} 
              size={24} 
              color={token ? "#4CAF50" : "#DC2626"} 
              style={styles.tokenIcon}
            />
            <View style={styles.tokenTextContainer}>
              <Text style={[styles.tokenText, token ? styles.tokenValid : styles.tokenInvalid]}>
                {token ? "Valid reset token received" : "No valid reset token found"}
              </Text>
              {token && (
                <Text style={styles.tokenValue} numberOfLines={1}>
                  Token: {token}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              New Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#2A2A72" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#2A2A72"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirm Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#2A2A72" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementItem}>• Minimum 8 characters</Text>
            <Text style={styles.requirementItem}>• At least one uppercase letter</Text>
            <Text style={styles.requirementItem}>• At least one lowercase letter</Text>
            <Text style={styles.requirementItem}>• At least one number</Text>
            <Text style={styles.requirementItem}>• At least one special character (!@#$%^&*)</Text>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="lock-reset" size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Set New Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A72',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  tokenStatus: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tokenIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tokenTextContainer: {
    flex: 1,
  },
  tokenText: {
    fontSize: 16,
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  tokenValid: {
    color: '#4CAF50',
  },
  tokenInvalid: {
    color: '#DC2626',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A2A72',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2A2A72',
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2A2A72',
  },
  eyeIcon: {
    padding: 8,
  },
  requirements: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A2A72',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A72',
    borderRadius: 25,
    height: 50,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmPasswordScreen; 