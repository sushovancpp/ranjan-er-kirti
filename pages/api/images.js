// pages/api/images.js
// GET  - fetch all images from Cloudinary (via Admin API)
// POST - save image metadata (after client-side upload)

// We store image metadata in a simple JSON "database" using Cloudinary's context/tags.
// For production you'd use a real DB. Here we use Cloudinary's resource listing.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME
      const apiKey = process.env.CLOUDINARY_API_KEY
      const apiSecret = process.env.CLOUDINARY_API_SECRET

      if (!cloudName || !apiKey || !apiSecret) {
        // Return empty array if env vars not configured
        return res.status(200).json({ images: [] })
      }

      // Fetch resources from Cloudinary
      const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=200&tags=true&context=true`,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Cloudinary API error: ${response.status}`)
      }

      const data = await response.json()
      
      const images = (data.resources || []).map(resource => ({
        url: resource.secure_url,
        public_id: resource.public_id,
        caption: resource.context?.custom?.caption || '',
        created_at: resource.created_at,
        width: resource.width,
        height: resource.height,
      })).reverse() // newest first

      return res.status(200).json({ images })
    } catch (error) {
      console.error('Error fetching images:', error)
      return res.status(500).json({ error: error.message, images: [] })
    }
  }

  if (req.method === 'POST') {
    // The client uploads directly to Cloudinary, we just acknowledge here.
    // Optionally save to your own DB here.
    const { url, public_id, caption, created_at, width, height } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'url is required' })
    }

    // If you want to add caption via Admin API after upload:
    if (caption && public_id) {
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (cloudName && apiKey && apiSecret) {
          const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
          await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${public_id}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ context: `caption=${caption}` }),
            }
          )
        }
      } catch (err) {
        console.warn('Could not update caption:', err.message)
      }
    }

    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
