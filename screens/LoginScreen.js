import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = () => {
    navigation.navigate('ResetPassword');
  };

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Validation Error', 'Please enter both Email/Phone and Password');
      return;
    }

    try {
      const response = await fetch('https://api.katsapp.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: emailOrPhone,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Login Response:', {
        success: response.ok,
        hasToken: !!data.token,
        hasUser: !!data.user,
        hasUuid: !!(data.user?.uuid),
        uuid: data.user?.uuid,
        status: response.status
      });

      if (response.ok) {
        try {
          // Store token with Bearer prefix
          const tokenWithBearer = `Bearer ${data.token}`;
          await AsyncStorage.setItem('authToken', tokenWithBearer);
          
          // Store uuid from user object
          if (data.user?.uuid) {
            await AsyncStorage.setItem('uuid', data.user.uuid);
            console.log('Stored credentials:', {
              hasStoredToken: true,
              hasStoredUuid: true,
              storedUuid: data.user.uuid,
              tokenPrefix: 'Bearer ' + data.token.substring(0, 10) + '...'
            });
          } else {
            console.warn('UUID not found in user data');
          }

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main', params: { user: data.user, token: tokenWithBearer } }],
            })
          );
        } catch (storageError) {
          console.error('Storage Error:', storageError);
          Alert.alert('Error', 'Failed to save login credentials. Please try again.');
          return;
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  const handleClear = () => {
    setEmailOrPhone('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="school" size={60} color="#FFF" />
          </View>
          <Text style={styles.headerTitle}>KATS Caretaker</Text>
          <Text style={styles.headerSubtitle}>Welcome back! Please sign in to continue</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email ID / Mobile No <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, emailOrPhone ? styles.inputContainerActive : null]}>
              <MaterialIcons name="person" size={20} color="#2A2A72" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email or phone"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, password ? styles.inputContainerActive : null]}>
              <MaterialIcons name="lock" size={20} color="#2A2A72" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
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

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResetPassword}>
              <Text style={styles.link}>Reset Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <MaterialIcons name="clear" size={20} color="#6B7280" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.loginButton,
                (!emailOrPhone || !password) && styles.loginButtonDisabled
              ]} 
              onPress={handleLogin}
              disabled={!emailOrPhone || !password}
            >
              <MaterialIcons name="login" size={20} color="#FFF" />
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A72',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    transition: 'all 0.3s',
  },
  inputContainerActive: {
    borderColor: '#2A2A72',
    backgroundColor: '#FFF',
    shadowColor: '#2A2A72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 8,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  link: {
    color: '#2A2A72',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#FFF',
  },
  clearButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A72',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#2A2A72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0AEC0',
    elevation: 0,
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});