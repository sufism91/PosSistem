// utils/sound.js - FULL FINAL VERSION

let audioContext = null
let audioBuffer = null
let isReady = false
let isPlaying = false
let html5Audio = null
let audioUnlocked = false

// ============================================================
// UNLOCK AUDIO - Call this on user interaction
// ============================================================
export const unlockAudio = () => {
  if (audioUnlocked) {
    console.log('🔓 Audio already unlocked')
    return
  }
  
  console.log('🔓 Unlocking audio...')
  
  try {
    // Try Web Audio - FORCE RESUME
    if (audioContext) {
      console.log('🎵 AudioContext state:', audioContext.state)
      
      if (audioContext.state === 'suspended') {
        audioContext.resume()
          .then(() => {
            audioUnlocked = true
            console.log('✅ Web Audio resumed! State:', audioContext.state)
          })
          .catch(err => {
            console.error('❌ Resume failed:', err)
          })
      } else if (audioContext.state === 'running') {
        audioUnlocked = true
        console.log('✅ Web Audio already running!')
      }
    }
    
    // Try HTML5 Audio as backup
    if (html5Audio) {
      html5Audio.play()
        .then(() => {
          html5Audio.pause()
          html5Audio.currentTime = 0
          audioUnlocked = true
          console.log('✅ HTML5 Audio unlocked!')
        })
        .catch(() => {})
    }
    
    // Create dummy audio to unlock
    const dummy = new Audio('/sound/notification.mp3')
    dummy.play()
      .then(() => {
        dummy.pause()
        dummy.currentTime = 0
        audioUnlocked = true
        console.log('✅ Dummy audio unlocked!')
      })
      .catch((err) => {
        console.log('⚠️ Dummy audio failed:', err.message)
      })
      
  } catch (err) {
    console.error('❌ Unlock error:', err)
  }
}

// ============================================================
// INITIALIZE SOUND SYSTEM
// ============================================================
export const initSound = () => {
  if (isReady) {
    console.log('✅ Sound already ready')
    return
  }

  console.log('🔊 Initializing sound...')

  try {
    // Try Web Audio API first
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        console.log('🎵 AudioContext created, state:', audioContext.state)
        
        // Load audio file
        fetch('/sound/notification.mp3')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.arrayBuffer()
          })
          .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
          .then(buffer => {
            audioBuffer = buffer
            isReady = true
            console.log('✅ Sound loaded via Web Audio API')
            
            // Auto-resume if suspended
            if (audioContext.state === 'suspended') {
              audioContext.resume()
                .then(() => {
                  audioUnlocked = true
                  console.log('✅ Auto-resumed! State:', audioContext.state)
                })
                .catch(err => console.error('❌ Auto-resume failed:', err))
            }
          })
          .catch(err => {
            console.warn('⚠️ Web Audio load failed:', err)
            initHTML5Audio()
          })
        
        return
      } catch (err) {
        console.warn('⚠️ Web Audio init failed:', err)
      }
    }
    
    // Fallback: HTML5 Audio
    initHTML5Audio()
    
  } catch (err) {
    console.error('❌ Sound init error:', err)
    initHTML5Audio()
  }
}

// ============================================================
// INITIALIZE HTML5 AUDIO FALLBACK
// ============================================================
function initHTML5Audio() {
  try {
    if (!html5Audio) {
      html5Audio = new Audio('/sound/notification.mp3')
      html5Audio.load()
      html5Audio.volume = 1.0
      html5Audio.loop = false
    }
    
    html5Audio.addEventListener('canplaythrough', () => {
      isReady = true
      console.log('✅ HTML5 Audio ready')
    }, { once: true })
    
    html5Audio.addEventListener('error', (e) => {
      console.error('❌ HTML5 Audio error:', e)
    })
    
    console.log('🔊 HTML5 Audio initialized')
  } catch (err) {
    console.error('❌ HTML5 Audio init error:', err)
  }
}

