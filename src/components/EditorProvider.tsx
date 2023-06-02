"use client";

import { useEffect, useState } from "react";

import { Post } from "@prisma/client";
import axios from "axios";

import Editor from "./editor";

type Props = {
  id: string;
};

export default function EditorProvider({ id }: Props) {
  const [post, setPost] = useState<Post | null>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      const { data } = await axios.get(`/api/admin/posts?id=${id}`);
      setPost(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setContent(data.content || "[]");
    })();
  }, []);

  if (!post) {
    return null;
  }

  return (
    <Editor
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      content={content}
      setContent={setContent}
    />
  );
}
