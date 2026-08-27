// scripts/hmac_rotate.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { decryptString } = require('../lib/kms');
const { computeLookupKey } = require('../lib/id');

const prisma = new PrismaClient();

async function rotate({ oldSecret, newSecret, dryRun = true, batchSize = 100 }) {
  console.log('Starting HMAC rotation. dryRun=', dryRun);
  let cursor = null;
  while (true) {
    const rows = await prisma.voterRegistration.findMany({
      where: { encryptedIdValue: { not: null } },
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
    });
    if (!rows.length) break;

    for (const r of rows) {
      try {
        const normalized = await decryptString(r.encryptedIdValue); // plaintext normalized id
        if (!normalized) {
          console.warn(`Skipping id ${r.id}: no decrypted value`);
          continue;
        }
        // compute new lookupKey using newSecret
        const lookupNew = computeLookupKey(normalized, newSecret);
        if (r.lookupKey === lookupNew) {
          // already matches new key
          continue;
        }
        if (!dryRun) {
          await prisma.voterRegistration.update({
            where: { id: r.id },
            data: { lookupKey: lookupNew }
          });
        } else {
          console.log(`[DRY] would update ${r.id} -> ${lookupNew}`);
        }
      } catch (err) {
        console.error('rotate error for id', r.id, err);
      }
      cursor = r.id;
    }
    if (rows.length < batchSize) break;
  }
  console.log('Rotation complete.');
}

const args = require('yargs/yargs')(process.argv.slice(2)).argv;
if (!args.newSecret) {
  console.error('Usage: node scripts/hmac_rotate.js --newSecret=... [--dryRun=false]');
  process.exit(2);
}
rotate({ newSecret: args.newSecret, dryRun: args.dryRun !== 'false' }).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) });
