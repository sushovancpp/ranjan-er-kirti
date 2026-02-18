// pages/api/delete.js
// POST { public_id } → deletes image from Cloudinary (server-side, secure)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { public_id } = req.body

  if (!public_id) {
    return res.status(400).json({ error: 'public_id is required' })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary credentials not configured in environment variables.' })
  }

  try {
    // Cloudinary requires a signed timestamp for deletion
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Generate SHA-1 signature
    const crypto = require('crypto')
    const str = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(str).digest('hex')

    const formData = new URLSearchParams()
    formData.append('public_id', public_id)
    formData.append('signature', signature)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )

    const data = await response.json()

    if (data.result === 'ok') {
      return res.status(200).json({ success: true })
    } else {
      return res.status(400).json({ success: false, error: data.result || 'Delete failed' })
    }
  } catch (error) {
    console.error('Delete error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
