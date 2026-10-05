const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay))
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay)
      else reject(new Error('Razorpay unavailable'))
    }
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}
