import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import axios from 'axios'
import RegistrationForm from '../components/RegistrationForm'

jest.mock('axios')

describe('RegistrationForm', () => {
  beforeEach(() => {
    axios.post.mockReset()
  })

  test('renders form and shows validation errors for empty required fields', async () => {
    render(<RegistrationForm />)
    const submit = screen.getByRole('button', { name: /register/i })
    userEvent.click(submit)
    await waitFor(() => expect(screen.getByText(/Full name is required/i)).toBeInTheDocument() || true)
    // The component shows combined error message, check it exists
    const msg = screen.getByText(/Full name is required/i, { exact: false })
    expect(msg).toBeInTheDocument()
  })

  test('shows student validation and submits successfully', async () => {
    axios.post.mockResolvedValue({ data: { voterId: 'V-12345' } })
    render(<RegistrationForm />)

    // fill required fields
    userEvent.type(screen.getByLabelText(/Full name/i), 'Alice Student')
    userEvent.type(screen.getByLabelText(/Email/i), 'alice@example.com')
    userEvent.type(screen.getByLabelText(/ID value/i), 'ABC12345')
    // mark student
    userEvent.click(screen.getByLabelText(/I am a student/i))
    userEvent.type(screen.getByLabelText(/Student first name/i), 'Alice')
    userEvent.type(screen.getByLabelText(/Student last name/i), 'Student')
    userEvent.type(screen.getByLabelText(/Year of study/i), '2')
    userEvent.selectOptions(screen.getByLabelText(/Faculty/i), 'Science')
    userEvent.selectOptions(screen.getByLabelText(/Identification scanner/i), 'MOBILE_SCAN_V1')

    userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(await screen.findByText(/Registered successfully/i)).toBeInTheDocument()
  })

  test('displays server error message', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'ID already registered' } } })
    render(<RegistrationForm />)

    userEvent.type(screen.getByLabelText(/Full name/i), 'Bob')
    userEvent.type(screen.getByLabelText(/Email/i), 'bob@example.com')
    userEvent.type(screen.getByLabelText(/ID value/i), 'ID-1')

    userEvent.click(screen.getByRole('button', { name: /register/i }))

    expect(await screen.findByText(/ID already registered/i)).toBeInTheDocument()
  })
})
