import type { ReactNode } from "react"
import progressBarStyle from "@/styles/Progress.module.css"

type Props = {
  children?: ReactNode
  value: number
  className?: string
}

const usageBarColor = (percent: number): string => {
  if (percent > 90) return "#e44"
  if (percent > 75) return "#cc2"
  return "#4e4"
}

const Progressbar = ({ value, className }: Props) => {
  return (
    <>
      <div className={`${progressBarStyle.progressBar} ${className}`}>
        <span
          className={progressBarStyle.progressBarUsage}
          style={{
            width: `${value}%`,
            backgroundColor: usageBarColor(value),
          }}
        />
      </div>
    </>
  )
}

export default Progressbar
