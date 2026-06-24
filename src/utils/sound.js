// utils/sound.js
// Sound notification - Optimized for mobile/APK

let audioContext = null
let audioBuffer = null
let isReady = false
let isPlaying = false
let html5Audio = null

/**
 * Initialize sound system
 * Call this on user interaction (click/touch)
 */
export const initSound = () => {
  if (isReady) {
    console.log('✅ Sound already ready')
    return
  }

  console.log('🔊 Initializing sound...')

  try {
    // Try Web Audio API first (more reliable for mobile)
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
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
          })
          .catch(err => {
            console.warn('⚠️ Web Audio load failed, using HTML5 fallback:', err)
            initHTML5Audio()
          })
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume()
        }
        
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

/**
 * Initialize HTML5 Audio fallback
 */
function initHTML5Audio() {
  try {
    if (!html5Audio) {
      html5Audio = new Audio('/sound/notification.mp3')
      html5Audio.load()
      html5Audio.volume = 0.8
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

/**
 * Play notification sound
 * @param {boolean} force - Force play even if not ready
 * @returns {Promise<boolean>}
 */
export const playSound = (force = false) => {
  console.log('🔔 playSound called, isReady:', isReady)
  
  return new Promise((resolve) => {
    try {
      // If not ready, try to init
      if (!isReady) {
        initSound()
        if (!force) {
          console.log('⏳ Sound not ready, will try later')
          // Try again after 500ms
          setTimeout(() => {
            if (isReady) {
              playSound(true).then(resolve)
            } else {
              resolve(false)
            }
          }, 500)
          return
        }
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
      
      // Emergency fallback - create new audio
      playEmergencySound().then(resolve)
      
    } catch (err) {
      console.error('❌ Sound error:', err)
      resolve(false)
    }
  })
}

/**
 * Play sound using Web Audio API
 */
function playWebAudio() {
  return new Promise((resolve) => {
    try {
      if (!audioContext || !audioBuffer) {
        resolve(false)
        return
      }
      
      // Resume if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      if (isPlaying) {
        console.log('⏳ Sound already playing')
        resolve(true)
        return
      }
      
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0.8
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      isPlaying = true
      
      source.onended = () => {
        isPlaying = false
        resolve(true)
      }
      
      source.start(0)
      console.log('✅ Sound played via Web Audio API!')
      
    } catch (err) {
      console.error('❌ Web Audio play error:', err)
      isPlaying = false
      resolve(false)
    }
  })
}

/**
 * Play sound using HTML5 Audio
 */
function playHTML5Audio() {
  return new Promise((resolve) => {
    try {
      if (!html5Audio) {
        resolve(false)
        return
      }
      
      html5Audio.currentTime = 0
      
      const promise = html5Audio.play()
      
      if (promise !== undefined) {
        promise
          .then(() => {
            console.log('✅ Sound played via HTML5 Audio!')
            resolve(true)
          })
          .catch((err) => {
            console.log('❌ HTML5 play failed:', err)
            // Try emergency
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

/**
 * Emergency fallback - create new audio element
 */
function playEmergencySound() {
  return new Promise((resolve) => {
    try {
      const audio = new Audio('/sound/notification.mp3')
      audio.currentTime = 0
      audio.volume = 0.8
      
      const promise = audio.play()
      
      if (promise !== undefined) {
        promise
          .then(() => {
            console.log('✅ Sound played via emergency fallback!')
            resolve(true)
          })
          .catch(() => {
            console.log('❌ Emergency fallback failed')
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

/**
 * Test sound - for debugging
 */
export const testSound = () => {
  console.log('🧪 Testing sound...')
  initSound()
  return playSound(true)
}

/**
 * Get sound status - for debugging
 */
export const getSoundStatus = () => ({
  isReady,
  isPlaying,
  hasWebAudio: !!audioContext && !!audioBuffer,
  hasHTML5Audio: !!html5Audio,
  audioContextState: audioContext?.state || 'none'
})