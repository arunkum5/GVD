import fs from 'fs'
import path from 'path'

// A tiny valid 1x1 orange PNG base64
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const buffer = Buffer.from(pngBase64, 'base64')

const dirs = [
  path.join(process.cwd(), 'public/icons'),
]

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }))

fs.writeFileSync(path.join(process.cwd(), 'public/icons/icon-192.png'), buffer)
fs.writeFileSync(path.join(process.cwd(), 'public/icons/icon-512.png'), buffer)
fs.writeFileSync(path.join(process.cwd(), 'public/apple-touch-icon.png'), buffer)
fs.writeFileSync(path.join(process.cwd(), 'public/favicon.ico'), buffer)

console.log('Dummy PNG icons created successfully.')
