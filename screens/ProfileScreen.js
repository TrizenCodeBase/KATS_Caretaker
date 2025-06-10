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
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {formData.profilePicture ? (
                  <Image 
                    source={{ uri: formData.profilePicture }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <MaterialIcons name="person" size={44} color="#2C2A7C" />
                  </View>
                )}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.profileName}>{formData.name || "Guest User"}</Text>
                <View style={styles.roleBadgeContainer}>
                  <MaterialIcons name="verified-user" size={16} color="#FFFFFF" style={styles.roleIcon} />
                  <Text style={styles.roleBadge}>CARETAKER</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Quick Actions */}
          {isAuthenticated && (
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, editMode ? styles.saveActionButton : styles.editActionButton]} 
                onPress={toggleEditMode}
                activeOpacity={0.8}
              >
                <MaterialIcons 
                  name={editMode ? "check-circle" : "edit"} 
                  size={22} 
                  color={editMode ? "#FFFFFF" : "#2C2A7C"} 
                />
                <Text style={[styles.actionButtonText, editMode && styles.saveActionButtonText]}>
                  {editMode ? "Save Changes" : "Edit Profile"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Personal Information Section */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={24} color="#2C2A7C" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          {[
            ["Name", "name", "person"],
            ["Email Address", "email", "email"],
            ["Phone Number", "phone", "phone"],
            ["Alternate Phone", "alternatePhone", "phone-iphone"],
            ["Date of Birth", "dob", "event"],
          ].map(([label, field, icon], index) => (
            <View key={field} style={[styles.card, { marginBottom: 12 }]}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={icon} size={24} color="#2C2A7C" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  {editMode && isAuthenticated ? (
                    <TextInput
                      style={styles.input}
                      value={formData[field]}
                      onChangeText={(text) => handleInputChange(field, text)}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      placeholderTextColor="#A0A0A0"
                      editable={isAuthenticated}
                    />
                  ) : (
                    <Text style={styles.fieldValue}>
                      {formData[field] || `No ${label.toLowerCase()} provided`}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Address Section */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="location-on" size={24} color="#2C2A7C" />
            <Text style={styles.sectionTitle}>Address Details</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="home" size={24} color="#2C2A7C" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Residential Address</Text>
                {editMode && isAuthenticated ? (
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    placeholder="Enter your complete address"
                    placeholderTextColor="#A0A0A0"
                    multiline
                    numberOfLines={3}
                    editable={isAuthenticated}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {formData.address || "No address provided"}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Documents Section */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={24} color="#2C2A7C" />
            <Text style={styles.sectionTitle}>Documents</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="credit-card" size={24} color="#2C2A7C" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Aadhar Card Number</Text>
                {editMode && isAuthenticated ? (
                  <TextInput
                    style={styles.input}
                    value={formData.aadhar}
                    onChangeText={(text) => handleInputChange('aadhar', text)}
                    placeholder="Enter your 12-digit Aadhar number"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    editable={isAuthenticated}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {formData.aadhar || "No Aadhar number provided"}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.documentsGrid}>
            {[
              ['Aadhar Card Front', 'aadharFrontImage'],
              ['Aadhar Card Back', 'aadharBackImage']
            ].map(([label, field]) => (
              <View key={field} style={styles.documentCard}>
                <Text style={styles.documentLabel}>{label}</Text>
                {formData[field] ? (
                  <Image
                    source={{ uri: formData[field] }}
                    style={styles.documentImage}
                  />
                ) : (
                  <View style={styles.documentPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={32} color="#2C2A7C" />
                    <Text style={styles.uploadText}>Upload Image</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <MaterialIcons name="logout" size={24} color="#FF4C4C" style={styles.buttonIcon} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#2C2A7C',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 35,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  headerContent: {
    marginTop: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  roleBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleIcon: {
    marginRight: 6,
  },
  roleBadge: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
    backgroundColor: '#F7F7FA',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2A7C',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F5',
    ...Platform.select({
      ios: {
        shadowColor: '#2C2A7C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F7F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  fieldContent: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  input: {
    fontSize: 16,
    color: '#2C2A7C',
    padding: 14,
    backgroundColor: '#F7F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0FF',
    minHeight: 50,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  fieldValue: {
    fontSize: 16,
    color: '#2C2A7C',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  documentsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  documentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  documentLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  documentImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F7F7FA',
  },
  documentPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F7F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0FF',
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadText: {
    color: '#2C2A7C',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  logoutButtonText: {
    color: '#FF4C4C',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  quickActions: {
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  editActionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2C2A7C',
  },
  saveActionButton: {
    backgroundColor: '#2C2A7C',
    borderColor: '#2C2A7C',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2A7C',
  },
  saveActionButtonText: {
    color: '#FFFFFF',
  },
});
