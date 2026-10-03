import { useState, useRef } from 'react'
import { Mic, Square, Loader2, Play, Pause, Trash2, CheckCircle2 } from 'lucide-react'
import { uploadMedia } from '@/lib/storage'
import { toast } from 'sonner'

interface VoiceRecorderProps {
  onUploadComplete: (url: string) => void
  onClear: () => void
  existingUrl?: string
}

export default function VoiceRecorder({ onUploadComplete, onClear, existingUrl }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl || null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await handleUpload(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Microphone access denied', err)
      toast.error('Microphone access required to record voice notes.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleUpload = async (blob: Blob) => {
    setIsUploading(true)
    
    // Create a File from Blob
    const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' })
    
    const { url, error } = await uploadMedia(file, 'voice_notes')
    
    setIsUploading(false)
    
    if (error || !url) {
      toast.error('Failed to upload voice note: ' + error)
      return
    }

    setAudioUrl(url)
    onUploadComplete(url)
    toast.success('Voice note saved')
  }

  const handleClear = () => {
    setAudioUrl(null)
    onClear()
  }

  if (isUploading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground animate-pulse border border-border">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Compressing & Uploading Voice Note...
      </div>
    )
  }

  if (audioUrl) {
    return (
      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <audio controls src={audioUrl} className="h-10 w-48 sm:w-64" />
        </div>
        <button 
          type="button"
          onClick={handleClear}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg font-medium transition"
        >
          <Mic className="h-4 w-4" /> Record Voice Note
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg font-medium animate-pulse"
          >
            <Square className="h-4 w-4" /> Stop Recording
          </button>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm text-red-500 font-medium">Recording...</span>
          </div>
        </div>
      )}
    </div>
  )
}
