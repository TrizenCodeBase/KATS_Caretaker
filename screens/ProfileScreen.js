import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uuid, setUuid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    aadhar: "",
    address: "",
    dob: "",
    role: "caretaker",
    profilePicture: "",
    aadharFrontImage: "",
    aadharBackImage: "",
    id: "",
    uuid: ""
  });

  const navigation = useNavigation();

  const fetchProfileData = async (token, userUuid) => {
    try {
      // Log initial state
      console.log('=== Starting Profile Fetch ===');
      console.log('Initial Auth State:', {
        token: token ? `${token.substring(0, 20)}...` : null,
        uuid: userUuid,
        tokenStartsWithBearer: token?.startsWith('Bearer '),
        tokenLength: token?.length
      });

      if (!token || !userUuid) {
        console.log('Missing auth in fetchProfileData:', { 
          hasToken: !!token, 
          hasUuid: !!userUuid,
          tokenType: typeof token,
          uuidType: typeof userUuid
        });
        setLoading(false);
        return;
      }

      // Validate token format
      if (!token.startsWith('Bearer ')) {
        console.log('Adding Bearer prefix to token');
        token = `Bearer ${token}`;
      }

      // Log request details
      const requestConfig = {
        url: `https://api.katsapp.com/api/caretaker/${userUuid}?uuid=${userUuid}`,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      console.log('Making profile request with:', {
        endpoint: requestConfig.url,
        headers: {
          Authorization: `${token.substring(0, 20)}...`,
          'Content-Type': requestConfig.headers['Content-Type'],
          'Accept': requestConfig.headers['Accept']
        },
        uuid: userUuid
      });

      const response = await axios.get(requestConfig.url, {
        headers: requestConfig.headers
      });

      // Log response details
      console.log('Profile Response:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        success: response.data?.success,
        message: response.data?.message,
        hasUserData: !!response.data?.data
      });

      if (!response.data) {
        console.error('No data in response');
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        console.error('Response indicates failure:', response.data);
        throw new Error(response.data.message || 'Failed to fetch profile data');
      }

      const userData = response.data.data;
      if (!userData) {
        console.error('No user data in successful response');
        throw new Error('No user data in response');
      }

      // Log user data structure
      console.log('User Data Structure:', {
        availableFields: Object.keys(userData),
        hasName: !!userData.name,
        hasEmail: !!userData.email,
        hasPhone: !!userData.phoneNumber,
        hasUuid: !!userData.uuid,
        role: userData.role
      });

      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phoneNumber || "",
        alternatePhone: userData.alternatePhoneNumber || "",
        aadhar: userData.aadharNo?.toString() || "",
        address: userData.address || "",
        dob: userData.dob ? userData.dob.split('T')[0] : "",
        role: userData.role || "caretaker",
        profilePicture: userData.profilePicture || "",
        aadharFrontImage: userData.aadharFrontImage || "",
        aadharBackImage: userData.aadharBackImage || "",
        id: userData._id || "",
        uuid: userData.uuid || ""
      });

      console.log('Successfully loaded and set profile data');

    } catch (error) {
      // Enhanced error logging
      console.error('Profile fetch error details:', {
        message: error.message,
        name: error.name,
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
          headers: error.config?.headers
        }
      });
      
      let errorMessage = 'Failed to load profile data. ';
      if (error.response?.status === 401) {
        errorMessage += 'Please login again.';
        // Clear stored credentials on auth error
        AsyncStorage.multiRemove(['authToken', 'uuid'])
          .then(() => {
            console.log('Cleared stored credentials due to auth error');
            setIsAuthenticated(false);
          })
          .catch(clearError => {
            console.error('Failed to clear credentials:', clearError);
          });
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again.';
      } else {
        errorMessage += error.response?.data?.message || 'Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAuthAndFetchProfile = async () => {
      console.log('=== Starting Auth Load ===');
      try {
        const [storedToken, storedUuid] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('uuid')
        ]);

        console.log('Loaded auth data:', {
          hasToken: !!storedToken,
          tokenStartsWithBearer: storedToken?.startsWith('Bearer '),
          tokenLength: storedToken?.length,
          hasUuid: !!storedUuid,
          uuidLength: storedUuid?.length,
          uuidValue: storedUuid // Safe to log as it's not sensitive
        });

        if (storedToken && storedUuid) {
          setAuthToken(storedToken);
          setUuid(storedUuid);
          setIsAuthenticated(true);
          await fetchProfileData(storedToken, storedUuid);
        } else {
          console.log('Missing credentials:', {
            hasToken: !!storedToken,
            hasUuid: !!storedUuid
          });
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth loading error:', {
          message: error.message,
          stack: error.stack
        });
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    loadAuthAndFetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            console.log('Starting logout process...');
            
            // Get the auth token
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
              console.log('No auth token found, proceeding with local logout');
            } else {
              try {
                // Call logout API
                console.log('Calling logout API...');
                const response = await axios.post(
                  'https://api.katsapp.com/api/logout',
                  {},
                  {
                    headers: {
                      Authorization: token,
                      'Content-Type': 'application/json',
                    }
                  }
                );
                console.log('Logout API response:', {
                  status: response?.status,
                  success: response?.data?.success,
                  message: response?.data?.message
                });
              } catch (apiError) {
                console.error('Logout API error:', {
                  message: apiError.message,
                  response: apiError.response?.data,
                  status: apiError.response?.status
                });
                // Continue with local logout even if API call fails
              }
            }

            // Clear local storage
            console.log('Clearing local storage...');
            await AsyncStorage.multiRemove(['authToken', 'uuid']);
            setIsAuthenticated(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              alternatePhone: "",
              aadhar: "",
              address: "",
              dob: "",
              role: "caretaker",
              profilePicture: "",
              aadharFrontImage: "",
              aadharBackImage: "",
              id: "",
              uuid: ""
            });

            console.log('Logout successful');
            Alert.alert(
              "Success", 
              "You have been logged out successfully",
              [
                {
                  text: "OK",
        onPress: () => {
                    // Navigate to login screen
                    console.log('Navigating to login screen...');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }
                }
              ]
            );
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Save mode
      Alert.alert("Saved", "Profile details updated successfully.");
    }
    setEditMode(!editMode);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#A020F0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {formData.profilePicture ? (
            <Image 
              source={{ uri: formData.profilePicture }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="person" size={40} color="#A020F0" />
            </View>
          )}
          <Text style={styles.profileName}>{formData.name || "Guest User"}</Text>
          <View style={styles.roleBadgeContainer}>
        <Text style={styles.roleBadge}>{formData.role.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
        {[
            ["Name", "name", "person"],
            ["Email", "email", "email"],
            ["Phone Number", "phone", "phone"],
            ["Alternate Number", "alternatePhone", "phone-iphone"],
            ["Date of Birth", "dob", "cake"],
          ].map(([label, field, icon]) => (
          <View key={field} style={styles.infoSection}>
              <View style={styles.labelContainer}>
                <MaterialIcons name={icon} size={20} color="#A020F0" style={styles.icon} />
            <Text style={styles.label}>{label}</Text>
              </View>
              {editMode && isAuthenticated ? (
              <TextInput
                style={styles.input}
                value={formData[field]}
                onChangeText={(text) => handleInputChange(field, text)}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  editable={isAuthenticated}
                />
              ) : (
                <Text style={[styles.value, !isAuthenticated && styles.placeholderText]}>
                  {formData[field] || `No ${label.toLowerCase()} provided`}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          <View style={styles.infoSection}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="location-on" size={20} color="#A020F0" style={styles.icon} />
              <Text style={styles.label}>Address</Text>
            </View>
            {editMode && isAuthenticated ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                editable={isAuthenticated}
              />
            ) : (
              <Text style={[styles.value, !isAuthenticated && styles.placeholderText]}>
                {formData.address || "No address provided"}
              </Text>
            )}
          </View>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.infoSection}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="credit-card" size={20} color="#A020F0" style={styles.icon} />
              <Text style={styles.label}>Aadhar Number</Text>
            </View>
            {editMode && isAuthenticated ? (
              <TextInput
                style={styles.input}
                value={formData.aadhar}
                onChangeText={(text) => handleInputChange('aadhar', text)}
                placeholder="Enter your Aadhar number"
                editable={isAuthenticated}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.value, !isAuthenticated && styles.placeholderText]}>
                {formData.aadhar || "No Aadhar number provided"}
              </Text>
            )}
          </View>

          <View style={styles.documentGrid}>
            <View style={styles.documentCard}>
              {/* <MaterialIcons name="image" size={30} color="#A020F0" /> */}
              <Text style={styles.docLabel}>Aadhar Front</Text>
              {formData.aadharFrontImage ? (
                <Image 
                  source={{ uri: formData.aadharFrontImage }} 
                  style={styles.documentImage} 
                />
              ) : (
                <Text style={styles.uploadText}>Not uploaded</Text>
              )}
            </View>
            <View style={styles.documentCard}>
              {/* <MaterialIcons name="image" size={30} color="#A020F0" /> */}
            <Text style={styles.docLabel}>Aadhar Back</Text>
              {formData.aadharBackImage ? (
                <Image 
                  source={{ uri: formData.aadharBackImage }} 
                  style={styles.documentImage} 
                />
              ) : (
                <Text style={styles.uploadText}>Not uploaded</Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isAuthenticated && (
        <TouchableOpacity
              style={[styles.button, { backgroundColor: editMode ? "#10B981" : "#A020F0" }]}
          onPress={toggleEditMode}
        >
              <MaterialIcons 
                name={editMode ? "check" : "edit"} 
                size={20} 
                color="#FFF" 
                style={styles.buttonIcon} 
              />
              <Text style={styles.buttonText}>{editMode ? "Save Changes" : "Edit Profile"}</Text>
        </TouchableOpacity>
          )}

        <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
            <MaterialIcons name="logout" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#A020F0",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  roleBadgeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadge: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  documentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  documentCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    marginBottom: 12,
  },
  documentImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  uploadText: {
    color: "#9CA3AF",
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#DC2626",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
