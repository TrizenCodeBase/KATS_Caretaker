
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const profile = {
    name: "Ravi Kumar",
    designation: "Driver",
    image: "https://i.pravatar.cc/150?img=8",
  };

  const handleCaretakerProfilePress = () => {
    navigation.navigate("My Routes");
  };

  const handleKidDetailsPress = () => {
    navigation.navigate("My Routes");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/kats_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={handleCaretakerProfilePress}
        >
          <Image
            source={{
              uri: "https://images.pexels.com/photos/8613086/pexels-photo-8613086.jpeg",
            }}
            style={styles.cardImage}
          />
          <View style={styles.cardOverlay}>
            <Text style={styles.cardText}>CareTaker Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleKidDetailsPress}>
          <Image
            source={{
              uri: "https://images.pexels.com/photos/8926542/pexels-photo-8926542.jpeg",
            }}
            style={styles.cardImage}
          />
          <View style={styles.cardOverlay}>
            <Text style={styles.cardText}>CareTaker Kid Details</Text>
          </View>
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
  logoContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  logo: {
    width: "100%",    // Ensures it takes full width
    height: 60,       // Increase height for better visibility
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
    backgroundColor: "#fff",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
