import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sendAssistantMessage } from '../../api/assistant'
import { useCart } from '../../hooks/useCart'
import AssistantProductCard from './AssistantProductCard'
import './ShoppingAssistant.css'

const QUICK_PROMPTS = [
  'What are your best deals right now?',
  'Recommend something under ₹2000',
  'Which items are low in stock?',
  'Help me pick a gift',
]

const WELCOME =
  "Hi, I'm Luxe — your AI stylist. Ask me about products, prices, or what to buy — I'll show picks you can add to your bag instantly."

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function ShoppingAssistant() {
  const panelId = useId()
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasInteracted, setHasInteracted] = useState(false)
  const [messages, setMessages] = useState(() => [
    { id: 'welcome', role: 'assistant', text: WELCOME, products: [] },
  ])
  const { cartCount } = useCart()
  const listRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, messages, loading, scrollToBottom])

  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => inputRef.current?.focus(), 280)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setHasInteracted(true)
    setError('')
    setInput('')
    setMessages((prev) => [
      ...prev,
      { id: createId(), role: 'user', text: trimmed, products: [] },
    ])
    setLoading(true)

    try {
      const data = await sendAssistantMessage(trimmed)
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          text: data.response ?? '',
          products: data.products ?? [],
        },
      ])
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    void send(input)
  }

  return (
    <div className={`shopping-assistant${open ? ' shopping-assistant--open' : ''}`}>
      {open && (
        <button
          type="button"
          className="shopping-assistant__backdrop"
          aria-label="Close assistant"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="shopping-assistant__panel"
        id={panelId}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-labelledby="assistant-title"
      >
        <div className="shopping-assistant__mesh" aria-hidden />
        <header className="shopping-assistant__header">
          <div className="shopping-assistant__avatar" aria-hidden>
            <span className="shopping-assistant__orb" />
            <SparkleIcon />
          </div>
          <div className="shopping-assistant__headcopy">
            <h2 id="assistant-title">Luxe AI</h2>
            <p>
              <span className="shopping-assistant__live" aria-hidden />
              Shopping assistant · Powered by Gemini
            </p>
          </div>
          <div className="shopping-assistant__header-actions">
            {cartCount > 0 && (
              <Link
                to="/cart"
                className="shopping-assistant__bag"
                onClick={() => setOpen(false)}
              >
                Bag
                <span className="shopping-assistant__bag-count">{cartCount}</span>
              </Link>
            )}
            <button
              type="button"
              className="shopping-assistant__close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
        </header>

        <div className="shopping-assistant__messages" ref={listRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`shopping-assistant__row shopping-assistant__row--${msg.role}`}
            >
              {msg.role === 'assistant' && (
                <div className="shopping-assistant__mini-avatar" aria-hidden>
                  <SparkleIcon />
                </div>
              )}
              <div className="shopping-assistant__bubble-wrap">
                <div className="shopping-assistant__bubble">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                  ))}
                </div>
                {msg.products?.length > 0 && (
                  <div className="shopping-assistant__products">
                    <p className="shopping-assistant__products-label">
                      <span aria-hidden>✦</span> Picked for you
                    </p>
                    <div className="shopping-assistant__carousel">
                      {msg.products.map((product) => (
                        <AssistantProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="shopping-assistant__row shopping-assistant__row--assistant">
              <div className="shopping-assistant__mini-avatar" aria-hidden>
                <SparkleIcon />
              </div>
              <div className="shopping-assistant__bubble shopping-assistant__bubble--typing">
                <span className="shopping-assistant__dot" />
                <span className="shopping-assistant__dot" />
                <span className="shopping-assistant__dot" />
                <span className="visually-hidden">Luxe is thinking…</span>
              </div>
            </div>
          )}

          {error && (
            <p className="shopping-assistant__error" role="alert">
              {error}
            </p>
          )}
        </div>

        {!hasInteracted && messages.length <= 1 && !loading && (
          <div className="shopping-assistant__chips">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="shopping-assistant__chip"
                onClick={() => void send(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form className="shopping-assistant__composer" onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="visually-hidden">
            Message Luxe
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="shopping-assistant__input"
            placeholder="Ask about products, deals, or gifts…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoComplete="off"
            maxLength={500}
          />
          <button
            type="submit"
            className="shopping-assistant__send"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>

      <button
        type="button"
        className={`shopping-assistant__fab${!hasInteracted && !open ? ' shopping-assistant__fab--pulse' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="shopping-assistant__fab-ring" aria-hidden />
        <span className="shopping-assistant__fab-inner">
          {open ? <CloseChatIcon /> : <SparkleIcon large />}
        </span>
        <span className="shopping-assistant__fab-label">
          {open ? 'Close' : 'Ask Luxe'}
        </span>
      </button>
    </div>
  )
}

function SparkleIcon({ large }) {
  return (
    <svg
      className={large ? 'shopping-assistant__icon-lg' : undefined}
      width={large ? 26 : 16}
      height={large ? 26 : 16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M19 14l.9 2.7L22.5 17l-2.6.8L19 20.5l-.9-2.7-2.6-.8 2.6-.8.9-2.7Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m5 12 14-7-4 7 4 7-14-7Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CloseChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
