// components/RouteCard.js
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function RouteCard({ route, onPress }) {
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { backgroundColor: "#FBBF24", textColor: "#1F2937" };
      case "in progress":
        return { backgroundColor: "#3B82F6", textColor: "#fff" };
      case "completed":
        return { backgroundColor: "#10B981", textColor: "#fff" };
      default:
        return { backgroundColor: "#D1D5DB", textColor: "#1F2937" };
    }
  };

  const { backgroundColor, textColor } = getStatusStyle(route.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.rowBetween}>
        <Text style={styles.routeName}>{route.name}</Text>
        <View style={[styles.statusPill, { backgroundColor }]}>
          <Text style={{ color: textColor, fontWeight: "600" }}>{route.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="place" size={20} color="#6B7280" />
        <Text style={styles.points}>
          {route.startPoint} → {route.endPoint}
        </Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="people" size={20} color="#6B7280" />
        <Text style={styles.students}>{route.totalStudents} students</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  routeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  points: {
    marginLeft: 8,
    color: "#374151",
    fontSize: 15,
  },
  students: {
    marginLeft: 8,
    color: "#374151",
    fontSize: 15,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});
