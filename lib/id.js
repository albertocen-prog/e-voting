const crypto = require('crypto')

const ID_TYPES = ['NOTIONAL_CARD', 'NATIONAL_ID', 'SCHOOL_ID', 'PASSPORT', 'DRIVER_LICENSE']

function normalizeId(value, idType) {
  if (!value) return ''
  let v = String(value).trim()
  if (idType === 'NATIONAL_ID' || idType === 'NOTIONAL_CARD') {
    // remove spaces and dashes, uppercase
    v = v.replace(/[\s-]+/g, '').toUpperCase()
  } else if (idType === 'SCHOOL_ID') {
    // trim and uppercase for school ids by default
    v = v.replace(/[\s]+/g, '').toUpperCase()
  } else {
    v = v // leave as-is for other types
  }
  return v
}

function computeLookupKey(normalizedValue, hmacSecret) {
  if (!hmacSecret) throw new Error('ID_LOOKUP_HMAC_SECRET not configured')
  return crypto.createHmac('sha256', hmacSecret).update(normalizedValue).digest('hex')
}

module.exports = {
  ID_TYPES,
  normalizeId,
  computeLookupKey,
}
//
const crypto = require('crypto')

const ID_TYPES = ['NOTIONAL_CARD', 'NATIONAL_ID', 'SCHOOL_ID', 'PASSPORT', 'DRIVER_LICENSE']

function normalizeId(value, idType) {
  if (!value) return ''
  let v = String(value).trim()
  if (idType === 'NATIONAL_ID' || idType === 'NOTIONAL_CARD') {
    v = v.replace(/[\s-]+/g, '').toUpperCase()
  } else if (idType === 'SCHOOL_ID') {
    v = v.replace(/[\s]+/g, '').toUpperCase()
  }
  return v
}

function computeLookupKey(normalizedValue, hmacSecret) {
  if (!hmacSecret) throw new Error('ID_LOOKUP_HMAC_SECRET not configured')
  return crypto.createHmac('sha256', hmacSecret).update(normalizedValue).digest('hex')
}

module.exports = { ID_TYPES, normalizeId, computeLookupKey }
