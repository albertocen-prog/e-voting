const { KMSClient, EncryptCommand, DecryptCommand } = require('@aws-sdk/client-kms')

const kms = new KMSClient({ region: process.env.AWS_REGION })
const KEY_ID = process.env.AWS_KMS_KEY_ID
if (!KEY_ID) {
  console.warn('Warning: AWS_KMS_KEY_ID not set — KMS encryption will not work without it')
}

async function encryptString(plaintext) {
  if (!KEY_ID) throw new Error('AWS_KMS_KEY_ID not configured')
  const cmd = new EncryptCommand({ KeyId: KEY_ID, Plaintext: Buffer.from(String(plaintext)) })
  const res = await kms.send(cmd)
  return res.CiphertextBlob.toString('base64')
}

async function decryptString(cipherBase64) {
  if (!cipherBase64) return null
  const cipher = Buffer.from(cipherBase64, 'base64')
  const cmd = new DecryptCommand({ CiphertextBlob: cipher })
  const res = await kms.send(cmd)
  return res.Plaintext.toString('utf8')
}

module.exports = { encryptString, decryptString }
