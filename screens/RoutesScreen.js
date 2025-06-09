import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const assignedRoutes = [
  {
    id: "route1",
    name: "Morning Route A",
    start: "Location A",
    end: "Location B",
    totalStudents: 10,
    status: "Pending",
  },
  {
    id: "route2",
    name: "Evening Route B",
    start: "Location C",
    end: "Location D",
    totalStudents: 12,
    status: "In Progress",
  },
];

const RoutesScreen = () => {
  const navigation = useNavigation();
  const [selectedRouteId, setSelectedRouteId] = useState("");

  const selectedRoute = assignedRoutes.find(
    (route) => route.id === selectedRouteId
  );

  const handleNavigate = () => {
    if (selectedRoute) {
      navigation.navigate("RouteDetails", { routeData: selectedRoute });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Select a Route</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedRouteId}
          onValueChange={(itemValue) => setSelectedRouteId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Choose a Route --" value="" />
          {assignedRoutes.map((route) => (
            <Picker.Item
              key={route.id}
              label={route.name}
              value={route.id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="View Route Details"
          onPress={handleNavigate}
          disabled={!selectedRouteId}
          color="#6D28D9"
        />
      </View>
    </View>
  );
};

export default RoutesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    backgroundColor: "#A020F0",
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  topBarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  pickerContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
      },
    }),
  },
  picker: {
    height: 50,
    color: "#111827",
  },
  buttonContainer: {
    marginTop: 40,
    marginHorizontal: 20,
  },
});
