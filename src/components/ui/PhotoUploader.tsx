import { useState, useRef } from 'react'
import { Camera, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { uploadMedia } from '@/lib/storage'
import { toast } from 'sonner'

interface PhotoUploaderProps {
  label: string
  onUploadComplete: (url: string) => void
  onClear: () => void
  existingUrl?: string
}

export default function PhotoUploader({ label, onUploadComplete, onClear, existingUrl }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(existingUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Upload to Supabase and compress
    const { url, error } = await uploadMedia(file, 'dent_photos')
    
    setIsUploading(false)
    
    if (error || !url) {
      toast.error('Failed to upload photo: ' + error)
      return
    }

    setPhotoUrl(url)
    onUploadComplete(url)
    toast.success(`${label} photo saved`)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoUrl(null)
    onClear()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div 
      onClick={() => !isUploading && !photoUrl && fileInputRef.current?.click()}
      className={`relative border rounded-lg p-2 flex flex-col items-center justify-center gap-2 h-32 transition overflow-hidden group
        ${photoUrl ? 'border-primary shadow-sm' : 'border-dashed border-border bg-secondary/30 cursor-pointer hover:bg-secondary/50'}
      `}
    >
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs font-medium">Slow loading...</span>
        </div>
      ) : photoUrl ? (
        <>
          <img src={photoUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground p-2 rounded-full hover:scale-110 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] py-0.5 px-2 rounded backdrop-blur-sm truncate text-center">
            {label}
          </div>
        </>
      ) : (
        <>
          <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium text-center leading-tight">{label}</span>
        </>
      )}
    </div>
  )
}
