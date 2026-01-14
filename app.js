// Conductor's Companion - Main Application
// Audio Context (initialized on user interaction)
let audioContext = null;
let metronomeInterval = null;
let timerInterval = null;

// State
const state = {
    metronome: {
        bpm: 120,
        isPlaying: false,
        beats: 4,
        currentBeat: 0
    },
    tuner: {
        frequency: 440,
        isPlaying: false,
        oscillator: null,
        gainNode: null
    },
    timer: {
        seconds: 0,
        isRunning: false,
        targetSeconds: null
    }
};

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// ============ TAB NAVIGATION ============
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // Stop metronome and tuner when switching tabs
        if (tabName !== 'metronome' && state.metronome.isPlaying) {
            stopMetronome();
        }
        if (tabName !== 'tuner' && state.tuner.isPlaying) {
            stopTuner();
        }
    });
});

// ============ METRONOME ============
const tempoSlider = document.getElementById('tempo-slider');
const bpmDisplay = document.getElementById('bpm-display');
const metronomeToggle = document.getElementById('metronome-toggle');
const scaleMarks = document.querySelectorAll('.scale-mark');
const signatureButtons = document.querySelectorAll('.sig-btn');
const beatDots = document.querySelectorAll('.dot');

// Update BPM display and highlight scale marks
function updateBPM(bpm) {
    state.metronome.bpm = bpm;
    bpmDisplay.textContent = bpm;
    tempoSlider.value = bpm;

    // Highlight closest scale mark
    let closestMark = null;
    let closestDiff = Infinity;
    scaleMarks.forEach(mark => {
        const markBpm = parseInt(mark.dataset.bpm);
        const diff = Math.abs(markBpm - bpm);
        if (diff < closestDiff) {
            closestDiff = diff;
            closestMark = mark;
        }
    });

    scaleMarks.forEach(mark => mark.classList.remove('active'));
    if (closestMark && closestDiff < 20) {
        closestMark.classList.add('active');
    }

    // Restart metronome if playing
    if (state.metronome.isPlaying) {
        stopMetronome();
        startMetronome();
    }
}

// Tempo slider
tempoSlider.addEventListener('input', (e) => {
    updateBPM(parseInt(e.target.value));
});

// Scale mark buttons
scaleMarks.forEach(mark => {
    mark.addEventListener('click', () => {
        updateBPM(parseInt(mark.dataset.bpm));
    });
});

// Time signature buttons
signatureButtons.forEach(button => {
    button.addEventListener('click', () => {
        signatureButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        state.metronome.beats = parseInt(button.dataset.beats);
        updateBeatDots();
    });
});

// Update beat dots display
function updateBeatDots() {
    const dotsContainer = document.getElementById('beat-dots');
    dotsContainer.innerHTML = '';

    for (let i = 0; i < state.metronome.beats; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dotsContainer.appendChild(dot);
    }
}

// Play metronome click sound
function playClick(isStrong = false) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Strong beat (downbeat) vs weak beat
    oscillator.frequency.value = isStrong ? 1200 : 800;
    gainNode.gain.value = isStrong ? 0.3 : 0.15;

    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    oscillator.stop(ctx.currentTime + 0.05);
}

// Metronome tick
function metronomeTick() {
    const isStrong = state.metronome.currentBeat === 0;
    playClick(isStrong);

    // Update visual indicator
    const dots = document.querySelectorAll('#beat-dots .dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'strong');
        if (index === state.metronome.currentBeat) {
            dot.classList.add(isStrong ? 'strong' : 'active');
        }
    });

    state.metronome.currentBeat = (state.metronome.currentBeat + 1) % state.metronome.beats;
}

