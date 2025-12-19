"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform, LayoutGroup } from "framer-motion"
import {
  Twitter,
  Instagram,
  Github,
  Music,
  MapPin,
  Youtube,
  ArrowRight,
  Check,
  LayoutGrid,
  Zap,
  MousePointer2,
  ExternalLink,
  Globe,
  Briefcase,
  ArrowUpRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useVelocity } from "framer-motion" // Added import for useVelocity

// --- UTILITY COMPONENTS ---

const WidgetCard = ({ children, className, delay = 0, rotate = 0, floatDuration = 5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50, rotate: rotate }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
        rotate: rotate,
      }}
      transition={{
        opacity: { duration: 0.8, delay: delay },
        scale: { duration: 0.8, delay: delay, type: "spring" },
        y: {
          duration: floatDuration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: Math.random() * 2,
        },
      }}
      className={`absolute shadow-2xl border border-white/60 backdrop-blur-md bg-white/90 ${className}`}
      style={{ borderRadius: "32px" }}
    >
      {children}
    </motion.div>
  )
}

const FeatureCard = ({ title, description, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: delay, duration: 0.5 }}
      className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 group"
    >
      <div className="w-14 h-14 bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-300 rounded-2xl flex items-center justify-center text-black border border-gray-100">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-medium">{description}</p>
      </div>
    </motion.div>
  )
}

// --- REALTIME REORDERABLE GRID WITH PHYSICS ---

const ProfileBentoDemo = () => {
  const [items, setItems] = useState([
    { id: "1", label: "NDRT", icon: Globe, bg: "#111", color: "#fff", span: 2, type: "banner" },
    {
      id: "2",
      label: "Twitter",
      subtitle: "@yourhandle",
      icon: Twitter,
      bg: "#fff",
      color: "#111",
      span: 1,
      type: "social",
      accent: "#1DA1F2",
    },
    { id: "3", label: "mysite.io", icon: ExternalLink, bg: "#fff", color: "#111", span: 1, type: "link" },
    {
      id: "4",
      label: "Instagram",
      subtitle: "@yourhandle",
      icon: Instagram,
      bg: "#fff",
      color: "#111",
      span: 1,
      type: "instagram",
      accent: "#E4405F",
    },
    {
      id: "5",
      label: "GitHub",
      subtitle: "Your Name",
      icon: Github,
      bg: "#fff",
      color: "#111",
      span: 1,
      type: "github",
    },
    {
      id: "6",
      label: "YouTube",
      subtitle: "Your Channel",
      icon: Youtube,
      bg: "#fff",
      color: "#111",
      span: 1,
      type: "youtube",
      accent: "#FF0000",
    },
    {
      id: "7",
      label: "Portfolio",
      subtitle: "yoursite.com",
      icon: Briefcase,
      bg: "#fff",
      color: "#111",
      span: 1,
      type: "portfolio",
    },
  ])

  const [draggingId, setDraggingId] = useState<string | null>(null)

  const itemsRef = useRef(new Map())
  const positionsRef = useRef(new Map())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const swap = (id1: string, id2: string) => {
    const index1 = items.findIndex((i) => i.id === id1)
    const index2 = items.findIndex((i) => i.id === id2)
    if (index1 === -1 || index2 === -1 || index1 === index2) return

    const newItems = [...items]
    const [removed] = newItems.splice(index1, 1)
    newItems.splice(index2, 0, removed)
    setItems(newItems)
  }

  const onDragStart = () => {
    positionsRef.current.clear()
    itemsRef.current.forEach((el: HTMLElement, id: string) => {
      const rect = el.getBoundingClientRect()
      positionsRef.current.set(id, {
        centerX: rect.left + rect.width / 2 + window.scrollX,
        centerY: rect.top + rect.height / 2 + window.scrollY,
        width: rect.width,
        height: rect.height,
      })
    })
  }

  const handleDrag = (point: { x: number; y: number }, currentId: string) => {
    if (timeoutRef.current) return

    let closestId: string | null = null
    let minDistance = 10000

    positionsRef.current.forEach(
      (pos: { centerX: number; centerY: number; width: number; height: number }, id: string) => {
        if (id === currentId) return

        const dist = Math.hypot(point.x - pos.centerX, point.y - pos.centerY)

        if (dist < minDistance && dist < Math.min(pos.width, pos.height) / 1.8) {
          minDistance = dist
          closestId = id
        }
      },
    )

    if (closestId) {
      swap(currentId, closestId)

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        onDragStart()
      }, 200)
    }
  }

  return (
    <div className="w-full bg-gray-50/80 p-6 md:p-10 rounded-[32px] border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Profile Section */}
        <div className="lg:w-1/3 flex flex-col">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden mb-6 ring-4 ring-white shadow-lg">
            <img src="/professional-portrait.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-3xl font-black tracking-tight mb-3">Your Name</h3>
          <p className="text-gray-500 text-base leading-relaxed">
            This is your bio. Share a bit about yourself, what you do, and what makes you unique.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-center gap-2 mb-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <MousePointer2 size={14} /> Drag to reorder
          </div>
          <LayoutGroup>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <ProfileBentoItem
                  key={item.id}
                  item={item}
                  setDraggingId={setDraggingId}
                  draggingId={draggingId}
                  handleDrag={handleDrag}
                  onDragStart={onDragStart}
                  itemsRef={itemsRef}
                />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>
    </div>
  )
}

