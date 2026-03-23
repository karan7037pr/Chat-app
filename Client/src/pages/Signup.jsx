import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.email || !form.password)
      return setError('All fields are required.')
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.wordmark}>CHAT<span style={styles.dot}>.</span></div>
          <p style={styles.tagline}>
            Real conversations,<br />delivered instantly.
          </p>
          <div style={styles.lines}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...styles.line, opacity: 1 - i * 0.13, animationDelay: `${i * 0.1}s` }} className="line-anim" />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formWrap} className="form-enter">

          <div style={styles.formHeader}>
            <p style={styles.formEyebrow}>CREATE ACCOUNT</p>
            <h1 style={styles.formTitle}>Start your<br />conversation.</h1>
          </div>

          {error && (
            <div style={styles.errorBox} className="fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>

            <div style={styles.field} className="field-slide">
              <label style={styles.label}>USERNAME</label>
              <input
                type="text"
                placeholder="cooluser123"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={styles.input}
                className="inp"
              />
            </div>

            <div style={{ ...styles.field, animationDelay: '0.07s' }} className="field-slide">
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                className="inp"
              />
            </div>

            <div style={{ ...styles.field, animationDelay: '0.14s' }} className="field-slide">
              <label style={styles.label}>PASSWORD</label>
              <input
                type="password"
                placeholder="min 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                className="inp"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.btn}
              className="btn-hover"
            >
              {loading ? (
                <span style={styles.btnInner}>
                  <span className="spin" style={styles.spinner} /> Creating account
                </span>
              ) : (
                <span style={styles.btnInner}>
                  Create Account <span style={styles.arrow}>→</span>
                </span>
              )}
            </button>

          </form>

          <p style={styles.switchText}>
            Already have one?{' '}
            <Link to="/login" style={styles.switchLink}>
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#fafaf9',
    fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif",
  },
  left: {
    width: '42%',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: { position: 'relative', zIndex: 2 },
  wordmark: {
    fontSize: '52px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-2px',
    lineHeight: 1,
    marginBottom: '24px',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  dot: { color: '#e8ff47' },
  tagline: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.7,
    fontWeight: '400',
    marginBottom: '64px',
    letterSpacing: '0.01em',
  },
  lines: { display: 'flex', flexDirection: 'column', gap: '10px' },
  line: { height: '1px', width: '100%', background: 'rgba(255,255,255,0.15)' },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  formWrap: { width: '100%', maxWidth: '380px' },
  formHeader: { marginBottom: '40px' },
  formEyebrow: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.18em',
    color: '#9ca3af',
    marginBottom: '14px',
  },
  formTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0a0a0a',
    lineHeight: 1.15,
    letterSpacing: '-1px',
  },
  errorBox: {
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '13px',
    marginBottom: '24px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#6b7280',
  },
  input: {
    padding: '13px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid #e5e7eb',
    outline: 'none',
    fontSize: '15px',
    color: '#0a0a0a',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  btn: {
    marginTop: '12px',
    padding: '15px 24px',
    background: '#0a0a0a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.01em',
  },
  btnInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  arrow: { transition: 'transform 0.2s' },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    display: 'inline-block',
  },
  switchText: {
    marginTop: '32px',
    fontSize: '13px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  switchLink: {
    color: '#0a0a0a',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: '1px solid #0a0a0a',
    paddingBottom: '1px',
  },
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&display=swap');

  .form-enter {
    animation: formEnter 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes formEnter {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .field-slide {
    animation: fieldSlide 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes fieldSlide {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .line-anim {
    animation: lineGrow 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  .fade-in {
    animation: fadeIn 0.3s ease both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .inp:focus {
    border-bottom-color: #0a0a0a !important;
  }
  .btn-hover:hover {
    background: #1f1f1f !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  .btn-hover:active { transform: translateY(0) !important; }
  .btn-hover:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
  .spin { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`