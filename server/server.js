const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 5000

const companyNames = [
  'Wipro',
  'HCLTech',
  'Accenture',
  'TCS',
  'Infosys',
  'Cognizant',
  'Capgemini',
  'IBM',
  'Deloitte',
  'Tech Mahindra',
]

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, unique: true, trim: true },
  department: {
    type: String,
    required: true,
    trim: true,
    enum: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Other'],
  },
  year: { type: String, required: true, trim: true, enum: ['1st year', '2nd year', '3rd year', '4th year'] },
  section: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, trim: true, enum: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] },
  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, match: /^[0-9+().\s-]{7,20}$/ },
  email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  arrears: { type: Number, required: true, min: 0 },
  companies: {
    type: [{ type: String, enum: companyNames, trim: true }],
    required: true,
    validate: (values) => values.length === 4 && new Set(values).size === 4,
  },
  registeredAt: { type: Date, default: Date.now },
})

const Registration = mongoose.model('Registration', registrationSchema)

app.use(cors())
app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/registrations', async (_request, response) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 }).lean()
    response.json({ registrations })
  } catch {
    response.status(500).json({ message: 'Could not load registrations.' })
  }
})

app.post('/api/registrations', async (request, response) => {
  const body = request.body && typeof request.body === 'object' && !Array.isArray(request.body)
    ? request.body
    : {}
  const { arrears, companies } = body
  if (Number(arrears) !== 0) {
    return response.status(400).json({ message: 'Students must have zero standing arrears to register.' })
  }
  if (!Array.isArray(companies) || companies.length !== 4 || new Set(companies).size !== 4) {
    return response.status(400).json({ message: 'Select exactly four different companies.' })
  }
  if (!companies.every((company) => companyNames.includes(company))) {
    return response.status(400).json({ message: 'Choose companies from the available list.' })
  }

  try {
    const registration = await Registration.create({ ...body, arrears: Number(arrears) })
    response.status(201).json({ registration })
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'A registration already exists for this student ID.' })
    }
    if (error.name === 'ValidationError') {
      return response.status(400).json({ message: 'Check that all required registration details are valid.' })
    }
    response.status(500).json({ message: 'Could not save this registration.' })
  }
})

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from server/.env')
  }
  await mongoose.connect(process.env.MONGO_URI)
  app.listen(port, () => {
    console.log(`Registration API listening at http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error(`Unable to start registration API: ${error.message}`)
  process.exit(1)
})