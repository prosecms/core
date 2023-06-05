export type FileDriver = LocalDriverConfig | S3DriverConfig;

export type LocalDriverConfig = {
  name: "local";
  basePath: string;
};

export type S3DriverConfig = {
  name: "s3";
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string | null;
  prefix: string;
};

export type Config = {
  metadata: {
    name: string;
    description: string;
  };
  theme: {
    name: string;
    data: Record<string, string>;
    driver: FileDriver;
  };
  image: {
    driver: FileDriver;
  };
  auth: {};
};
