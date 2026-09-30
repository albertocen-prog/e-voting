import { useState } from 'react'

const FACULTY_OPTIONS = ['Science', 'Arts', 'Engineering', 'Business', 'Law']
const SCANNER_OPTIONS = [
  { label: 'Mobile App Scanner', value: 'MOBILE_SCAN_V1' },
  { label: 'Kiosk Terminal', value: 'KIOSK_MODEL_X' },
  { label: 'Web Camera', value: 'WEB_CAMERA' },
]

export default function VoterRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idType: '',
    idValue: '',
    studentFirstName: '',
    studentLastName: '',
    yearOfStudy: '',
    faculty: '',
    identificationScanner: '',
  })
  const [idDocument, setIdDocument] = useState(null)
  const [status, setStatus] = useState({ loading: false, error: null, success: null })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ loading: false, error: 'File size must be under 10MB', success: null })
        return
      }
      setIdDocument(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: null, success: null })

    // Build multipart/form-data payload for formidable
    const data = new FormData()
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== '') {
        data.append(key, formData[key])
      }
    })

    if (idDocument) {
      data.append('idDocument', idDocument)
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: data, // Browser auto-sets multipart/form-data boundary headers
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit registration')
      }

      setStatus({
        loading: false,
        error: null,
        success: `Registration successful! Your Voter ID is ${result.voterId}`,
      })

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        idType: '',
        idValue: '',
        studentFirstName: '',
        studentLastName: '',
        yearOfStudy: '',
        faculty: '',
        identificationScanner: '',
      })
      setIdDocument(null)
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null })
    }
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Voter Registration</h2>

      {status.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {status.error}
        </div>
      )}

      {status.success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {status.success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
              required
            />
          </div>
        </div>

        {/* Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Type *</label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
              required
            >
              <option value="">Select ID Type</option>
              <option value="NATIONAL_ID">National ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="STUDENT_ID">Student ID</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Number *</label>
            <input
              type="text"
              name="idValue"
              value={formData.idValue}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
              required
            />
          </div>
        </div>

        {/* Student Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student First Name</label>
            <input
              type="text"
              name="studentFirstName"
              maxLength={100}
              value={formData.studentFirstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Student Last Name</label>
            <input
              type="text"
              name="studentLastName"
              maxLength={100}
              value={formData.studentLastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Year of Study (1-15)</label>
            <input
              type="number"
              name="yearOfStudy"
              min="1"
              max="15"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
            >
              <option value="">Select Faculty</option>
              {FACULTY_OPTIONS.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Scanner Source</label>
            <select
              name="identificationScanner"
              value={formData.identificationScanner}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
            >
              <option value="">Select Source</option>
              {SCANNER_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload ID Document (Max 10MB)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium transition-colors"
        >
          {status.loading ? 'Submitting...' : 'Register Voter'}
        </button>
      </form>
    </div>
  )
}
