"use client"

import { useEffect, useRef, useState } from "react"

type WaveformProps = {
  audioURL: string
}

export default function Waveform({ audioURL }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const initAudioContext = async () => {
    if (!audioRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)()
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      if (!sourceRef.current && audioContextRef.current) {
        const source = audioContextRef.current.createMediaElementSource(
          audioRef.current,
        )
        const newAnalyser = audioContextRef.current.createAnalyser()
        newAnalyser.fftSize = 2048

        source.connect(newAnalyser)
        newAnalyser.connect(audioContextRef.current.destination)

        sourceRef.current = source
        setAnalyser(newAnalyser)
      }
    } catch (error) {
      console.error("Audio initialization failed:", error)
    }
  }

  const handlePlay = async () => {
    await initAudioContext()
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    initAudioContext()

    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      if (analyser) {
        analyser.disconnect()
        setAnalyser(null)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [audioURL])

  useEffect(() => {
    let animationFrameId: number

    const drawWaveform = () => {
      if (!canvasRef.current || !analyser || !isPlaying) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
      }
      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      const draw = () => {
        if (!isPlaying) return
        animationFrameId = requestAnimationFrame(draw)
        analyser.getByteTimeDomainData(dataArray)

        ctx.fillStyle = "rgb(15, 23, 42)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.lineWidth = 2
        ctx.strokeStyle = "rgb(34, 197, 94)"
        ctx.beginPath()

        const sliceWidth = canvas.width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * canvas.height) / 2
          ctx[i === 0 ? "moveTo" : "lineTo"](x, y)
          x += sliceWidth
        }

        ctx.stroke()
      }

      draw()
    }

    drawWaveform()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isPlaying, analyser])

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="flex-grow relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
      <div className="h-16">
        <audio
          ref={audioRef}
          controls
          onPlay={handlePlay}
          onPause={handlePause}
          className="w-full"
        >
          <source src={audioURL} type={`audio/${audioURL.split(".").pop()}`} />
          <track
            src={`${audioURL}.vtt`}
            kind="captions"
            srcLang="en"
            label="English"
            default
          />
        </audio>
      </div>
    </div>
  )
}
