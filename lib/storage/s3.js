const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const path = require('path')
const crypto = require('crypto')

const REGION = process.env.AWS_REGION
const BUCKET = process.env.S3_BUCKET
if (!REGION || !BUCKET) {
  console.warn('S3 storage not fully configured: AWS_REGION and S3_BUCKET should be set')
}

const s3 = new S3Client({ region: REGION })

async function uploadToS3(buffer, filename, contentType) {
  if (!BUCKET) throw new Error('S3_BUCKET not configured')
  const key = `id-docs/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(filename)}`
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  })
  await s3.send(cmd)
  const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  const url = await getSignedUrl(s3, getCmd, { expiresIn: 60 * 60 })
  return { key, url }
}

module.exports = { uploadToS3 }