// Start metronome
function startMetronome() {
    initAudioContext();
    state.metronome.isPlaying = true;
    state.metronome.currentBeat = 0;

    const interval = (60 / state.metronome.bpm) * 1000;

    // Play first beat immediately
    metronomeTick();

    // Then continue with interval
    metronomeInterval = setInterval(metronomeTick, interval);

    metronomeToggle.classList.add('active');
    metronomeToggle.querySelector('.btn-text').textContent = 'Stop';
}

// Stop metronome
function stopMetronome() {
    state.metronome.isPlaying = false;
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
    }

    // Clear visual indicators
    const dots = document.querySelectorAll('#beat-dots .dot');
    dots.forEach(dot => dot.classList.remove('active', 'strong'));

    metronomeToggle.classList.remove('active');
    metronomeToggle.querySelector('.btn-text').textContent = 'Start';
}

// Metronome toggle
metronomeToggle.addEventListener('click', () => {
    if (state.metronome.isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});

// ============ TUNER (OBOE A) ============
const frequencySlider = document.getElementById('frequency-slider');
const frequencyDisplay = document.getElementById('frequency-display');
const tunerToggle = document.getElementById('tuner-toggle');
const freqUpBtn = document.getElementById('freq-up');
const freqDownBtn = document.getElementById('freq-down');
const tunerPresetButtons = document.querySelectorAll('.tuner-preset-btn');
const tuningForkSvg = document.querySelector('.tuning-fork');

// Update frequency display
function updateFrequency(freq) {
    state.tuner.frequency = freq;
    frequencyDisplay.textContent = freq;
    frequencySlider.value = freq;

    // Update playing frequency if already playing
    if (state.tuner.isPlaying && state.tuner.oscillator) {
        state.tuner.oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    }
}

// Frequency controls
frequencySlider.addEventListener('input', (e) => {
    updateFrequency(parseInt(e.target.value));
});

freqUpBtn.addEventListener('click', () => {
    updateFrequency(Math.min(466, state.tuner.frequency + 1));
});

freqDownBtn.addEventListener('click', () => {
    updateFrequency(Math.max(415, state.tuner.frequency - 1));
});

tunerPresetButtons.forEach(button => {
    button.addEventListener('click', () => {
        updateFrequency(parseInt(button.dataset.freq));
    });
});

// Create oboe-like timbre using additive synthesis
function createOboeSound(frequency) {
    const ctx = initAudioContext();

    // Main oscillator
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Create overtones for oboe-like timbre
    const overtones = [
        { harmonic: 1, gain: 1.0 },      // Fundamental
        { harmonic: 2, gain: 0.7 },      // Second harmonic (strong in oboe)
        { harmonic: 3, gain: 0.5 },      // Third harmonic
        { harmonic: 4, gain: 0.3 },      // Fourth harmonic
        { harmonic: 5, gain: 0.15 },     // Fifth harmonic
        { harmonic: 6, gain: 0.1 }       // Sixth harmonic
    ];

    // Create a gain node for overall volume
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;

    // Add subtle vibrato (characteristic of oboe)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 5; // 5 Hz vibrato
    vibratoGain.gain.value = 3; // Subtle vibrato depth
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // Create each harmonic
    overtones.forEach(({ harmonic, gain }) => {
        const partialOsc = ctx.createOscillator();
        const partialGain = ctx.createGain();

        partialOsc.frequency.value = frequency * harmonic;
        partialOsc.type = 'sine';
        partialGain.gain.value = gain / overtones.length;

        partialOsc.connect(partialGain);
        partialGain.connect(masterGain);

        partialOsc.start();

        // Store for cleanup
        if (!state.tuner.partials) state.tuner.partials = [];
        state.tuner.partials.push(partialOsc);
    });

    masterGain.connect(ctx.destination);

    vibrato.start();
    state.tuner.vibrato = vibrato;

    osc.frequency.value = frequency;
    osc.type = 'sine';
    osc.start();

    return { osc, gainNode: masterGain };
}

// Start tuner
function startTuner() {
    const { osc, gainNode } = createOboeSound(state.tuner.frequency);

    state.tuner.oscillator = osc;
    state.tuner.gainNode = gainNode;
    state.tuner.isPlaying = true;

    tunerToggle.classList.add('active');
    tunerToggle.querySelector('.btn-text').textContent = 'Stop';
    tuningForkSvg.classList.add('playing');
}

// Stop tuner
function stopTuner() {
    if (state.tuner.oscillator) {
        state.tuner.oscillator.stop();
        state.tuner.oscillator = null;
    }

    if (state.tuner.vibrato) {
        state.tuner.vibrato.stop();
        state.tuner.vibrato = null;
    }

    // Stop all partials
    if (state.tuner.partials) {
        state.tuner.partials.forEach(partial => partial.stop());
        state.tuner.partials = [];
    }

    state.tuner.gainNode = null;
    state.tuner.isPlaying = false;

    tunerToggle.classList.remove('active');
    tunerToggle.querySelector('.btn-text').textContent = 'Play A';
    tuningForkSvg.classList.remove('playing');
}

// Tuner toggle
tunerToggle.addEventListener('click', () => {
    if (state.tuner.isPlaying) {
        stopTuner();
    } else {
        startTuner();
    }
});

// ============ TIMER ============
const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');
const timerResetBtn = document.getElementById('timer-reset');
const timerPresetButtons = document.querySelectorAll('.timer-preset-btn');

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update timer display
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(state.timer.seconds);
}

