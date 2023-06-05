import { cache } from "react";
import { Config } from "types/config";
import { prisma } from "./prisma";

export const getThemeMetadata = cache(async (postSlug?: string) => {
  const posts = await prisma.post.findMany();
  const post = postSlug
    ? await prisma.post.findUnique({ where: { slug: postSlug } })
    : null;

  const configRecord = await prisma.config.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  let metadata: Record<string, unknown> = {
    name: "Prose CMS",
    description: "A simple CMS for your prose.",
    post: post,
    posts: posts,
  };

  if (configRecord) {
    const config = JSON.parse(configRecord.config) as Config;

    metadata = {
      ...config.metadata,
      ...config.theme.data,
    };
  }

  return metadata;
});
