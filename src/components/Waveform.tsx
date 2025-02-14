"use client"

import { useEffect, useRef, useState } from "react"

type WaveformProps = {
  audioURL: string
}

export default function Waveform({ audioURL }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const newAudioContext = new AudioContext()
    const source = newAudioContext.createMediaElementSource(audioRef.current)
    const newAnalyser = newAudioContext.createAnalyser()
    newAnalyser.fftSize = 2048
    source.connect(newAnalyser)
    newAnalyser.connect(newAudioContext.destination)

    setAudioContext(newAudioContext)
    setAnalyser(newAnalyser)

    return () => {
      source.disconnect()
      newAnalyser.disconnect()
      newAudioContext.close()
    }
  }, [audioURL])

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isPlaying) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight * 0.8
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying) return
      requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = "lime"
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isPlaying, analyser])

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="flex-grow relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
      <div className="h-16 mt-2">
        <audio
          ref={audioRef}
          controls
          src={audioURL}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full"
        />
      </div>
    </div>
  )
}
