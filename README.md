# 🎼 Conductor's Companion

Your essential Progressive Web App for conducting orchestras and ensembles.

## Features

### 🎵 Metronome
- **Orchestral tempo markings**: From Grave to Prestissimo
- **BPM range**: 40-208 with precise control
- **Time signatures**: 2/4, 3/4, 4/4, 5/4, 6/8, 7/8
- **Visual beat indicators**: See and hear each beat
- **Quick presets**: Instant access to common tempos

### 🎺 Tuner
- **Concert A**: Authentic oboe timbre using additive synthesis
- **Adjustable frequency**: 415-466 Hz
- **Presets**: A440 (Modern), A442 (European), A415 (Baroque)
- **Rich harmonics**: Realistic oboe sound with subtle vibrato

### 📝 Piece Notes
- **Repertoire management**: Keep track of your pieces
- **Composer information**: Organize by composer
- **Rehearsal notes**: Document tempos, dynamics, and sections to work on
- **Persistent storage**: Your notes are saved locally

### ⏱️ Rehearsal Timer
- **Stopwatch**: Track rehearsal sections
- **Quick timers**: 5, 10, 15, and 30-minute presets
- **Audio notification**: Gentle chime when timer completes

### ✋ Beat Patterns
- **Visual reference**: Conducting patterns for different time signatures
- **Quick guide**: 2/4, 3/4, 4/4, and 6/8 patterns
- **Always accessible**: Perfect for teaching or review

## Installation

### As a Progressive Web App

1. **Open in a browser**: Navigate to the app URL
2. **Install prompt**: Look for "Install" or "Add to Home Screen"
3. **Or manually**:
   - **Chrome/Edge**: Menu → Install app
   - **Safari (iOS)**: Share → Add to Home Screen
   - **Firefox**: Menu → Install

### Local Development

Simply open `index.html` in a modern web browser:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Or any other local server
```

Then visit `http://localhost:8000`

## Usage Tips

- **Switch tabs** to access different tools quickly
- **Metronome**: Adjust BPM with the slider or use preset tempo markings
- **Tuner**: Fine-tune frequency with +/- buttons or slider
- **Pieces**: Add notes about specific rehearsal challenges or interpretative choices
- **Works offline**: Once installed, works without internet connection

## Technical Details

- **Built with**: Vanilla JavaScript, Web Audio API, Local Storage
- **No dependencies**: Pure HTML/CSS/JS
- **Offline-first**: Service Worker for offline functionality
- **Responsive**: Works on mobile, tablet, and desktop
- **Browser support**: Modern browsers with Web Audio API support

## Design Philosophy

Simple, elegant, and focused on the conductor's needs. The interface uses a sophisticated concert hall color palette (deep blues and golds) for a premium feel while maintaining excellent readability.

## License

MIT License - Feel free to use and modify for your conducting needs!

---

*Made with ♪ for conductors everywhere*