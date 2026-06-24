// utils/sound.js

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
    return
  }
  try {
    audio.currentTime = 0
    const promise = audio.play()
    if (promise !== undefined) {
      promise
        .then(() => console.log('✅ Sound played!'))
        .catch((err) => console.error('❌ Play failed:', err))
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
    audio.play()
      .then(() => {
        audio.pause()
        audio.currentTime = 0
        console.log('✅ Audio unlocked!')
      })
      .catch(() => {})
  } catch (err) {}
}