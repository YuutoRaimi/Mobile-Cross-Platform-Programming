import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Pressable, ScrollView, Text, View } from "react-native"; // Tambahkan Button
import { getPosts } from "./services/api";

export default function Index() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getAllPosts();
  }, []);

  const getAllPosts = () => {
    getPosts().then((res) => {
      if (res.status === 200) {
        setPosts(res.data);
      } else {
        console.log("error");
      }
    });
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Tombol Add New Post untuk Tugas 1 */}
      <View style={{ marginBottom: 10 }}>
        <Button
          title="Add New Post"
          onPress={() => router.push("/addPost" as any)}
        />
      </View>

      <ScrollView>
        {posts.map((post: any) => (
          <Pressable
            key={post.id}
            style={{ padding: 10, borderWidth: 1, marginBottom: 5 }}
            onPress={() =>
              router.push({
                pathname: "/postDetail" as any,
                params: { id: post.id, userId: post.userId },
              })
            }
          >
            <View style={{ height: 10 }} />
            <Text>Post Number: {post.id}</Text>
            <Text>Title: {post.title}</Text>
            <Text>Body: {post.body}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
