import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Targets unambiguous injection patterns only; avoids blocking everyday words
// like "drop", "select", "create", "update" used in normal sentences.
const SQL_RE = /(--|\/\*|\*\/|xp_|\bunion\s+select\b|;\s*(drop|select|insert|update|delete|truncate)\b|\b(exec|execute)\s*\(|\bsleep\s*\(\d|\bdrop\s+table\b)/i

// Encoded profanity blocklist — base64 to avoid plaintext slurs in source
const SLUR_RES = [
  'bmlnZ2Vy', 'bmlnZ2E=', 'Y2hpbms=', 'a2lrZQ==', 'c3BpYw==', 'd2V0YmFjaw==',
  'ZmFnZ290', 'dHJhbm55', 'cmV0YXJk', 'Z29vaw==', 'dG93ZWxoZWFk', 'cmFnaGVhZA==',
  'Y29vbg==', 'YmVhbmVy', 'cGFraQ==', 'emlwcGVyaGVhZA==', 'aHltaWU=', 'bmlw',
  'd29w', 'ZGFnbw==', 'cG9sYWNr',
].map(b => new RegExp(`\\b${atob(b)}\\b`, 'i'))

function validate({ name, email, message }) {
  if (!name.trim() || !email.trim() || !message.trim())
    return '[ All fields required ]'
  if (!EMAIL_RE.test(email.trim()))
    return '[ Invalid email address ]'
  const combined = `${name} ${email} ${message}`
  if (SQL_RE.test(combined))
    return '[ Invalid input detected ]'
  if (SLUR_RES.some(re => re.test(combined)))
    return '[ Message contains prohibited content ]'
  return null
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async () => {
    const error = validate(form)
    if (error) {
      setStatus({ type: 'error', text: error })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...form,
        }).toString(),
      })
      if (res.ok) {
        setStatus({ type: 'success', text: '[ Message transmitted successfully ]' })
        setForm({ name: '', email: '', message: '' })
      } else {
        throw new Error()
      }
    } catch {
      setStatus({ type: 'error', text: '[ Transmission failed — contact via LinkedIn ]' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="panel-tag">Shield Wall · Northern Passage</div>
      <h1 className="panel-title">Open to Opportunities</h1>
      <p>
        I'm actively seeking my next role in full-stack engineering, please feel free to contact me if you know of any suitable roles!
      </p>

      {/* Hidden form so Netlify detects it at build time */}
      <form name="contact" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <textarea name="message" />
      </form>

      <div className="contact-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell me about the opportunity..."
            disabled={submitting}
          />
        </div>
        <button className="btn-transmit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '⟶ Transmitting...' : '⟶ Transmit Message'}
        </button>
        {status && <div className={`msg-status ${status.type}`}>{status.text}</div>}
      </div>

      <h2 className="section-title" style={{ marginTop: '1.75rem' }}>Find Me</h2>
      <div className="skills-grid" style={{ marginTop: '0.5rem' }}>
        <div
          className="skill-tag"
          style={{ cursor: 'pointer' }}
          onClick={() => window.open('https://github.com/GormanV', '_blank')}
        >
          GitHub ↗
        </div>
        <div
          className="skill-tag"
          style={{ cursor: 'pointer' }}
          onClick={() => window.open('https://www.linkedin.com/in/tom-owen/', '_blank')}
        >
          LinkedIn ↗
        </div>
      </div>
    </>
  )
}
