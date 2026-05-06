import * as Location from "expo-location";
import React, { useRef, useState } from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type InteractionMode = "tap" | "drag";

const { height } = Dimensions.get("window");

export default function App() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [mode, setMode] = useState<InteractionMode>("tap");

  const mapRef = useRef<MapView | null>(null);

  const getLocation = async (): Promise<void> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied! Please allow location access.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});

    const currentCoords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setLocation(currentCoords);

    mapRef.current?.animateToRegion(
      {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  };

  const region: Region | undefined = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {!location ? (
        <View style={styles.center}>
          <Button title="Get Geo Location" onPress={getLocation} />
        </View>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={region}
              onPress={(e) => {
                if (mode === "tap") setLocation(e.nativeEvent.coordinate);
              }}
              onRegionChangeComplete={(newRegion) => {
                if (mode === "drag") {
                  setLocation({
                    latitude: newRegion.latitude,
                    longitude: newRegion.longitude,
                  });
                }
              }}
            >
              <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {mode === "tap" && (
                <Marker coordinate={location} title="My Location" />
              )}
            </MapView>

            {mode === "drag" && (
              <View pointerEvents="none" style={styles.centerMarker}>
                <Text style={{ fontSize: 40 }}>📍</Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Informasi Lokasi:</Text>
            <Text>Latitude: {location.latitude.toFixed(6)}</Text>
            <Text>Longitude: {location.longitude.toFixed(6)}</Text>

            <Text
              style={{ marginTop: 15, marginBottom: 5, fontWeight: "bold" }}
            >
              Mode Interaksi:
            </Text>
            <View style={styles.buttonRow}>
              <Button
                title="Mode Tap Peta"
                onPress={() => setMode("tap")}
                color={mode === "tap" ? "#007AFF" : "#A9A9A9"}
              />
              <Button
                title="Mode Drag Marker"
                onPress={() => setMode("drag")}
                color={mode === "drag" ? "#007AFF" : "#A9A9A9"}
              />
            </View>

            <View style={{ marginTop: 15 }}>
              <Button title="Refresh Current Location" onPress={getLocation} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mapContainer: {
    height: height * 0.5,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerMarker: {
    position: "absolute",
    paddingBottom: 45,
  },
  info: { flex: 1, padding: 16, backgroundColor: "#fff" },
  label: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
