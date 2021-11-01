import styles from '../styles/Home.module.css'
import { useState } from 'react'

type ProgressBar = {
  shortDescription: string
  fullDescription: any
  max: number
  current: number
}

const ProgressBar: React.FC<ProgressBar> = (r: ProgressBar) => {
  const [shown, setShown] = useState<boolean>(false)
  return (
    <div className={styles.progressbarcontainer}>
      <div className={styles.progressbar} onClick={() => setShown(!shown)} style={shown ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}}>
        <div className={styles.filler} style={{ width: r.current >= r.max ? '100%' : `${(r.current / r.max) * 100}%` }} />
        <span className={styles.shortdescription}>{r.shortDescription}</span>
        <span className={styles.label}>{r.current >= r.max ? 'Funded!' : `${r.current.toFixed(2)} / ${r.max.toFixed(2)} BNB`}</span>
      </div>
      {
        shown &&
        <div className={styles.fulldescription}>{r.fullDescription}</div>
      }
    </div >
  )
}

export default ProgressBar