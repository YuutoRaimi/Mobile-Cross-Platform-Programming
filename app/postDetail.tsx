import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getPostComments, getPostDetail, getUserDetail } from "./services/api";

export default function PostDetail() {
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();

  const [user, setUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      getPostDetailData();
      getCommentsData();
    }
    if (userId) {
      getUserData();
    }
  }, [id, userId]);

  const getUserData = () => {
    getUserDetail(Number(userId))
      .then((res) => {
        if (res.status === 200) setUser(res.data);
      })
      .catch((err) => console.log(err));
  };

  const getPostDetailData = () => {
    getPostDetail(Number(id))
      .then((res) => {
        if (res.status === 200) setPost(res.data);
      })
      .catch((err) => console.log(err));
  };

  const getCommentsData = () => {
    getPostComments(Number(id))
      .then((res) => {
        if (res.status === 200) setComments(res.data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <ScrollView style={styles.container}>
      {post ? (
        <View>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.body}>{post.body}</Text>
        </View>
      ) : (
        <Text style={styles.loading}>Loading Post...</Text>
      )}

      <View style={styles.authorBox}>
        <Text style={styles.boldText}>Post Created By:</Text>
        <Text>Name: {user ? user.name : "Loading..."}</Text>
        <Text>Email: {user ? user.email : "Loading..."}</Text>
      </View>

      <Text style={styles.commentHeader}>Comments:</Text>

      {comments.map((comment) => (
        <View key={comment.id} style={styles.commentBox}>
          <Text style={styles.boldText}>{comment.email}</Text>
          <Text style={styles.italicText}>{comment.name}</Text>
          <Text>{comment.body}</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  loading: {
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  body: { textAlign: "center", marginBottom: 20 },
  authorBox: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  boldText: { fontWeight: "bold" },
  commentHeader: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  commentBox: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  italicText: { fontStyle: "italic", marginBottom: 5 },
});
