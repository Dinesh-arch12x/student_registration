import { useEffect, useState } from 'react'
import './App.css'

const companies = [
  { name: 'Wipro', initials: 'W', color: 'mint' },
  { name: 'HCLTech', initials: 'H', color: 'blue' },
  { name: 'Accenture', initials: 'A', color: 'lilac' },
  { name: 'TCS', initials: 'T', color: 'orange' },
  { name: 'Infosys', initials: 'I', color: 'sky' },
  { name: 'Cognizant', initials: 'C', color: 'rose' },
  { name: 'Capgemini', initials: 'C', color: 'blue' },
  { name: 'IBM', initials: 'I', color: 'sky' },
  { name: 'Deloitte', initials: 'D', color: 'mint' },
  { name: 'Tech Mahindra', initials: 'M', color: 'orange' },
]

const emptyStudent = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  fatherName: '',
  motherName: '',
  phone: '',
  email: '',
  arrears: '0',
}

function App() {
  const [view, setView] = useState('student')
  const [step, setStep] = useState(1)
  const [student, setStudent] = useState(emptyStudent)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [companyFilter, setCompanyFilter] = useState('All companies')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/registrations')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load registrations.')
        return data.registrations
      })
      .then((data) => {
        if (!cancelled) setRegistrations(data)
      })
      .catch((error) => {
        if (!cancelled) setNotice(error.message)
      })
    return () => { cancelled = true }
  }, [])

  function updateStudent(event) {
    const { name, value } = event.target
    setStudent((current) => ({ ...current, [name]: value }))
  }

  function continueToCompanies(event) {
    event.preventDefault()
    if (Number(student.arrears) !== 0) {
      setNotice('Students must have zero standing arrears to register for placements.')
      return
    }
    setNotice('')
    setStep(2)
  }

  function toggleCompany(company) {
    setSelectedCompanies((current) => {
      if (current.includes(company)) return current.filter((item) => item !== company)
      if (current.length === 4) return current
      return [...current, company]
    })
  }

  async function submitRegistration(event) {
    event.preventDefault()
    if (selectedCompanies.length !== 4) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, companies: selectedCompanies }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not submit registration.')
      setRegistrations((current) => [data.registration, ...current])
      setStudent(emptyStudent)
      setSelectedCompanies([])
      setStep(1)
      setNotice(`${data.registration.name} is registered for placement.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleRegistrations = registrations.filter((registration) =>
    companyFilter === 'All companies' || registration.companies.includes(companyFilter),
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark">P</span>
          <span>pathway<span className="brand-dot">.</span><small>CAREER SERVICES</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="view-nav" aria-label="Workspace views">
          <button className={view === 'student' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('student'); setNotice('') }}>
            <span className="nav-icon">＋</span> Student registration
          </button>
          <button className={view === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('admin'); setNotice('') }}>
            <span className="nav-icon">▤</span> Admin overview
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="term-card"><span className="term-dot" /> Placement season <strong>2025 – 26</strong></div>
          <div className="profile-mini"><div className="avatar">CS</div><div><strong>Career Services</strong><span>Placement office</span></div><span className="profile-menu">···</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {view === 'student' ? 'Student registration' : 'Admin overview'}</div>
          <div className="topbar-right"><span className="live-dot" /> Registration open <span className="topbar-divider" /> <span className="topbar-term">2025 – 26</span></div>
        </header>

        {view === 'student' ? (
          <section className="content-wrap">
            <div className="page-heading">
              <div><div className="eyebrow">CAMPUS PLACEMENTS <span>·</span> 2025 – 26</div><h1>Your next chapter<br />starts <em>here.</em></h1><p>Complete your profile, then choose the companies you want to meet.</p></div>
              <div className="heading-stamp"><span>CAREER<br />READY</span><b>✳</b></div>
            </div>

            {notice && <div className={notice.includes('registered') ? 'notice success-notice' : 'notice'} role="status">{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}

            <div className="registration-layout">
              <div className="form-column">
                <div className="stepper" aria-label={`Step ${step} of 2`}>
                  <div className={step === 1 ? 'step active' : 'step complete'}><span className="step-number">{step > 1 ? '✓' : '01'}</span><span><strong>Student details</strong><small>Your profile & eligibility</small></span></div>
                  <span className={step === 2 ? 'step-line filled' : 'step-line'} />
                  <div className={step === 2 ? 'step active' : 'step'}><span className="step-number">02</span><span><strong>Company choices</strong><small>Pick your top four</small></span></div>
                </div>

                {step === 1 ? (
                  <form className="form-panel" onSubmit={continueToCompanies}>
                    <div className="panel-title"><div><span className="section-kicker">STEP 01 / 02</span><h2>Student profile</h2><p>Tell us a little about yourself.</p></div><span className="required-note"><i /> Required fields</span></div>
                    <div className="form-section"><h3>Personal information</h3><div className="field-grid">
                      <label className="field wide">Student name <span className="required">*</span><input name="name" value={student.name} onChange={updateStudent} placeholder="e.g. Aadhya Raman" autoComplete="name" required /></label>
                      <label className="field">Student ID <span className="required">*</span><input name="studentId" value={student.studentId} onChange={updateStudent} placeholder="e.g. 22CSE104" required /></label>
                      <label className="field">Department <span className="required">*</span><select name="department" value={student.department} onChange={updateStudent} required><option value="">Select department</option><option>Computer Science</option><option>Information Technology</option><option>Electronics & Communication</option><option>Electrical Engineering</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Other</option></select></label>
                      <label className="field">Year <span className="required">*</span><select name="year" value={student.year} onChange={updateStudent} required><option value="">Select year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></label>
                      <label className="field">Section <span className="required">*</span><input name="section" value={student.section} onChange={updateStudent} placeholder="e.g. A" required /></label>
                      <label className="field">Blood group <span className="required">*</span><select name="bloodGroup" value={student.bloodGroup} onChange={updateStudent} required><option value="">Select blood group</option>{['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((group) => <option key={group}>{group}</option>)}</select></label>
                    </div></div>
                    <div className="form-section"><h3>Family details</h3><div className="field-grid">
                      <label className="field">Father’s name <span className="required">*</span><input name="fatherName" value={student.fatherName} onChange={updateStudent} placeholder="Full name" required /></label>
                      <label className="field">Mother’s name <span className="required">*</span><input name="motherName" value={student.motherName} onChange={updateStudent} placeholder="Full name" required /></label>
                    </div></div>
                    <div className="form-section"><h3>Contact & eligibility</h3><div className="field-grid">
                      <label className="field">Phone number <span className="required">*</span><input name="phone" value={student.phone} onChange={updateStudent} type="tel" autoComplete="tel" placeholder="+91 98765 43210" required /></label>
                      <label className="field">Email address <span className="required">*</span><input name="email" value={student.email} onChange={updateStudent} type="email" autoComplete="email" placeholder="you@college.edu" required /></label>
                      <label className="field">Standing arrears <span className="required">*</span><input name="arrears" value={student.arrears} onChange={updateStudent} type="number" min="0" step="1" required /><small className="field-hint">Placement registration requires zero standing arrears.</small></label>
                    </div></div>
                    <div className="form-footer"><span><span className="lock-mark">◆</span> Your information is shared with the placement office.</span><button className="button-primary" type="submit">Continue to companies <span>→</span></button></div>
                  </form>
                ) : (
                  <form className="form-panel choices-panel" onSubmit={submitRegistration}>
                    <div className="panel-title"><div><span className="section-kicker">STEP 02 / 02</span><h2>Choose your companies</h2><p>Select exactly four companies to apply to.</p></div><div className="choice-count"><strong>{selectedCompanies.length}<span> / 4</span></strong><small>selected</small></div></div>
                    <div className="company-grid">{companies.map((company, index) => {
                      const selected = selectedCompanies.includes(company.name)
                      const disabled = !selected && selectedCompanies.length === 4
                      return <button className={`company-option ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} type="button" key={company.name} onClick={() => toggleCompany(company.name)} aria-pressed={selected} disabled={disabled}>
                        <span className={`company-logo ${company.color}`}>{company.initials}</span><span className="company-info"><strong>{company.name}</strong><small>Global technology</small></span><span className="company-check">{selected ? '✓' : '+'}</span><span className="company-index">{String(index + 1).padStart(2, '0')}</span>
                      </button>
                    })}</div>
                    <div className="form-footer choices-footer"><button className="button-quiet" type="button" onClick={() => setStep(1)}>← Back to details</button><button className="button-primary" type="submit" disabled={selectedCompanies.length !== 4 || isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit registration'} <span>→</span></button></div>
                    {selectedCompanies.length !== 4 && <p className="selection-hint">{selectedCompanies.length === 0 ? 'Choose 4 companies to continue.' : `Choose ${4 - selectedCompanies.length} more ${4 - selectedCompanies.length === 1 ? 'company' : 'companies'}.`}</p>}
                  </form>
                )}
              </div>

              <aside className="side-note"><div className="note-top"><span className="note-spark">✳</span><span>THE RIGHT FIRST STEP</span></div><h2>Make room<br />for <em>what’s next.</em></h2><p>One profile opens the door to ten of the world’s leading teams.</p><div className="note-rule" /><div className="note-fact"><span className="fact-number">10</span><span>companies<br />to explore</span></div><div className="note-fact"><span className="fact-number">04</span><span>choices<br />per student</span></div><div className="note-quote">“Your first role is just the beginning.”</div><div className="note-orbit orbit-one" /><div className="note-orbit orbit-two" /></aside>
            </div>
            <footer className="page-footer"><span>PATHWAY <span>·</span> CAREER SERVICES</span><span>Need help? Contact your placement coordinator.</span></footer>
          </section>
        ) : (
          <section className="content-wrap admin-wrap">
            <div className="page-heading admin-heading"><div><div className="eyebrow">PLACEMENT OFFICE <span>·</span> ADMIN</div><h1>Placement <em>overview.</em></h1><p>Track student preferences across all participating companies.</p></div><div className="admin-season"><span className="live-dot" /> ACTIVE SEASON<strong>2025 – 26</strong></div></div>
            <div className="stats-row"><div className="stat-block"><span>TOTAL STUDENTS</span><strong>{registrations.length}</strong><small>registered profiles</small></div><div className="stat-block"><span>COMPANY PREFERENCES</span><strong>{registrations.length * 4}</strong><small>choices submitted</small></div><div className="stat-block"><span>COMPANIES OPEN</span><strong>10</strong><small>available to students</small></div></div>
            <div className="admin-toolbar"><div><span className="section-kicker">STUDENT DIRECTORY</span><h2>Company preferences</h2></div><label className="filter-label">Filter by company<select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}><option>All companies</option>{companies.map((company) => <option key={company.name}>{company.name}</option>)}</select></label></div>
            <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>DEPARTMENT</th><th>YEAR / SECTION</th><th>FAMILY DETAILS</th><th>BLOOD GROUP</th><th>ARREARS</th><th>COMPANY PREFERENCES</th><th>CONTACT</th></tr></thead><tbody>
              {visibleRegistrations.map((registration, index) => <tr key={`${registration.studentId}-${registration.registeredAt}-${index}`}><td><div className="student-cell"><span className="table-avatar">{registration.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{registration.name}</strong><small>{registration.email}</small></span></div></td><td className="id-cell">{registration.studentId}</td><td>{registration.department}</td><td>{registration.year}<span className="section-badge">{registration.section}</span></td><td className="family-cell"><span>F: {registration.fatherName}</span><span>M: {registration.motherName}</span></td><td><span className="section-badge blood-badge">{registration.bloodGroup}</span></td><td><span className="arrears-zero">{registration.arrears}</span></td><td><div className="preference-list">{registration.companies.filter((company) => companyFilter === 'All companies' || company === companyFilter).map((company) => <span className="preference-tag" key={company}>{company}</span>)}</div></td><td>{registration.phone}</td></tr>)}
            </tbody></table>
              {visibleRegistrations.length === 0 && <div className="empty-state"><span className="empty-mark">↗</span><h3>{registrations.length === 0 ? 'Your student list starts here.' : `No students selected ${companyFilter} yet.`}</h3><p>{registrations.length === 0 ? 'Submitted registrations will appear here, grouped by company preference.' : 'Try another company filter to see student preferences.'}</p>{registrations.length === 0 && <button className="button-primary" type="button" onClick={() => setView('student')}>Open student registration <span>→</span></button>}</div>}
            </div>
            <footer className="page-footer"><span>PATHWAY <span>·</span> CAREER SERVICES</span><span>{registrations.length} student{registrations.length === 1 ? '' : 's'} in this browser</span></footer>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
