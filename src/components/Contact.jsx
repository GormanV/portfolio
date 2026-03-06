import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', text: '[ All fields required ]' })
      return
    }
    try {
      const res = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus({ type: 'success', text: '[ Message transmitted successfully ]' })
        setForm({ name: '', email: '', message: '' })
      } else {
        throw new Error()
      }
    } catch {
      setStatus({ type: 'error', text: '[ Transmission failed — contact via LinkedIn ]' })
    }
  }

  return (
    <>
      <div className="panel-tag">Shield Wall · Northern Passage</div>
      <h1 className="panel-title">Open to Opportunities</h1>
      <p>
        I'm actively seeking my next role in full-stack engineering.
      </p>

      <div className="contact-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
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
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell me about the opportunity..."
          />
        </div>
        <button className="btn-transmit" onClick={handleSubmit}>
          ⟶ Transmit Message
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