// ============================================================
// PLAY SOUND USING WEB AUDIO API
// ============================================================
function playWebAudio() {
  return new Promise((resolve) => {
    try {
      if (!audioContext || !audioBuffer) {
        resolve(false)
        return
      }
      
      // CRITICAL: Resume if suspended
      if (audioContext.state === 'suspended') {
        console.log('🎵 Resuming suspended context...')
        audioContext.resume()
          .then(() => {
            console.log('✅ Context resumed! Playing now...')
            doPlayWebAudio().then(resolve)
          })
          .catch(err => {
            console.error('❌ Resume failed:', err)
            // Try HTML5 fallback
            playHTML5Audio().then(resolve)
          })
        return
      }
      
      if (audioContext.state === 'closed') {
        console.log('❌ Context closed, reinitializing...')
        initSound()
        setTimeout(() => {
          playSound(true).then(resolve)
        }, 500)
        return
      }
      
      // Play directly if running
      doPlayWebAudio().then(resolve)
      
    } catch (err) {
      console.error('❌ Web Audio play error:', err)
      resolve(false)
    }
  })
}

// ============================================================
// ACTUALLY PLAY THE SOUND
// ============================================================
function doPlayWebAudio() {
  return new Promise((resolve) => {
    try {
      if (!audioContext || !audioBuffer) {
        resolve(false)
        return
      }
      
      if (isPlaying) {
        console.log('⏳ Sound already playing')
        resolve(true)
        return
      }
      
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 1.0
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      isPlaying = true
      
      source.onended = () => {
        isPlaying = false
        resolve(true)
      }
      
      source.start(0)
      console.log('✅ Sound played via Web Audio API! State:', audioContext.state)
      
      // Force unlock
      audioUnlocked = true
      
    } catch (err) {
      console.error('❌ Web Audio play error:', err)
      isPlaying = false
      resolve(false)
    }
  })
}

// ============================================================
// PLAY SOUND - MAIN ENTRY
// ============================================================
export const playSound = (force = false) => {
  console.log('🔔 playSound called, isReady:', isReady, 'audioUnlocked:', audioUnlocked)
  
  return new Promise((resolve) => {
    try {
      // Force unlock on every play
      unlockAudio()
      
      // If not ready, try to init
      if (!isReady) {
        initSound()
        setTimeout(() => {
          if (isReady) {
            playSound(true).then(resolve)
          } else {
            resolve(false)
          }
        }, 500)
        return
      }
      
      // Try Web Audio first
      if (audioContext && audioBuffer) {
        playWebAudio().then(resolve)
        return
      }
      
      // Fallback to HTML5
      if (html5Audio) {
        playHTML5Audio().then(resolve)
        return
      }
      
      // Emergency fallback
      playEmergencySound().then(resolve)
      
    } catch (err) {
      console.error('❌ Sound error:', err)
      resolve(false)
    }
  })
}

// ============================================================
// PLAY SOUND USING HTML5 AUDIO
// ============================================================
function playHTML5Audio() {
  return new Promise((resolve) => {
    try {
      if (!html5Audio) {
        resolve(false)
        return
      }
      
      html5Audio.currentTime = 0
      html5Audio.volume = 1.0
      
      const promise = html5Audio.play()
      
      if (promise !== undefined) {
        promise
          .then(() => {
            console.log('✅ Sound played via HTML5 Audio!')
            resolve(true)
          })
          .catch((err) => {
            console.log('❌ HTML5 play failed:', err)
            playEmergencySound().then(resolve)
          })
      } else {
        resolve(false)
      }
    } catch (err) {
      console.error('❌ HTML5 play error:', err)
      resolve(false)
    }
  })
}

// ============================================================
// EMERGENCY FALLBACK
// ============================================================
function playEmergencySound() {
  return new Promise((resolve) => {
    try {
      const audio = new Audio('/sound/notification.mp3')
      audio.currentTime = 0
      audio.volume = 1.0
      
      const promise = audio.play()
      
      if (promise !== undefined) {
        promise
          .then(() => {
            console.log('✅ Sound played via emergency fallback!')
            resolve(true)
          })
          .catch((err) => {
            console.log('❌ Emergency fallback failed:', err)
            resolve(false)
          })
      } else {
        resolve(false)
      }
    } catch (err) {
      console.error('❌ Emergency fallback error:', err)
      resolve(false)
    }
  })
}

// ============================================================
// TEST SOUND
// ============================================================
export const testSound = () => {
  console.log('🧪 Testing sound...')
  initSound()
  unlockAudio()
  return playSound(true)
}

// ============================================================
// GET SOUND STATUS
// ============================================================
export const getSoundStatus = () => ({
  isReady,
  isPlaying,
  audioUnlocked,
  hasWebAudio: !!audioContext && !!audioBuffer,
  hasHTML5Audio: !!html5Audio,
  audioContextState: audioContext?.state || 'none'
})