const ProfileBentoItem = ({
  item,
  setDraggingId,
  draggingId,
  handleDrag,
  itemsRef,
  onDragStart,
}: {
  item: {
    id: string
    label: string
    subtitle?: string
    icon: React.ElementType
    bg: string
    color: string
    span: number
    type: string
    accent?: string
  }
  setDraggingId: (id: string | null) => void
  draggingId: string | null
  handleDrag: (point: { x: number; y: number }, id: string) => void
  itemsRef: React.MutableRefObject<Map<string, HTMLElement>>
  onDragStart: () => void
}) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xVelocity = useVelocity(x)
  const rotateVelocity = useTransform(xVelocity, [-1000, 1000], [-5, 5])
  const rotate = useSpring(rotateVelocity, { damping: 20, stiffness: 400 })

  const isDragging = draggingId === item.id

  const getCardContent = () => {
    switch (item.type) {
      case "banner":
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl font-black tracking-tighter opacity-90">{item.label}</span>
          </div>
        )
      case "social":
      case "youtube":
        return (
          <>
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.accent ? `${item.accent}15` : "#f3f4f6" }}
              >
                <item.icon size={20} style={{ color: item.accent }} />
              </div>
            </div>
            <div className="mt-auto">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs text-gray-400">{item.subtitle}</p>
              <button
                className="mt-3 px-4 py-1.5 text-xs font-bold rounded-full text-white"
                style={{ backgroundColor: item.accent }}
              >
                {item.type === "youtube" ? "Subscribe" : "Follow"}
              </button>
            </div>
          </>
        )
      case "instagram":
        return (
          <>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.accent ? `${item.accent}15` : "#f3f4f6" }}
              >
                <item.icon size={20} style={{ color: item.accent }} />
              </div>
              <div className="grid grid-cols-2 gap-1 flex-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-md bg-gray-100 overflow-hidden">
                    <img
                      src={`/lifestyle-photo.png?key=wo2xm&key=didew&height=40&width=40&query=lifestyle photo ${i}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-xs text-gray-500">{item.subtitle}</p>
              <button
                className="mt-2 px-4 py-1.5 text-xs font-bold rounded-full text-white"
                style={{ backgroundColor: item.accent }}
              >
                Follow
              </button>
            </div>
          </>
        )
      case "github":
        return (
          <>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <item.icon size={20} />
              </div>
              <div className="grid grid-cols-7 gap-0.5 flex-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-sm"
                    style={{
                      backgroundColor:
                        Math.random() > 0.5 ? `rgba(34, 197, 94, ${Math.random() * 0.8 + 0.2})` : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <p className="font-bold text-sm">{item.subtitle}</p>
              <button className="mt-2 px-4 py-1.5 text-xs font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Follow
              </button>
            </div>
          </>
        )
      case "link":
      case "portfolio":
        return (
          <>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <item.icon size={18} className="text-white" />
              </div>
              <ArrowUpRight size={16} className="text-gray-400" />
            </div>
            <div className="mt-auto">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs text-gray-400">{item.subtitle || item.label.toLowerCase()}</p>
            </div>
          </>
        )
      default:
        return (
          <>
            <item.icon size={24} />
            <p className="font-bold mt-auto">{item.label}</p>
          </>
        )
    }
  }

  return (
    <motion.div
      layout
      layoutId={item.id}
      ref={(el) => {
        if (el) itemsRef.current.set(item.id, el)
        else itemsRef.current.delete(item.id)
      }}
      style={{
        x,
        y,
        rotate: isDragging ? rotate : 0,
        zIndex: isDragging ? 100 : 1,
        backgroundColor: item.bg,
        color: item.color,
      }}
      drag
      dragElastic={0.1}
      dragSnapToOrigin
      onDragStart={() => {
        setDraggingId(item.id)
        onDragStart()
      }}
      onDrag={(e, info) => handleDrag(info.point, item.id)}
      onDragEnd={() => setDraggingId(null)}
      whileHover={{ scale: isDragging ? 1 : 1.02, transition: { duration: 0.2 } }}
      whileTap={{ cursor: "grabbing", scale: 0.98 }}
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 30 },
      }}
      className={`
        relative rounded-2xl p-4 cursor-grab active:cursor-grabbing flex flex-col h-36 select-none
        shadow-sm border border-gray-100
        ${item.span === 2 ? "col-span-2" : "col-span-1"}
        ${isDragging ? "shadow-xl ring-2 ring-black/5" : ""}
      `}
    >
      {getCardContent()}
    </motion.div>
  )
}

// --- MAIN PAGE COMPONENT ---

export default function NewBentoWaitlist() {
  const [step, setStep] = useState<"tagname" | "email" | "success">("tagname")
  const [tagname, setTagname] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Parallax Logic
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const xSpring = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const ySpring = useSpring(mouseY, { stiffness: 100, damping: 30 })

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const x = (clientX / window.innerWidth - 0.5) * 15
    const y = (clientY / window.innerHeight - 0.5) * 15
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleTagnameSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: existing, error: checkError } = await supabase
        .from("waitlist")
        .select("tagname")
        .eq("tagname", tagname.toLowerCase())
        .maybeSingle()

      if (checkError) throw checkError

      if (existing) {
        setError("This username is already taken!")
        setIsLoading(false)
        return
      }

      setStep("email")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during verification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("waitlist").insert({
        tagname: tagname.toLowerCase(),
        email: email.toLowerCase(),
      })

      if (insertError) throw insertError

      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F7F7F5] text-[#111] overflow-x-hidden font-sans selection:bg-[#FFDE59] selection:text-black"
      onMouseMove={handleMouseMove}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7F5]/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-xl shadow-black/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h7v7H4V4zm0 9h7v7H4v-7zm9-9h7v7h-7V4zm0 9h7v7h-7v-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight">Avely</span>
          </motion.div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-7xl mx-auto px-6 pt-36 pb-20 lg:pt-48 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 relative z-10 min-h-[90vh] items-center">
        {/* Left: Copy & Form */}
        <div className="flex flex-col justify-center max-w-xl mx-auto lg:mx-0 text-center lg:text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 shadow-sm">
              Waitlist Open
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] mb-8 text-black">
              All your <span className="text-gray-300 line-through decoration-4 decoration-gray-200">links</span>{" "}
              content on one page.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Show your audience everything you are, create, and sell in one place. The new standard for your bio.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            {step === "tagname" && (
              <form onSubmit={handleTagnameSubmit} className="relative group">
                <input
                  type="text"
                  placeholder="bento.me/username"
                  className="w-full bg-white pl-6 pr-32 py-5 rounded-2xl border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-lg outline-none focus:border-black/5 focus:ring-4 focus:ring-black/5 transition-all placeholder:text-gray-300 font-medium"
                  value={tagname}
                  onChange={(e) => setTagname(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 bg-black text-white px-8 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-black/20 disabled:opacity-50"
                >
                  {isLoading ? "Checking..." : "Check"} <ArrowRight size={18} strokeWidth={3} />
                </button>
              </form>
            )}

            {step === "email" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bg-[#EFFDF5] text-[#15803d] px-6 py-4 rounded-2xl flex items-center gap-3 font-bold border border-[#BBF7D0] shadow-sm mb-4">
                  <Check size={20} strokeWidth={3} />@{tagname} is available!
                </div>
                <form onSubmit={handleEmailSubmit} className="relative group">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-white pl-6 pr-32 py-5 rounded-2xl border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-lg outline-none focus:border-black/5 focus:ring-4 focus:ring-black/5 transition-all placeholder:text-gray-300 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 bg-black text-white px-8 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-black/20 disabled:opacity-50"
                  >
                    {isLoading ? "Joining..." : "Join"} <ArrowRight size={18} strokeWidth={3} />
                  </button>
                </form>
                <button
                  onClick={() => {
                    setStep("tagname")
                    setError(null)
                  }}
                  className="mt-3 text-sm text-gray-500 hover:text-black transition-colors font-semibold"
                >
                  ← Change username
                </button>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#EFFDF5] text-[#15803d] px-6 py-5 rounded-2xl border border-[#BBF7D0] shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#22c55e] text-white p-1.5 rounded-full">
                    <Check size={18} strokeWidth={4} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">You're on the list!</p>
                    <p className="text-sm opacity-80">@{tagname} is yours</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep("tagname")
                    setTagname("")
                    setEmail("")
                    setError(null)
                  }}
                  className="text-sm font-semibold hover:underline"
                >
                  Register another user →
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-200"
              >
                {error}
              </motion.div>
            )}

            <p className="mt-5 text-sm text-gray-400 font-semibold tracking-wide pl-2">
              Reserve your unique username before it's gone.
            </p>
          </motion.div>
        </div>

        {/* Right: The "Bento Pile" */}
        <div className="relative h-[500px] md:h-[700px] w-full hidden md:block perspective-1000 order-1 lg:order-2">
          <motion.div style={{ x: xSpring, y: ySpring }} className="relative w-full h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[720px] bg-white rounded-[60px] border-[12px] border-[#111] shadow-[0_60px_120px_-25px_rgba(0,0,0,0.3)] z-20 overflow-hidden flex flex-col"
            >
              <div className="h-full w-full bg-[#FAFAFA] p-6 flex flex-col gap-4 overflow-hidden">
                <div className="w-full aspect-[4/3.5] rounded-[32px] bg-[#ffde59] overflow-hidden relative shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=388&auto=format&fit=crop"
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    alt="Profile"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111] text-white p-6 rounded-[32px] flex flex-col items-center justify-center aspect-square shadow-lg hover:scale-95 transition-transform duration-300">
                    <Github size={40} />
                    <span className="text-xs mt-3 font-bold opacity-80">Code</span>
                  </div>
                  <div className="bg-[#1DA1F2] text-white p-6 rounded-[32px] flex flex-col items-center justify-center aspect-square shadow-lg hover:scale-95 transition-transform duration-300">
                    <Twitter size={40} />
                    <span className="text-xs mt-3 font-bold opacity-80">Tweets</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                  <div className="bg-red-500 p-3 rounded-full text-white shadow-md shadow-red-500/30">
                    <Youtube size={24} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                    <div className="h-3 w-28 bg-gray-200 rounded-full"></div>
                    <div className="h-2.5 w-16 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Widgets */}
            <WidgetCard
              className="top-[12%] left-[2%] w-48 h-48 bg-[#1DB954] text-white p-6 flex flex-col justify-between z-10"
              rotate={-12}
              delay={0.3}
            >
              <Music size={40} />
              <div>
                <p className="font-bold text-2xl">Spotify</p>
                <p className="text-sm opacity-80 font-medium mt-1">Latest Mix</p>
              </div>
            </WidgetCard>

            <WidgetCard className="top-[8%] right-[8%] w-56 h-64 bg-white p-3 z-10" rotate={15} delay={0.4}>
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop"
                className="w-full h-full object-cover rounded-[24px]"
                alt="Abstract"
              />
            </WidgetCard>

            <WidgetCard className="top-[48%] left-[-5%] w-52 h-52 bg-white p-2 z-30" rotate={8} delay={0.5}>
              <div className="w-full h-full bg-blue-50 rounded-[28px] relative overflow-hidden flex items-center justify-center">
                <div className="bg-blue-600 text-white p-5 rounded-full shadow-xl shadow-blue-500/30 relative z-10">
                  <MapPin size={32} fill="currentColor" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-blue-400/30"></div>
              </div>
            </WidgetCard>

            <WidgetCard
              className="bottom-[8%] right-[-2%] w-44 h-44 bg-gradient-to-br from-pink-400 to-rose-500 text-white p-6 flex flex-col justify-between z-10"
              rotate={-8}
              delay={0.6}
            >
              <Instagram size={36} />
              <div>
                <p className="font-bold text-xl">Photos</p>
                <p className="text-xs opacity-90 font-medium mt-1">215 posts</p>
              </div>
            </WidgetCard>
          </motion.div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 shadow-sm">
              Features
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-balance">
              Everything you need, in one place
            </h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto text-pretty">
              Design, customize, and share your content with the most powerful bio link platform.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard
            icon={LayoutGrid}
            title="Bento Layout"
            description="Create beautiful, customizable grid layouts that showcase all your content in an organized, visual way."
            delay={0}
          />
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Optimized for speed and performance. Your page loads instantly, keeping your audience engaged."
            delay={0.1}
          />
          <FeatureCard
            icon={Github}
            title="Easy Integration"
            description="Connect all your social platforms, portfolios, and shops in seconds. Everything synced automatically."
            delay={0.2}
          />
        </div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Try it yourself</h3>
            <p className="text-lg text-gray-500 font-medium">Drag and reorder. See how easy it is.</p>
          </div>
          <ProfileBentoDemo />
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h7v7H4V4zm0 9h7v7H4v-7zm9-9h7v7h-7V4zm0 9h7v7h-7v-7z" />
                </svg>
              </div>
              <span className="font-bold text-lg">Avely</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">© 2025 Avely. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-semibold text-gray-600">
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
