import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { supabase } from "../utils/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [imageAsset, setImageAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [locationSource, setLocationSource] = useState<string>("");

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      base64: true,
      exif: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageAsset(result.assets[0]);
      setIsSaved(false);
      setLocation(null);
    }
  };

  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      base64: true,
      exif: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageAsset(result.assets[0]);
      setIsSaved(false);
      setLocation(null);
    }
  };

  const saveImage = async () => {
    if (!imageAsset || !imageAsset.base64) {
      Alert.alert("Perhatian", "Pilih atau ambil gambar terlebih dahulu!");
      return;
    }

    setLoading(true);

    let finalLatitude = 0;
    let finalLongitude = 0;
    let source = "";

    try {
      if (
        imageAsset.exif &&
        imageAsset.exif.GPSLatitude &&
        imageAsset.exif.GPSLongitude
      ) {
        let lat = imageAsset.exif.GPSLatitude;
        let lon = imageAsset.exif.GPSLongitude;

        if (imageAsset.exif.GPSLatitudeRef === "S" && lat > 0) lat = -lat;
        if (imageAsset.exif.GPSLongitudeRef === "W" && lon > 0) lon = -lon;

        finalLatitude = lat;
        finalLongitude = lon;
        source = "EXIF Metadata Foto Asli";
      } else {
        let loc = await Location.getCurrentPositionAsync({});
        finalLatitude = loc.coords.latitude;
        finalLongitude = loc.coords.longitude;
        source = "GPS Real-time (Lokasi HP saat ini)";
      }

      setLocation({ latitude: finalLatitude, longitude: finalLongitude });
      setLocationSource(source);

      if (imageAsset.uri) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          await MediaLibrary.saveToLibraryAsync(imageAsset.uri);
        }
      }

      const fileName = `photo-${Date.now()}.jpg`;
      const { error: storageError } = await supabase.storage
        .from("camera")
        .upload(fileName, decode(imageAsset.base64!), {
          contentType: "image/jpeg",
        });

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from("camera")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase.from("photo").insert([
        {
          latitude: finalLatitude.toString(),
          longitude: finalLongitude.toString(),
          image_url: imageUrl,
        },
      ]);

      if (dbError) throw dbError;

      Alert.alert("Berhasil!", "Foto dan lokasi sukses disimpan ke Supabase.");
      setIsSaved(true);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Data Berhasil Disimpan",
          body: `Data foto berhasil masuk database.\n📍Lat: ${finalLatitude}\n📍Lon: ${finalLongitude}`,
        },
        trigger: null,
      });
    } catch (error: any) {
      Alert.alert("Terjadi Kesalahan", error.message);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "❌ Gagal Menyimpan Data",
          body: `Gagal menyimpan data ke database.\nLat: ${finalLatitude || "N/A"}\nLon: ${finalLongitude || "N/A"}\nError: ${error.message}`,
        },
        trigger: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yehuda Suprato - 00000091657</Text>

      {!isSaved && (
        <>
          <View style={styles.buttonContainer}>
            <Button
              title="Open Camera"
              onPress={openCamera}
              disabled={loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Open Gallery"
              onPress={openGallery}
              disabled={loading}
              color="#ff9800"
            />
          </View>
        </>
      )}

      {imageAsset && !isSaved && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageAsset.uri }} style={styles.imagePreview} />
          <View style={styles.buttonContainer}>
            <Button
              title="Save Image"
              onPress={saveImage}
              disabled={loading}
              color="#4caf50"
            />
          </View>
        </View>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 20 }}
        />
      )}

      {isSaved && location && (
        <View style={styles.mapContainer}>
          <Text style={styles.locationText}>Lokasi Foto Disimpan:</Text>
          <Text style={styles.sourceText}>Sumber Lokasi: {locationSource}</Text>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Foto Kamu"
            >
              <View style={styles.customMarker}>
                <Image
                  source={{ uri: imageAsset?.uri }}
                  style={styles.markerImage}
                />
                <View style={styles.markerPointer} />
              </View>
            </Marker>
          </MapView>

          <View style={{ marginTop: 15, width: "80%" }}>
            <Button title="Ambil Foto Lain" onPress={() => setIsSaved(false)} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonContainer: {
    marginVertical: 5,
    width: "80%",
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  locationText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  sourceText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  map: {
    width: Dimensions.get("window").width * 0.9,
    height: 300,
    borderRadius: 15,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#4caf50",
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4caf50",
    transform: [{ rotate: "180deg" }],
    marginTop: -2,
  },
});
