// Create a custom sound using your audio file
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let audioBuffer = null;
let isAudioLoaded = false;

// Load the audio file
const loadAudio = async () => {
  try {
    if (isAudioLoaded) return;
    
    const response = await fetch('/sounds/notification.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    isAudioLoaded = true;
    console.log('✅ Notification sound loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load notification sound:', error);
    // Fallback to beep sound if custom sound fails
    console.log('🔊 Using fallback beep sound');
  }
};

// Preload the audio when the app starts
loadAudio();

// Play notification sound
export const playNotificationSound = async () => {
  try {
    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // If custom audio is loaded, play it
    if (isAudioLoaded && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Play the sound
      source.start(0);
      
      console.log('🔊 Playing custom notification sound');
      
      // For urgent requests, play multiple times
      return source;
    } else {
      // Fallback to beep sound
      playFallbackBeep();
    }
  } catch (error) {
    console.error('❌ Error playing sound:', error);
    playFallbackBeep();
  }
};

// Fallback beep sound if custom audio fails
const playFallbackBeep = () => {
  try {
    const fallbackContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = fallbackContext.createOscillator();
    const gainNode = fallbackContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(fallbackContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      fallbackContext.close();
    }, 300);
  } catch (error) {
    console.log('Audio not supported:', error);
  }
};

// Urgent notification (multiple sounds)
export const playUrgentSound = async () => {
  // Play first sound
  await playNotificationSound();
  
  // Play second sound after delay
  setTimeout(async () => {
    await playNotificationSound();
  }, 500);
  
  // Play third sound after delay
  setTimeout(async () => {
    await playNotificationSound();
  }, 1000);
};

// Speak the notification
export const speakNotification = (message) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Google UK English Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Google') ||
        voice.name.includes('Female')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.log('Speech not supported:', error);
  }
};

// Combined notification with custom sound + speech
export const notifyNewRequest = async (request) => {
  const message = `New ${request.request_type} request from Room ${request.room_number}`;
  
  // Play custom sound
  await playNotificationSound();
  
  // Speak after a short delay
  setTimeout(() => {
    speakNotification(message);
  }, 500);
};

// Urgent notification (for urgent priority requests)
export const notifyUrgentRequest = async (request) => {
  const message = `URGENT! ${request.request_type} request from Room ${request.room_number}`;
  
  // Play multiple sounds for urgency
  await playUrgentSound();
  
  // Speak urgent message
  setTimeout(() => {
    speakNotification(message);
  }, 800);
};

// Test the sound (for debugging)
export const testSound = async () => {
  console.log('🔊 Testing notification sound...');
  await playNotificationSound();
};
