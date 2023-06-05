import mime from "mime-types";

import { readLocal, readS3 } from "lib/file";
import { prisma } from "lib/prisma";
import ResponseDTO from "lib/response";
import { Config } from "types/config";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filenameRaw = url.pathname.split("/").pop();

  if (!filenameRaw) {
    return {
      status: 400,
      body: {
        message: "Invalid request",
      },
    };
  }

  const filename = filenameRaw.includes(".")
    ? filenameRaw
    : `${filenameRaw}.hbs`;

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

  const configString = await prisma.config.findFirst({
    orderBy: {
      id: "desc",
    },
    take: 1,
  });

  if (!configString) {
    try {
      const content = await readLocal("theme", filename, {
        name: "local",
        basePath: "data",
      });
      return new Response(content, {
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
          message: "Couldn't find the theme file.",
        },
      });
    }
  }

  const config = JSON.parse(configString.config) as Config;
  if (config.theme.driver.name === "local") {
    try {
      const content = await readLocal("", filename, config.theme.driver);
      return new Response(content, {
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
          message: "Couldn't find the theme file.",
        },
      });
    }
  } else if (config.theme.driver.name === "s3") {
    try {
      const s3Body = await readS3("", filename, config.theme.driver);

      if (!s3Body) {
        return ResponseDTO.status(404).json({
          result: false,
          error: {
            title: "Not Found",
            message: "Couldn't find the theme file.",
          },
        });
      }

      const body = await s3Body.transformToByteArray();

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
          message: "Couldn't find the theme file.",
        },
      });
    }
  } else {
    return ResponseDTO.status(501).json({
      result: false,
      error: {
        title: "Not Implemented",
        message: "The driver is not implemented.",
      },
    });
  }
}
