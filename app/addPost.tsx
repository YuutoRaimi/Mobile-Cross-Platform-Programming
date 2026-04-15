import { router } from "expo-router";
import { useState } from "react";
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { postData } from "./services/api";

export default function AddPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    const newData = { title, body, userId: 1 };

    postData(newData)
      .then((res) => {
        if (res.status === 201) {
          alert("Post berhasil ditambahkan!");
          console.log(res.data);
          router.back();
        } else {
          alert("Gagal menambahkan post");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Terjadi kesalahan");
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Text style={styles.header}>Add New Post</Text>

          <TextInput
            style={styles.input}
            placeholder="Post Title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Post Body"
            value={body}
            onChangeText={setBody}
            multiline
          />

          <View style={styles.buttonContainer}>
            <Button title="Submit" onPress={handleSubmit} />
            <View style={{ width: 10 }} />
            <Button title="Cancel" color="red" onPress={() => router.back()} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  buttonContainer: { flexDirection: "row", justifyContent: "center" },
});
