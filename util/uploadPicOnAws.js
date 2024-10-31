import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import dotenv from "dotenv";
dotenv.config();

const Access_key = process.env.Access_key;
const Secret_key = process.env.Secret_key;
const Bucket_name = process.env.Bucket_Name;
const Region = process.env.Region;

export const uploadPicOnAws = async (file, fileName) => {
  const unique_obj_key = `${Date.now()}-${fileName}`;

  const client = new S3Client({
    region: Region,
    credentials: {
      accessKeyId: Access_key,
      secretAccessKey: Secret_key,
    },
  });

  const command = new PutObjectCommand({
    Bucket: Bucket_name,
    Key: unique_obj_key,
    Body: file,
    ContentType: "image/jpeg",
  });


  try {
    await client.send(command);
    const url = `https://${Bucket_name}.s3.${Region}.amazonaws.com/${unique_obj_key}`
    return url;
  } catch (error) {
    throw new Error(error?.message || 'AWS error');
  }

};