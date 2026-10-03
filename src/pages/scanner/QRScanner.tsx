import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Camera } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { toast } from 'sonner'

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Only initialize scanner if not already done
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText)
        scanner.clear()
        toast.success('QR Scanned Successfully')
        
        // Mock routing based on scan
        if (decodedText.includes('JC-')) {
          navigate('/staff/job-cards/1')
        }
      },
      (error) => {
        // Handle scan errors silently as it scans continuously
      }
    )

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [navigate])

  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-6 pt-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          Vehicle QR Scanner
        </h1>
        <p className="text-muted-foreground mt-2">Scan vehicle pass or job card QR</p>
      </div>

      <div className="w-full bg-card p-4 rounded-xl border shadow-xl">
        {scanResult ? (
          <div className="text-center p-8 space-y-4">
            <div className="h-16 w-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="h-8 w-8" />
            </div>
            <p className="font-medium text-lg">Result: {scanResult}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium"
            >
              Scan Again
            </button>
          </div>
        ) : (
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-dashed border-border" />
        )}
      </div>
      
      <div className="text-sm text-muted-foreground text-center flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
        <Camera className="h-4 w-4" /> 
        Point camera at the QR code
      </div>
    </div>
  )
}
