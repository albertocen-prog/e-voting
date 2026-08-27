// pages/api/voters/register.js
import formidable from 'formidable';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/db';
import { normalizeId, computeLookupKey } from '../../../lib/id';
import { encryptString } from '../../../lib/kms';
import { uploadToS3 } from '../../../lib/storage/s3';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm({ maxFileSize: 10 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Invalid form data' });
    try {
      const { name, email, idType, idValue } = fields;
      if (!idType || !idValue) return res.status(400).json({ error: 'idType and idValue required' });

      const normalized = normalizeId(idValue, idType);
      const lookupKey = computeLookupKey(normalized, process.env.ID_LOOKUP_HMAC_SECRET);

      // check duplicates
      const existing = await prisma.voterRegistration.findUnique({
        where: { idType_lookupKey: { idType, lookupKey } }
      });
      if (existing) return res.status(409).json({ error: 'ID already registered' });

      const hashedIdValue = await bcrypt.hash(normalized, 12);
      const encryptedIdValue = await encryptString(normalized);

      let idDocumentUrl = null;
      if (files && files.idDocument) {
        const file = files.idDocument;
        const buffer = fs.readFileSync(file.path);
        const result = await uploadToS3(buffer, file.name, file.type);
        idDocumentUrl = result.url;
      }

      // create or link user
      const user = await prisma.user.create({ data: { email, name } });

      const voter = await prisma.voterRegistration.create({
        data: {
          userId: user.id,
          voterId: `V-${Date.now()}`,
          idType,
          lookupKey,
          hashedIdValue,
          encryptedIdValue,
          idDocumentUrl,
        }
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: user.role,
          action: 'voter_register',
          targetType: 'voterRegistration',
          targetId: voter.id,
          details: JSON.stringify({ idType }),
        }
      });

      return res.status(201).json({ voterId: voter.voterId });
    } catch (e) {
      console.error('register error', e);
      return res.status(500).json({ error: 'Server error' });
    }
  });
}
