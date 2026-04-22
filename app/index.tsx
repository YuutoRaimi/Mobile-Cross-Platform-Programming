import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [image, setImage] = useState<string | null>(null);

  const openCamera = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Gallery permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveImage = async () => {
    if (!image) {
      Alert.alert("Perhatian", "Pilih atau ambil gambar terlebih dahulu!");
      return;
    }

    try {
      const mediaLibraryPermissions =
        await MediaLibrary.requestPermissionsAsync();
      if (!mediaLibraryPermissions.granted) {
        Alert.alert(
          "Permission",
          "Izin akses galeri dibutuhkan untuk menyimpan gambar!",
        );
        return;
      }

      const fileName = image.split("/").pop() || "saved_image.jpg";
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: image,
        to: newPath,
      });

      await MediaLibrary.saveToLibraryAsync(newPath);

      Alert.alert(
        "Berhasil!",
        "Gambar berhasil tersimpan di galeri perangkat Anda.",
      );
    } catch (error) {
      console.error("Error saving image: ", error);
      Alert.alert("Error", "Gagal menyimpan gambar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Yehuda Suprato - 00000091657</Text>

      <View style={styles.button}>
        <Button title="OPEN CAMERA" onPress={openCamera} />
      </View>

      <View style={styles.button}>
        <Button title="OPEN GALLERY" onPress={openGallery} />
      </View>

      <View style={styles.button}>
        <Button title="SAVE IMAGE" onPress={saveImage} color="#28a745" />
      </View>

      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginBottom: 10,
    fontWeight: "bold",
  },
  button: {
    marginVertical: 5,
    width: 150,
  },
  image: {
    width: 250,
    height: 200,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
