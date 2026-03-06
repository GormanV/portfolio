import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', text: '[ All fields required ]' })
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
          onClick={() => window.open('https://linkedin.com', '_blank')}
        >
          LinkedIn ↗
        </div>
      </div>
    </>
  )
}
