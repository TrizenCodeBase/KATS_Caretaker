import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';

export default function LoginScreen({ navigation }) {

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
  if (!emailOrPhone || !password) {
    Alert.alert('Validation Error', 'Please enter Email/Phone and current password');
    return;
  }

  const newPassword = 'NewPassword@123'; // TODO: Get this from user input later

  try {
    const response = await fetch('https://api.katsapp.com/api/reset/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: emailOrPhone,
        oldPassword: password,
        newPassword: newPassword,
      }),
    });

    const result = await response.text(); // Response might not be JSON

    if (response.ok) {
      Alert.alert('Success', 'Password changed successfully!');
    } else {
      Alert.alert('Reset Failed', result || 'Invalid credentials.');
    }
  } catch (error) {
    console.error('Reset Password Error:', error);
    Alert.alert('Error', 'Something went wrong while resetting the password.');
  }
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

    if (response.ok) {
      // Optionally store token using AsyncStorage for later API calls
      // await AsyncStorage.setItem('authToken', data.token);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main', params: { user: data.user, token: data.token } }],
        })
      );
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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Login</Text>
        <Text style={styles.subtext}>Please enter your credentials to login.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email ID / Mobile No <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Password <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.toggle}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.linksContainer}>
          <TouchableOpacity>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetPassword}>
            <Text style={styles.link}>Reset Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    marginLeft: 8,
    fontSize: 16,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  link: {
    color: '#1e90ff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  clearButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
