const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const path = require('path')
const crypto = require('crypto')

const s3 = new S3Client({ region: process.env.AWS_REGION })

async function uploadToS3(buffer, filename, contentType) {
  const bucket = process.env.S3_BUCKET
  const key = `id-docs/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(filename)}`
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  })
  await s3.send(cmd)
  // signed URL (short TTL)
  const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key })
  const url = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 60 }) // 1 hour
  return { key, url }
}

module.exports = { uploadToS3 }