// Start/pause timer
timerStartBtn.addEventListener('click', () => {
    if (state.timer.isRunning) {
        // Pause
        clearInterval(timerInterval);
        state.timer.isRunning = false;
        timerStartBtn.textContent = 'Resume';
    } else {
        // Start
        state.timer.isRunning = true;
        timerStartBtn.textContent = 'Pause';

        timerInterval = setInterval(() => {
            state.timer.seconds++;
            updateTimerDisplay();

            // Check if target reached
            if (state.timer.targetSeconds && state.timer.seconds >= state.timer.targetSeconds) {
                clearInterval(timerInterval);
                state.timer.isRunning = false;
                timerStartBtn.textContent = 'Start';

                // Play notification sound
                playClick(true);
                setTimeout(() => playClick(true), 200);
            }
        }, 1000);
    }
});

// Reset timer
timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    state.timer.seconds = 0;
    state.timer.isRunning = false;
    state.timer.targetSeconds = null;
    timerStartBtn.textContent = 'Start';
    updateTimerDisplay();
});

// Preset timers
timerPresetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const minutes = parseInt(button.dataset.minutes);
        state.timer.targetSeconds = minutes * 60;
        state.timer.seconds = 0;
        state.timer.isRunning = false;
        timerStartBtn.textContent = 'Start';
        updateTimerDisplay();

        // Auto-start if timer was already running
        timerStartBtn.click();
    });
});

// ============ TRANSPOSE TOOL with Staff Notation ============
const instrumentSelect = document.getElementById('instrument-select');
const noteInput = document.getElementById('note-input');
const octaveInput = document.getElementById('octave-input');
const transposeInfo = document.getElementById('transpose-info');

// Note to semitone mapping
const noteToSemitones = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11};
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Transpositions
const transpositions = {'C': 0, 'Bb': -2, 'Eb': -9, 'F': -7, 'A': -3, 'bass': -12, 'alto': 0};

// Draw clef on staff
function drawClef(clefGroup, clefType) {
    clefGroup.innerHTML = '';
    if (clefType === 'treble' || clefType === 'C' || clefType === 'Bb' || clefType === 'Eb' || clefType === 'F' || clefType === 'A') {
        clefGroup.innerHTML = '<text x="50" y="130" font-size="70" fill="#d4af37" font-family="serif">𝄞</text>';
    } else if (clefType === 'bass') {
        clefGroup.innerHTML = '<text x="50" y="110" font-size="70" fill="#d4af37" font-family="serif">𝄢</text>';
    } else if (clefType === 'alto') {
        clefGroup.innerHTML = '<text x="50" y="115" font-size="70" fill="#d4af37" font-family="serif">𝄡</text>';
    }
}

