// utils/sound.js - FIXED VERSION

let audio = null
let isReady = false

export const initSound = () => {
  if (isReady) {
    console.log('✅ Sound already ready')
    return
  }
  try {
    audio = new Audio('/sound/notification.mp3')
    audio.load()
    audio.volume = 1.0
    audio.addEventListener('canplaythrough', () => {
      isReady = true
      console.log('✅ Sound ready')
    })
    audio.addEventListener('error', (e) => {
      console.error('❌ Sound error:', e)
    })
  } catch (err) {
    console.error('Sound init error:', err)
  }
}

export const playSound = () => {
  console.log('🔔 playSound called')
  if (!audio) {
    console.log('⚠️ No audio, initializing...')
    initSound()
    setTimeout(() => {
      if (audio) {
        playSound()
      }
    }, 300)
    return
  }
  try {
    audio.currentTime = 0
    const promise = audio.play()
    if (promise !== undefined) {
      promise
        .then(() => console.log('✅ Sound played!'))
        .catch((err) => {
          console.error('❌ Play failed:', err)
          if (err.name === 'NotAllowedError') {
            const retry = () => {
              if (audio) {
                audio.play().catch(() => {})
              }
              document.removeEventListener('click', retry)
              document.removeEventListener('touchstart', retry)
            }
            document.addEventListener('click', retry)
            document.addEventListener('touchstart', retry)
          }
        })
    }
  } catch (err) {
    console.error('Play error:', err)
  }
}

export const unlockAudio = () => {
  console.log('🔓 unlockAudio called')
  if (!audio) {
    initSound()
    return
  }
  try {
    const promise = audio.play()
    if (promise !== undefined) {
      promise
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          console.log('✅ Audio unlocked!')
        })
        .catch(() => {
          console.log('⚠️ Audio unlock failed, will retry on play')
        })
    }
  } catch (err) {}
}