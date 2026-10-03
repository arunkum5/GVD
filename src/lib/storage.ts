import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'

export const uploadMedia = async (
  file: File,
  folder: string = 'general',
  prefix: string = ''
): Promise<{ url: string | null; error: string | null }> => {
  try {
    let fileToUpload = file

    // Compress images if it's a photo
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/webp'
      }
      try {
        fileToUpload = await imageCompression(file, options)
      } catch (error) {
        console.warn('Compression failed, using original file', error)
      }
    }

    // Generate unique filename
    const fileExt = fileToUpload.type.startsWith('image/') ? 'webp' : file.name.split('.').pop()
    const sanitizedPrefix = prefix ? `${prefix.replace(/[^a-zA-Z0-9]/g, '_')}_` : ''
    const fileName = `${folder}/${sanitizedPrefix}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Supabase Storage Bucket ('gvd-media')
    const { data, error } = await supabase.storage
      .from('gvd-media')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload Error:', error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('gvd-media')
      .getPublicUrl(data.path)

    return { url: publicUrlData.publicUrl, error: null }
  } catch (error: any) {
    return { url: null, error: error.message || 'Failed to upload media' }
  }
}
