import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import mime from "mime-types";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";

import authOptions from "lib/auth";
import ResponseDTO from "lib/response";
import withS3 from "lib/withS3";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return ResponseDTO.status(401).json({
      result: false,
      error: {
        title: "Unauthorized",
        message: "You are not authorized.",
      },
    });
  }

  const contentType = req.headers.get("Content-Type");

  if (!contentType) {
    return ResponseDTO.status(400).json({
      result: false,
      error: {
        title: "Bad Request",
        message: "The request type is unknown.",
      },
    });
  }

  if (!contentType?.startsWith("image/")) {
    return ResponseDTO.status(400).json({
      result: false,
      error: {
        title: "Bad Request",
        message: "The request body is not a image.",
      },
    });
  }

  const extension = mime.extension(contentType);

  const image = await req.arrayBuffer();

  const uuid = crypto.randomUUID();

  const client = withS3();

  if (client) {
    // Use AWS S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `blog/images/${uuid}.${extension}`,
      Body: Buffer.from(image),
    });

    try {
      await client.send(command);
    } catch (e) {
      console.log(e);
      return ResponseDTO.status(500).json({
        result: false,
        error: {
          title: "Internal Server Error",
          message: "Couldn't upload the image to S3.",
        },
      });
    }
  } else {
    // Use Local Stroage
    const imageFolderPath = path.join(process.cwd(), "data", "images");
    const imageFilePath = path.join(imageFolderPath, `${uuid}.${extension}`);

    try {
      await fs.stat(imageFolderPath);
    } catch {
      await fs.mkdir(imageFolderPath, { recursive: true });
    }

    await fs.writeFile(imageFilePath, Buffer.from(image));
  }

  return ResponseDTO.status(200).json({
    result: true,
    data: {
      filename: `${uuid}.${extension}`,
    },
  });
}
