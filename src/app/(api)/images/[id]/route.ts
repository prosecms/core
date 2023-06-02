import fs from "fs/promises";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import mime from "mime-types";
import validator from "validator";

import ResponseDTO from "lib/response";
import withS3 from "lib/withS3";
import path from "path";

export async function GET(req: Request) {
  const filename = req.url.split("/").pop();

  if (!filename || !validator.isUUID(filename.split(".")[0])) {
    return ResponseDTO.status(400).json({
      result: false,
      error: {
        title: "Bad Request",
        message: "The request has no ID.",
      },
    });
  }

  const mimeType = mime.contentType(filename);

  if (!mimeType) {
    return ResponseDTO.status(500).json({
      result: false,
      error: {
        title: "Internal Server Error",
        message: "Couldn't find the appropreate mime type.",
      },
    });
  }

  const client = withS3();
  if (client) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `blog/images/${filename}`,
    });

    try {
      const result = await client.send(command);

      if (!result.Body) {
        throw new Error("Body was undefined");
      }

      const body = await result.Body.transformToByteArray();

      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
        },
      });
    } catch (e) {
      console.log(e);
      return ResponseDTO.status(404).json({
        result: false,
        error: {
          title: "Not Found",
          message: "Couldn't find the image.",
        },
      });
    }
  } else {
    const filePath = path.join(process.cwd(), "data", "images", filename);

    try {
      const data = await fs.readFile(filePath);

      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
        },
      });
    } catch (e) {
      console.log(e);
      return ResponseDTO.status(404).json({
        result: false,
        error: {
          title: "Not Found",
          message: "Couldn't find the image.",
        },
      });
    }
  }
}
