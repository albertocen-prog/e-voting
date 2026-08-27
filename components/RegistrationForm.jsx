import { useState } from 'react'
import axios from 'axios'
import styles from './RegistrationForm.module.css'

const ID_TYPES = [
  { value: 'NOTIONAL_CARD', label: 'Notional ID card' },
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'SCHOOL_ID', label: 'School ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVER_LICENSE', label: 'Driver license' },
]

const FACULTIES = ['Science', 'Arts', 'Engineering', 'Business', 'Law']
const SCANNERS = [
  { value: 'MOBILE_SCAN_V1', label: 'Mobile scanner' },
  { value: 'KIOSK_MODEL_X', label: 'Kiosk model X' },
  { value: 'WEB_CAMERA', label: 'Web camera' },
]

export default function RegistrationForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    idType: 'NATIONAL_ID',
    idValue: '',
    isStudent: false,
    studentFirstName: '',
    studentLastName: '',
    yearOfStudy: '',
    faculty: '',
    identificationScanner: '',
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  function updateField(e) {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  function validate() {
    const errors = []
    if (!form.name || form.name.trim().length === 0) errors.push('Full name is required')
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.push('Valid email is required')
    if (!form.idType) errors.push('ID type is required')
    if (!form.idValue || form.idValue.trim().length < 3) errors.push('ID value is required (min 3 chars)')

    if (form.isStudent) {
      if (!form.studentFirstName || form.studentFirstName.trim().length === 0) errors.push('Student first name is required')
      if (!form.studentLastName || form.studentLastName.trim().length === 0) errors.push('Student last name is required')
      const y = parseInt(String(form.yearOfStudy || ''), 10)
      if (Number.isNaN(y) || y < 1 || y > 15) errors.push('Year of study must be a number between 1 and 15')
      if (!form.faculty) errors.push('Faculty is required')
      if (!SCANNERS.map(s => s.value).includes(form.identificationScanner)) errors.push('Please select an identification scanner')
    }

    if (file) {
      const allowed = ['application/pdf', 'image/png', 'image/jpeg']
      if (!allowed.includes(file.type)) errors.push('ID document must be PDF, PNG, or JPEG')
      if (file.size > 10 * 1024 * 1024) errors.push('ID document must be <= 10MB')
    }

    return errors
  }

  async function onSubmit(e) {
    e.preventDefault()
    setMessage(null)
    const errors = validate()
    if (errors.length) return setMessage({ type: 'error', text: errors.join('; ') })

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('email', form.email)
    fd.append('idType', form.idType)
    fd.append('idValue', form.idValue)

    if (form.isStudent) {
      fd.append('studentFirstName', form.studentFirstName)
      fd.append('studentLastName', form.studentLastName)
      fd.append('yearOfStudy', String(form.yearOfStudy))
      fd.append('faculty', form.faculty)
      fd.append('identificationScanner', form.identificationScanner)
    }

    if (file) fd.append('idDocument', file)

    try {
      setLoading(true)
      const res = await axios.post('/api/voters/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage({ type: 'success', text: `Registered successfully (voterId: ${res.data.voterId})` })
      setForm({
        name: '',
        email: '',
        idType: 'NATIONAL_ID',
        idValue: '',
        isStudent: false,
        studentFirstName: '',
        studentLastName: '',
        yearOfStudy: '',
        faculty: '',
        identificationScanner: '',
      })
      setFile(null)
    } catch (err) {
      const text = err.response?.data?.error || err.message || 'Registration failed'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} aria-labelledby="registration-heading">
      <h2 id="registration-heading">Voter registration</h2>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">Full name</label>
        <input id="name" name="name" className={styles.input} value={form.name} onChange={updateField} required />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className={styles.input} value={form.email} onChange={updateField} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="idType">ID type</label>
          <select id="idType" name="idType" className={styles.select} value={form.idType} onChange={updateField}>
            {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="idValue">ID value</label>
        <input id="idValue" name="idValue" className={styles.input} value={form.idValue} onChange={updateField} required />
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" name="isStudent" checked={form.isStudent} onChange={updateField} /> I am a student
        </label>
      </div>

      {form.isStudent && (
        <fieldset className={styles.fieldset} aria-labelledby="student-legend">
          <legend id="student-legend" className={styles.legend}>Student details</legend>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="studentFirstName">Student first name</label>
              <input id="studentFirstName" name="studentFirstName" className={styles.input} value={form.studentFirstName} onChange={updateField} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="studentLastName">Student last name</label>
              <input id="studentLastName" name="studentLastName" className={styles.input} value={form.studentLastName} onChange={updateField} required />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="yearOfStudy">Year of study</label>
              <input id="yearOfStudy" name="yearOfStudy" type="number" min="1" max="15" className={styles.input} value={form.yearOfStudy} onChange={updateField} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="faculty">Faculty</label>
              <select id="faculty" name="faculty" className={styles.select} value={form.faculty} onChange={updateField} required>
                <option value="">Select faculty</option>
                {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="identificationScanner">Identification scanner</label>
            <select id="identificationScanner" name="identificationScanner" className={styles.select} value={form.identificationScanner} onChange={updateField} required>
              <option value="">Select scanner</option>
              {SCANNERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </fieldset>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="idDocument">Upload ID document (optional)</label>
        <input id="idDocument" className={styles.file} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
      </div>

      <div>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${message.type === 'error' ? styles.error : styles.success}`}>
          {message.text}
        </div>
      )}
    </form>
  )
}
