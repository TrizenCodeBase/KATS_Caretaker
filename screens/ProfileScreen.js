import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";

export default function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "Raju",
    email: "raju@yopmail.com",
    phone: "9876540099",
    alternatePhone: "9876540011",
    aadhar: "987654321234",
    address: "ZXCZXCZXC",
    dob: "30/06/1990",
    role: "Caretaker",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Alert.alert("Logged out");
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

  return (
    <ScrollView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Text style={styles.profileName}>{formData.name}</Text>
        <Text style={styles.roleBadge}>{formData.role.toUpperCase()}</Text>
      </View>

      <View style={styles.contentContainer}>
        {[
          ["Name", "name"],
          ["Email", "email"],
          ["Phone Number", "phone"],
          ["Alternate Number", "alternatePhone"],
          ["Aadhar Number", "aadhar"],
          ["Address", "address"],
          ["Date of Birth", "dob"],
          ["Role", "role"],
        ].map(([label, field]) => (
          <View key={field} style={styles.infoSection}>
            <Text style={styles.label}>{label}</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData[field]}
                onChangeText={(text) => handleInputChange(field, text)}
              />
            ) : (
              <Text style={styles.value}>{formData[field]}</Text>
            )}
          </View>
        ))}

        {/* Uploaded Documents Header */}
        <Text style={styles.uploadTitle}>Uploaded Documents</Text>
        <View style={styles.documentRow}>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>Aadhar Front</Text>
          </View>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>Aadhar Back</Text>
          </View>
        </View>

        {/* Edit / Save Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: editMode ? "#10B981" : "#3B82F6" }]}
          onPress={toggleEditMode}
        >
          <Text style={styles.buttonText}>{editMode ? "Save" : "Edit Profile"}</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#DC2626", marginTop: 10 }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topBar: {
    backgroundColor: "#A020F0",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
  },
  pageTitle: {
    marginTop: 20,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 24,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  roleBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
  },
  infoSection: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#111827",
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginVertical: 16,
  },
  documentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  docItem: {
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  docLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
