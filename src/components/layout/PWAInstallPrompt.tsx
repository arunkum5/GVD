import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
  }

  // Only show if there's a prompt available and it hasn't been dismissed
  if (!deferredPrompt || isDismissed) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-auto animate-slide-up">
      <div className="bg-primary/95 text-primary-foreground backdrop-blur-md py-2 px-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-primary/20 flex items-center justify-center gap-3">
        <span className="font-bold text-xs ml-1">Install App</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleInstallClick}
            className="bg-white text-primary p-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-orange-50 transition"
            title="Install App"
          >
            <Download className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setIsDismissed(true)}
            className="p-1.5 opacity-70 hover:opacity-100 hover:bg-black/10 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
