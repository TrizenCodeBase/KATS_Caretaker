import React, { useState } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

// Optional: import Geolocation and Camera library if integrating later
// import Geolocation from '@react-native-community/geolocation';
// import * as ImagePicker from 'expo-image-picker';

const RouteDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { routeData } = route.params;

  const [selectedKidId, setSelectedKidId] = useState(null);
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

  const [assignedKids] = useState([
    {
      id: "1",
      name: "Arjun Reddy",
      pickupTime: "08:00 AM",
      dropTime: "03:00 PM"
    },
    {
      id: "2",
      name: "Meera Chopra",
      pickupTime: "08:15 AM",
      dropTime: "03:15 PM"
    }
  ]);

  const handleAttendanceSubmit = () => {
    console.log("Submitted Data:", attendanceData);
    setShowAttendanceForm(false);
  };

  const handleCancelAttendance = () => {
    setShowAttendanceForm(false);
  };

  const handleAddAttendanceClick = () => {
    // Simulated GPS fetch (replace with real API later)
    setAttendanceData(prev => ({
      ...prev,
      latitude: "17.385044",  // Hardcoded for demo
      longitude: "78.486671"
    }));
    setShowAttendanceForm(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{routeData.routeName}</Text>

      {/* Route Metadata */}
      <View style={styles.card}>
        <Text style={styles.label}>Driver:</Text>
        <Text>{routeData.driverName}</Text>
        <Text style={styles.label}>Driver PhoneNumber:</Text>
        <Text>9999999999</Text>
        <Text style={styles.label}>Caretaker:</Text>
        <Text>{routeData.caretakerName}</Text>
        <Text style={styles.label}>Caretaker PhoneNumber:</Text>
        <Text>9999999999</Text>
      </View>

      {/* Kid Selector */}
      <Text style={styles.sectionTitle}>Select Kid:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedKidId}
          onValueChange={(itemValue) => {
            setSelectedKidId(itemValue);
            const kid = assignedKids.find(k => k.id === itemValue);
            setAttendanceData(prev => ({
              ...prev,
              userProfileUuid: kid.id,
              pickupTime: kid.pickupTime
            }));
          }}
        >
          <Picker.Item label="-- Select a Kid --" value={null} />
          {assignedKids.map((kid) => (
            <Picker.Item key={kid.id} label={kid.name} value={kid.id} />
          ))}
        </Picker>
      </View>

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
            <Text style={{ marginBottom: 6 }}>Select Type:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={attendanceData.type}
                  onValueChange={(itemValue) =>
                    setAttendanceData({ ...attendanceData, type: itemValue })
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

            {/* Placeholder for camera input */}
            <Text style={{ marginBottom: 10, color: "#888" }}>
              [Camera input goes here]
            </Text>

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
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden"
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 16,
    elevation: 3
  },
  label: {
    fontWeight: "600",
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 6
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  cancelButton: {
    backgroundColor: "#ccc",
    marginRight: 8
  },
  submitButton: {
    backgroundColor: "#007bff"
  },
  buttonText: {
    color: "white",
    fontWeight: "600"
  }
});

export default RouteDetailsScreen;
