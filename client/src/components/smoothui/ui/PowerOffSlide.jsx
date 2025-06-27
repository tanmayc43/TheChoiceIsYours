import { useEffect, useRef, useState } from "react";
import { Power } from "lucide-react"
import {
  motion,
  useAnimation,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react"

export default function PowerOffSlide({
  onPowerOff,
  label = "Slide to power off",
  className = "",
  duration = 2000,
  disabled = false
}) {
  const [isPoweringOff, setIsPoweringOff] = useState(false)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const constraintsRef = useRef(null)
  const textRef = useRef(null)
  const isMounted = useRef(true);

  const xInput = [0, 164]
  const opacityOutput = [0, 1]
  const opacity = useTransform(x, xInput, opacityOutput)
  
  // Add rotation transform based on x position
  const rotation = useTransform(x, [0, 164], [0, 360])

  useAnimationFrame((t) => {
    const animDuration = duration
    const progress = (t % animDuration) / animDuration
    if (textRef.current) {
      textRef.current.style.setProperty("--x", `${(1 - progress) * 100}%`)
    }
  })

  // Ensure controls.start({ x: 0 }) is only called after mount
  useEffect(() => {
    controls.start({ x: 0 });
  }, [controls]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDragEnd = async () => {
    if (disabled) return
    const dragDistance = x.get()
    if (dragDistance > 160) {
      await controls.start({ x: 168 })
      setIsPoweringOff(true)
      if (onPowerOff) onPowerOff()
      setTimeout(() => {
        if (isMounted.current) {
          setIsPoweringOff(false)
          controls.start({ x: 0 })
          x.set(0)
        }
      }, 3000)
    } else {
      controls.start({ x: 0 })
    }
  }

  return (
    <div className={`flex h-auto items-center justify-center ${className}`}>
      <div className="w-56">
        <AnimatePresence mode="wait">
          {isPoweringOff ? (
            <motion.div 
              key="powering-off"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-foreground text-center w-full"
            >
              <p className="text-xl font-light whitespace-nowrap">
                Sequence initiated
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ...
                </motion.span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="slide-control"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div
                ref={constraintsRef}
                className="bg-secondary relative h-14 overflow-hidden rounded-full border">
                <div
                  className="absolute inset-0 left-8 z-0 flex items-center justify-center overflow-hidden">
                  <div
                    className="text-md loading-shimmer text-foreground relative w-full text-center font-normal select-none">
                    {label}
                  </div>
                </div>
                <motion.div
                  drag={disabled ? false : "x"}
                  dragConstraints={{ left: 0, right: 168 }}
                  dragElastic={0}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  animate={controls}
                  style={{ x, rotate: rotation }}
                  className={`bg-background absolute top-1 left-1 z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-md ${disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"}`}
                  tabIndex={disabled ? -1 : 0}
                  aria-disabled={disabled}>
                  <Power size={32} className="text-green-500" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