// Get Y position for note on treble staff
function getNoteY(note, octave) {
    const positions = {
        'C': {3: 190, 4: 140, 5: 90, 6: 40},
        'D': {3: 180, 4: 130, 5: 80, 6: 30},
        'E': {3: 170, 4: 120, 5: 70, 6: 20},
        'F': {3: 160, 4: 110, 5: 60, 6: 10},
        'G': {3: 150, 4: 100, 5: 50, 6: 0},
        'A': {3: 140, 4: 90, 5: 40, 6: -10},
        'B': {3: 130, 4: 80, 5: 30, 6: -20}
    };
    const baseNote = note.replace('#', '');
    return positions[baseNote]?.[octave] || 100;
}

// Draw note on staff
function drawNote(noteGroup, note, octave, x = 200) {
    noteGroup.innerHTML = '';
    const y = getNoteY(note, octave);

    // Draw ledger lines if needed
    if (y > 140) {
        for (let ly = 150; ly <= y; ly += 10) {
            if (ly > 140) noteGroup.innerHTML += `<line x1="${x-15}" y1="${ly}" x2="${x+15}" y2="${ly}" stroke="#d4af37" stroke-width="1.5"/>`;
        }
    } else if (y < 60) {
        for (let ly = 50; ly >= y; ly -= 10) {
            if (ly < 60) noteGroup.innerHTML += `<line x1="${x-15}" y1="${ly}" x2="${x+15}" y2="${ly}" stroke="#d4af37" stroke-width="1.5"/>`;
        }
    }

    // Draw note head
    noteGroup.innerHTML += `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="#d4af37" transform="rotate(-20 ${x} ${y})"/>`;

    // Draw accidental if sharp
    if (note.includes('#')) {
        noteGroup.innerHTML += `<text x="${x-20}" y="${y+5}" font-size="24" fill="#d4af37">#</text>`;
    }
}

// Calculate and render transposition
function calculateTranspose() {
    if (!instrumentSelect || !noteInput || !octaveInput) return;

    const instrument = instrumentSelect.value;
    const note = noteInput.value;
    const octave = parseInt(octaveInput.value);

    // Calculate concert pitch
    const interval = transpositions[instrument] || 0;
    const writtenSemitones = (octave * 12) + noteToSemitones[note];
    const concertSemitones = writtenSemitones + interval;
    const concertOctave = Math.floor(concertSemitones / 12);
    const concertNote = noteNames[(concertSemitones % 12 + 12) % 12];

    // Draw written pitch staff
    const writtenClef = document.getElementById('written-clef');
    const writtenNoteGroup = document.getElementById('written-note');
    drawClef(writtenClef, instrument);
    drawNote(writtenNoteGroup, note, octave);

    // Draw concert pitch staff (always treble)
    const concertClef = document.getElementById('concert-clef');
    const concertNoteGroup = document.getElementById('concert-note');
    drawClef(concertClef, 'treble');
    drawNote(concertNoteGroup, concertNote, concertOctave);

    // Update info text
    if (transposeInfo) {
        transposeInfo.textContent = instrument === 'C' ? 'Same pitch' : `Sounds: ${concertNote}${concertOctave}`;
    }
}

// Event listeners
if (instrumentSelect && noteInput && octaveInput) {
    instrumentSelect.addEventListener('change', calculateTranspose);
    noteInput.addEventListener('change', calculateTranspose);
    octaveInput.addEventListener('change', calculateTranspose);
    setTimeout(calculateTranspose, 100); // Initial render
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialize beat dots
    updateBeatDots();

    // Initialize timer display
    updateTimerDisplay();

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopMetronome();
    stopTuner();
});
