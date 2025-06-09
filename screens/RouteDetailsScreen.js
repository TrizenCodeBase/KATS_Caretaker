import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Optional: import Geolocation and Camera library if integrating later
// import Geolocation from '@react-native-community/geolocation';
// import * as ImagePicker from 'expo-image-picker';

const RouteDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { routeData } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [selectedKidId, setSelectedKidId] = useState(null);
  const [selectedKid, setSelectedKid] = useState(null);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    userProfileUuid: "",
    date: new Date().toISOString().split("T")[0],
    type: "",
    pickupTime: "",
    image: null,
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    fetchRouteDetails();
  }, []);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [storedToken, storedUuid] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('uuid')
      ]);

      console.log('Loaded auth data for routes:', {
        hasToken: !!storedToken,
        tokenStartsWithBearer: storedToken?.startsWith('Bearer '),
        tokenLength: storedToken?.length,
        hasUuid: !!storedUuid,
        uuidLength: storedUuid?.length
      });

      if (!storedToken || !storedUuid) {
        throw new Error('Authentication required');
      }

      const token = storedToken.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;

      console.log('Making route details request:', {
        endpoint: `https://api.katsapp.com/api/caretaker/route/${storedUuid}?uuid=${storedUuid}`,
        headers: {
          Authorization: `${token.substring(0, 20)}...`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const response = await axios.get(
        `https://api.katsapp.com/api/caretaker/route/${storedUuid}?uuid=${storedUuid}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Route details raw response:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 0
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No route data received from server');
      }

      // Extract the first route's details
      const routeData = response.data[0];
      console.log('Route data structure:', {
        hasRouteInfo: !!routeData.routeInfo,
        hasDriver: !!routeData.driver,
        hasCaretaker: !!routeData.caretaker,
        hasKids: !!routeData.kids,
        kidsCount: routeData.kids?.length || 0
      });

      // Format the data structure matching exact field names
      const formattedRouteDetails = {
        routeName: `${routeData.routeInfo?.from || ''} to ${routeData.routeInfo?.to || ''}`,
        routeUuid: routeData.routeInfo?.uuid,
        driverName: routeData.driver?.name || 'Not available',
        driverPhone: routeData.driver?.phoneNumber || 'Not available',
        driverProfilePic: routeData.driver?.profilePicture,
        caretakerName: routeData.caretaker?.name || 'Not available',
        caretakerPhone: routeData.caretaker?.phoneNumber || 'Not available',
        caretakerProfilePic: routeData.caretaker?.profilePicture,
        students: routeData.kids?.map(kid => ({
          uuid: kid.uuid,
          name: kid.kidName || 'Unknown',
          dob: kid.kidsDateOfBirth ? new Date(kid.kidsDateOfBirth).toLocaleDateString() : '',
          gender: kid.gender || ''
        })) || []
      };

      console.log('Formatted route details:', {
        routeName: formattedRouteDetails.routeName,
        studentsCount: formattedRouteDetails.students.length,
        sampleStudent: formattedRouteDetails.students[0]
      });

      setRouteDetails(formattedRouteDetails);

    } catch (error) {
      console.error('Route details fetch error:', {
        message: error.message,
        name: error.name,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      });
      
      let errorMessage = 'Failed to load route details. ';
      if (error.response?.status === 401) {
        errorMessage += 'Please login again.';
        AsyncStorage.multiRemove(['authToken', 'uuid'])
          .then(() => {
            console.log('Cleared stored credentials due to auth error');
            navigation.navigate('Login');
          })
          .catch(clearError => console.error('Failed to clear credentials:', clearError));
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again.';
      } else {
        errorMessage += error.response?.data?.message || error.message || 'Please try again.';
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = () => {
    console.log("Submitted Data:", attendanceData);
    setShowAttendanceForm(false);
  };

  const handleCancelAttendance = () => {
    setShowAttendanceForm(false);
  };

  const handleAddAttendanceClick = () => {
    setAttendanceData(prev => ({
      ...prev,
      latitude: "17.385044",  // Hardcoded for demo
      longitude: "78.486671"
    }));
    setShowAttendanceForm(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#A020F0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRouteDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if we have route data
  const hasRouteData = routeDetails && Object.keys(routeDetails).length > 0;
  if (!hasRouteData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No route details available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRouteDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{routeDetails?.routeName || 'Route Details'}</Text>

      {/* Route Metadata */}
      <View style={styles.card}>
        <Text style={styles.label}>Driver:</Text>
        <View style={styles.profileRow}>
          {routeDetails?.driverProfilePic && (
            <Image 
              source={{ uri: routeDetails.driverProfilePic }} 
              style={styles.profilePic} 
            />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{routeDetails?.driverName || 'Not available'}</Text>
            <Text style={styles.phone}>{routeDetails?.driverPhone || 'Not available'}</Text>
          </View>
        </View>

        <Text style={[styles.label, styles.marginTop]}>Caretaker:</Text>
        <View style={styles.profileRow}>
          {routeDetails?.caretakerProfilePic && (
            <Image 
              source={{ uri: routeDetails.caretakerProfilePic }} 
              style={styles.profilePic} 
            />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{routeDetails?.caretakerName || 'Not available'}</Text>
            <Text style={styles.phone}>{routeDetails?.caretakerPhone || 'Not available'}</Text>
          </View>
        </View>
      </View>

      {/* Kid Selector */}
      <Text style={styles.sectionTitle}>Select Kid:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Select a Kid"
          value={selectedKid ? `${selectedKid.name} (${selectedKid.gender})` : ''}
          editable={false}
          placeholderTextColor="#999"
        />
        <Picker
          selectedValue={selectedKidId}
          style={styles.hiddenPicker}
          onValueChange={(itemValue) => {
            setSelectedKidId(itemValue);
            const kid = routeDetails?.students?.find(s => s.uuid === itemValue);
            if (kid) {
              setSelectedKid(kid);
            setAttendanceData(prev => ({
              ...prev,
                userProfileUuid: kid.uuid
            }));
            } else {
              setSelectedKid(null);
            }
          }}
        >
          <Picker.Item label="-- Select a Kid --" value={null} />
          {(routeDetails?.students || []).map((student) => (
            <Picker.Item 
              key={student.uuid} 
              label={`${student.name} (${student.gender})`} 
              value={student.uuid} 
            />
          ))}
        </Picker>
      </View>

      {/* Selected Kid Details */}
      {selectedKid && (
        <View style={styles.selectedKidCard}>
          <Text style={styles.selectedKidTitle}>Selected Student</Text>
          <View style={styles.selectedKidInfo}>
            <Text style={styles.kidName}>{selectedKid.name}</Text>
            <Text style={styles.kidDetail}>Gender: {selectedKid.gender}</Text>
            <Text style={styles.kidDetail}>Date of Birth: {selectedKid.dob}</Text>
          </View>
        </View>
      )}

      {selectedKidId && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAttendanceClick}
        >
          <Text style={styles.addButtonText}>Add Attendance</Text>
        </TouchableOpacity>
      )}

      {/* Attendance Modal */}
      <Modal visible={showAttendanceForm} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Attendance Form</Text>

            <TextInput
              style={styles.input}
              placeholder="Date"
              value={attendanceData.date}
              onChangeText={(text) =>
                setAttendanceData({ ...attendanceData, date: text })
              }
            />
            <Text style={styles.pickerLabel}>Select Type:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Select Type"
                value={attendanceData.type}
                editable={false}
                placeholderTextColor="#999"
              />
                <Picker
                  selectedValue={attendanceData.type}
                style={styles.hiddenPicker}
                  onValueChange={(itemValue) =>
                  setAttendanceData(prev => ({ ...prev, type: itemValue }))
                  }
                >
                  <Picker.Item label="-- Select Type --" value="" />
                  <Picker.Item label="Home Pickup" value="Home Pickup" />
                  <Picker.Item label="Home Drop" value="Home Drop" />
                  <Picker.Item label="Institute Pickup" value="Institute Pickup" />
                  <Picker.Item label="Institute Drop" value="Institute Drop" />
                </Picker>
              </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Time"
              value={attendanceData.pickupTime}
              onChangeText={(text) =>
                setAttendanceData({ ...attendanceData, pickupTime: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              value={attendanceData.latitude}
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              value={attendanceData.longitude}
              editable={false}
            />

            {/* Form Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelAttendance}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleAttendanceSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#A020F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: '#333',
  },
  addButton: {
    backgroundColor: "#A020F0",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  submitButton: {
    backgroundColor: "#A020F0",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  marginTop: {
    marginTop: 16,
  },
  selectedKidCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedKidTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  selectedKidInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  kidName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  kidDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    height: 50,
  },
  hiddenPicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    height: 50,
  },
});

export default RouteDetailsScreen;
