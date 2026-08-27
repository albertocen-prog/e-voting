import formidable from 'formidable'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/db'
import { normalizeId, computeLookupKey } from '../../../lib/id'
import { encryptString } from '../../../lib/kms'
import { uploadToS3 } from '../../../lib/storage/s3'

export const config = { api: { bodyParser: false } }

const FACULTY_ALLOWLIST = ['Science', 'Arts', 'Engineering', 'Business', 'Law']
const SCANNER_ALLOWLIST = ['MOBILE_SCAN_V1', 'KIOSK_MODEL_X', 'WEB_CAMERA']

function trimToNull(s) {
  if (!s && s !== 0) return null
  const t = String(s).trim()
  return t === '' ? null : t
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const form = new formidable.IncomingForm({ maxFileSize: 10 * 1024 * 1024 }) // 10 MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('form parse error', err)
      return res.status(400).json({ error: 'Invalid form data' })
    }

    try {
      const {
        name,
        email,
        idType,
        idValue,
        studentFirstName,
        studentLastName,
        yearOfStudy,
        faculty,
        identificationScanner,
      } = fields

      if (!idType || !idValue) return res.status(400).json({ error: 'idType and idValue are required' })

      // basic student fields validation
      const sFirst = trimToNull(studentFirstName)
      const sLast = trimToNull(studentLastName)
      const fac = trimToNull(faculty)
      const scanner = trimToNull(identificationScanner)

      if (sFirst && sFirst.length > 100) return res.status(400).json({ error: 'studentFirstName too long' })
      if (sLast && sLast.length > 100) return res.status(400).json({ error: 'studentLastName too long' })

      let year = null
      if (yearOfStudy !== undefined && yearOfStudy !== null && String(yearOfStudy).trim() !== '') {
        year = parseInt(String(yearOfStudy), 10)
        if (Number.isNaN(year) || year < 1 || year > 15) return res.status(400).json({ error: 'invalid yearOfStudy' })
      }

      if (fac && !FACULTY_ALLOWLIST.includes(fac)) return res.status(400).json({ error: 'unknown faculty' })
      if (scanner && !SCANNER_ALLOWLIST.includes(scanner)) return res.status(400).json({ error: 'unknown identificationScanner' })

      const normalized = normalizeId(idValue, idType)
      if (!normalized) return res.status(400).json({ error: 'Invalid idValue' })

      const lookupKey = computeLookupKey(normalized, process.env.ID_LOOKUP_HMAC_SECRET)

      // check duplicates
      const existing = await prisma.voterRegistration.findUnique({
        where: { idType_lookupKey: { idType, lookupKey } }
      })
      if (existing) return res.status(409).json({ error: 'ID already registered' })

      const hashedIdValue = await bcrypt.hash(normalized, 12)
      const encryptedIdValue = await encryptString(normalized)

      let idDocumentUrl = null
      if (files && files.idDocument) {
        const file = files.idDocument
        const buffer = fs.readFileSync(file.path)
        const result = await uploadToS3(buffer, file.name, file.type)
        idDocumentUrl = result.url
        // cleanup temp file if any
        try { fs.unlinkSync(file.path) } catch (_) {}
      }

      // create or link user (simple create for now)
      const user = await prisma.user.create({ data: { email, name } })

      const voter = await prisma.voterRegistration.create({
        data: {
          userId: user.id,
          voterId: `V-${Date.now()}`,
          idType,
          lookupKey,
          hashedIdValue,
          encryptedIdValue,
          idDocumentUrl,
          // student fields
          studentFirstName: sFirst,
          studentLastName: sLast,
          yearOfStudy: year,
          faculty: fac,
          identificationScanner: scanner,
        }
      })

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: user.role,
          action: 'voter_register',
          targetType: 'voterRegistration',
          targetId: voter.id,
          details: JSON.stringify({ idType }),
        }
      })

      return res.status(201).json({ voterId: voter.voterId })
    } catch (e) {
      console.error('register error', e)
      return res.status(500).json({ error: 'Server error' })
    }
  })
}
