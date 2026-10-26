import React, { useState, useEffect, useRef } from 'react'
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  X, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Sparkles,
  BookOpen,
  Calculator,
  Eye,
  Crown,
  Hammer
} from 'lucide-react'

export function VoiceBriefingModal({ isOpen, onClose, store }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0)
  const [threatLevel, setThreatLevel] = useState('HIGH COUNCIL CONVENED')
  const audioRef = useRef(null)

  const currentCheckpoint = store?.currentCheckpoint ?? 1
  const checkpointDate = store?.analysis?.current_checkpoint || '2027-06-01'

  // The 6 Norse Gods of the Odin War Room
  const briefingLines = [
    {
      agent: 'Odin',
      title: 'The Allfather • War Room Sovereign',
      mythRole: 'Ruler of Asgard & High Strategy',
      emotion: 'ALLFATHER AUTHORITY',
      emotionIcon: Crown,
      emotionBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      voiceName: 'Christopher Neural (Resonant Allfather)',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
      audioSrc: '/audio/line_0.mp3',
      text: 'Council of Asgard, hearken to the Allfather! Checkpoint Two is at hand. Nine realms of data lie before us, yet Quillhub stands upon the edge of Ginnungagap. StratoNode and Harbor Retail march to war! Thor, strike through the parchment and reveal the truth!'
    },
    {
      agent: 'Thor',
      title: 'God of Thunder • Mjölnir Extraction',
      mythRole: 'Protector of Midgard & Verbatim Evidence',
      emotion: 'MJÖLNIR STRIKE',
      emotionIcon: Hammer,
      emotionBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      voiceName: 'Roger Neural (Booming Warrior)',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
      audioSrc: '/audio/line_1.mp3',
      text: "By Mjölnir's strike, the contracts are cracked open! Eight agreements forged in stone! But mark this treacherous viper in B1 Section 7.2: a single heartbeat's lapse in our insurance policy is deemed an incurable material breach! Harbor seeks to shatter us where we stand!"
    },
    {
      agent: 'Heimdall',
      title: 'Guardian of Bifröst • Event Sentinel',
      mythRole: 'All-Seeing Watchman of Asgard',
      emotion: 'PIERCING SIGHT',
      emotionIcon: Eye,
      emotionBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse',
      voiceName: 'Guy Neural (Echoing Sentinel)',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.3)]',
      audioSrc: '/audio/line_2.mp3',
      text: 'From the burning heights of Bifröst, my eyes see all! The storm has broken! May uptime has plummeted into the abyss at ninety-eight point eight seven percent! Harbor Retail sounds the horn of battle, demanding twelve thousand dollars in blood tribute!'
    },
    {
      agent: 'Norns',
      title: 'Weavers of Fate • Financial Actuary',
      mythRole: 'Keepers of Urðr, Verðandi & Skuld',
      emotion: 'FATE\'S LEDGER',
      emotionIcon: Calculator,
      emotionBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      voiceName: 'Aria Neural (Mystical Actuary)',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
      audioSrc: '/audio/line_3.mp3',
      text: 'We weave the golden thread of Urðr and Skuld... The ledger bleeds! Downstream claims of twelve thousand dollars, yet from StratoNode, the loom yields a paltry two thousand! Ten thousand dollars lost to the void, and if Harbor severs the pact, a ruin of over one million dollars awaits in the cold shadows!'
    },
    {
      agent: 'Loki',
      title: 'The Trickster • Adversarial Counterparty',
      mythRole: 'Architect of Chaos & Red-Team Legal Attack',
      emotion: 'MALICIOUS FLAME',
      emotionIcon: Zap,
      emotionBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
      voiceName: 'Ryan Neural (Laughing Trickster)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_35px_rgba(244,63,94,0.5)]',
      audioSrc: '/audio/line_4.mp3',
      text: 'Ahahaha! Did you foolish gods truly believe you could escape your Ragnarök? Harbor holds the slaughter-hook under Section 8.1! Two consecutive failures, and they cut Quillhub down! And your insurance policies die on June thirtieth! You are trapped in your own hubris!'
    },
    {
      agent: 'Tyr',
      title: 'God of Binding Oaths • Legal Arbitrator',
      mythRole: 'Champion of Justice & Sacrificial Hand',
      emotion: 'BINDING LAW',
      emotionIcon: ShieldCheck,
      emotionBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      voiceName: 'Eric Neural (Unbending Law)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
      audioSrc: '/audio/line_5.mp3',
      text: 'Silence thy tongue, trickster! I am the Law and the Binding Oath! Harbor Retail hath broken the sacred timeline! Section 3.5 demands written claim within forty-five days, yet they slept sixty days in cowardice! Their March claim is severed and dead! I have inked the rejection decree and bound the Meridian policies for eternity!'
    },
    {
      agent: 'Odin',
      title: 'The Allfather • Consensus Decree',
      mythRole: 'Ruler of the Nine Realms',
      emotion: 'VICTORIOUS SOVEREIGN',
      emotionIcon: Sparkles,
      emotionBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      voiceName: 'Christopher Neural (Resonant Allfather)',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
      audioSrc: '/audio/line_6.mp3',
      text: 'The High Council hath spoken! Law prevails over chaos, and Quillhub shall not fall this day. Mortal Commander, the decrees are inscribed upon your console. Give the signal, and dispatch the war orders!'
    }
  ]

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const playLine = (idx) => {
    if (idx >= briefingLines.length) {
      setIsPlaying(false)
      setCurrentSentenceIdx(0)
      return
    }

    setCurrentSentenceIdx(idx)
    setIsPlaying(true)

    // Dynamic Mythological Threat State
    if (idx === 1) setThreatLevel('THOR: CONTRACTS SHATTERED')
    else if (idx === 2) setThreatLevel('HEIMDALL: BIFRÖST SIREN ACTIVE')
    else if (idx === 3) setThreatLevel('NORNS: FATE WEAVING EXPOSURE')
    else if (idx === 4) setThreatLevel('LOKI: RAGNARÖK THREAT DECLARED')
    else if (idx === 5) setThreatLevel('TYR: RIGHTEOUS DECREE STRUCK')
    else if (idx === 6) setThreatLevel('ODIN: ASGARD PREVAILS')
    else setThreatLevel('HIGH COUNCIL CONVENED')

    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Cache-buster ensures browser loads updated Norse mythology audio
    const audio = new Audio(`${briefingLines[idx].audioSrc}?v=${Date.now()}`)
    audioRef.current = audio

    audio.onended = () => {
      setTimeout(() => {
        playLine(idx + 1)
      }, 400)
    }

    audio.onerror = () => {
      console.warn('Audio playback error on line', idx)
      playLine(idx + 1)
    }

    audio.play().catch(e => {
      console.warn('Autoplay blocked:', e)
      setIsPlaying(false)
    })
  }

  useEffect(() => {
    if (isOpen) {
      playLine(0)
    } else {
      stopAudio()
    }
    return () => stopAudio()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-white">
        
        {/* Cinematic Norse Council Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                ASGARD HIGH COUNCIL • AUDIO SAGA
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {threatLevel}
              </span>
              <button
                onClick={() => {
                  stopAudio()
                  onClose()
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>The Voice of the Norse Council</span>
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Checkpoint {currentCheckpoint + 1} ({checkpointDate})
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Odin, Thor, Heimdall, Norns, Loki & Tyr adjudicating Quillhub's contract survival.
              </p>
            </div>

            {/* Dynamic Equalizer Visualizer */}
            <div className="flex items-center gap-1 h-9 bg-black/60 px-3 py-1 rounded-xl border border-slate-800 shrink-0">
              {[60, 100, 75, 95, 45, 85, 100, 50, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying 
                      ? currentSentenceIdx === 4 
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                        : currentSentenceIdx === 5 
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                        : currentSentenceIdx === 3
                        ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                        : currentSentenceIdx === 1
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : currentSentenceIdx === 2
                        ? 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                        : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.8)))}%` : '20%',
                    transitionDelay: `${i * 25}ms`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Mythological Dialogue Stream */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[440px] overflow-y-auto bg-slate-950/90 divide-y divide-slate-800/40">
          {briefingLines.map((line, idx) => {
            const isCurrent = currentSentenceIdx === idx && isPlaying
            const EmotionIcon = line.emotionIcon

            return (
              <div
                key={idx}
                onClick={() => playLine(idx)}
                className={`pt-3.5 first:pt-0 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  isCurrent
                    ? `bg-slate-900 border-indigo-500/80 ${line.glow} scale-[1.01] ring-1 ring-indigo-500/50`
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-md ${line.bg} ${line.color} border ${line.border}`}>
                      {line.agent}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300">
                      {line.title}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${line.emotionBadge}`}>
                      <EmotionIcon size={11} />
                      {line.emotion}
                    </span>
                  </div>

                  {isCurrent ? (
                    <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      <Radio size={12} className="animate-pulse text-amber-400" />
                      CHANNELED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 opacity-0 hover:opacity-100">
                      <Play size={10} /> Invoke God
                    </span>
                  )}
                </div>

                <p className={`text-xs leading-relaxed italic ${isCurrent ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                  "{line.text}"
                </p>
              </div>
            )
          })}
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={stopAudio}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <VolumeX size={15} />
                <span>Pause Audio</span>
              </button>
            ) : (
              <button
                onClick={() => playLine(currentSentenceIdx)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                <Volume2 size={15} />
                <span>Chant of the Gods</span>
              </button>
            )}
            <button
              onClick={() => playLine(0)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Restart Saga</span>
            </button>
          </div>

          <button
            onClick={() => {
              stopAudio()
              onClose()
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 via-indigo-600 to-blue-600 hover:opacity-90 text-white transition-all shadow-xs"
          >
            Enter War Room Adjudication
          </button>
        </div>
      </div>
    </div>
  )
}
