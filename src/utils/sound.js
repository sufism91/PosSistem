// ===== FILE: src/utils/sound.js (FIXED - Tiada Error) =====

let audioContext = null
let isAudioUnlocked = false
let audioBuffer = null
let soundEnabled = true
let isPlaying = false  // 👈 TRACK status

// ===== INIT =====
export function initSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('🔊 AudioContext created')
    }
    loadSoundEffect()
    return audioContext
  } catch (err) {
    console.error('🔊 AudioContext init error:', err)
    return null
  }
}

// ===== LOAD SOUND =====
async function loadSoundEffect() {
  try {
    const response = await fetch('/sounds/notification.mp3')
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer()
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      console.log('🔊 Sound effect loaded!')
    } else {
      audioBuffer = generateBeep()
      console.log('🔊 Using generated beep sound')
    }
  } catch (err) {
    console.warn('🔊 Could not load sound, using generated beep:', err)
    audioBuffer = generateBeep()
  }
}

// ===== GENERATE BEEP =====
function generateBeep() {
  const duration = 0.15
  const sampleRate = audioContext.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = audioContext.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    data[i] = Math.sin(2 * Math.PI * 880 * t) * 0.3
    if (i > length * 0.7) {
      data[i] *= (1 - (i - length * 0.7) / (length * 0.3))
    }
  }
  return buffer
}

// ===== UNLOCK AUDIO =====
export function unlockAudio() {
  if (isAudioUnlocked) return
  try {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
      isAudioUnlocked = true
      console.log('🔓 Audio unlocked!')
    }
  } catch (err) {
    console.warn('🔓 Audio unlock failed:', err)
  }
}

// ===== PLAY SOUND (FIXED) =====
export function playSound() {
  // Jika sound disabled, skip
  if (!soundEnabled) {
    console.log('🔇 Sound disabled')
    return
  }
  
  // 👇 PENTING: Jika masih playing, skip (JANGAN interrupt)
  if (isPlaying) {
    console.log('🔊 Sound already playing, skipping...')
    return
  }
  
  try {
    // Pastikan audio context wujud
    if (!audioContext) {
      initSound()
    }
    
    // Resume context jika suspended
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    // Gunakan buffer
    if (audioBuffer && audioContext) {
      isPlaying = true
      
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0.5
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // 👇 FIX: Gunakan onended, BUKAN setTimeout stop()
      source.onended = () => {
        isPlaying = false
        console.log('🔊 Sound finished')
      }
      
      source.start()
      console.log('🔊 Sound played!')
      
      // 👇 Safety timeout: jika onended tak trigger
      setTimeout(() => {
        if (isPlaying) {
          isPlaying = false
          console.log('🔊 Sound timeout reset')
        }
      }, 500)
      
    } else {
      console.warn('🔊 No audio buffer, using fallback')
      playFallbackSound()
    }
  } catch (err) {
    console.warn('🔊 Play sound error:', err)
    isPlaying = false
    playFallbackSound()
  }
}

// ===== FALLBACK SOUND =====
function playFallbackSound() {
  if (isPlaying) return
  
  try {
    if (!audioContext) {
      initSound()
    }
    
    if (audioContext) {
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      isPlaying = true
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      
      gainNode.gain.value = 0.3
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // 👇 FIX: onended untuk reset
      oscillator.onended = () => {
        isPlaying = false
      }
      
      oscillator.start()
      
      // Stop selepas 150ms
      setTimeout(() => {
        try {
          oscillator.stop()
        } catch (e) {
          // Ignore
        }
        setTimeout(() => {
          isPlaying = false
        }, 50)
      }, 150)
      
      console.log('🔊 Fallback sound played!')
    }
  } catch (err) {
    console.warn('🔊 Fallback sound failed:', err)
    isPlaying = false
  }
}

// ===== TOGGLE SOUND =====
export function toggleSound() {
  soundEnabled = !soundEnabled
  console.log(`🔊 Sound ${soundEnabled ? 'ON' : 'OFF'}`)
  return soundEnabled
}

export function isSoundEnabled() {
  return soundEnabled
}

export function resetSound() {
  isPlaying = false
  isAudioUnlocked = false
  if (audioContext) {
    try {
      audioContext.close()
    } catch (e) {}
    audioContext = null
  }
  console.log('🔊 Sound reset')
}