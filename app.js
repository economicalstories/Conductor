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

// ============ TRANSPOSE TOOL - Touch-First ============
const writtenStaff = document.getElementById('written-staff');
const writtenClefGroup = document.getElementById('written-clef');
const writtenNoteGroup = document.getElementById('written-note');
const writtenTouchArea = document.getElementById('written-touch-area');
const concertNoteGroup = document.getElementById('concert-note');
const instrumentLabel = document.getElementById('instrument-label');
const transposeResult = document.getElementById('transpose-result');

// Transpose state
const transposeState = {
    clefIndex: 0,
    writtenNote: null,
    writtenOctave: null
};

// Note positions for different clef types (staff lines at 40,60,80,100,120)
const trebleNotePositions = [
    { y: 140, note: 'C', octave: 4 }, // Below staff (middle C)
    { y: 130, note: 'D', octave: 4 },
    { y: 120, note: 'E', octave: 4 }, // Bottom line
    { y: 110, note: 'F', octave: 4 },
    { y: 100, note: 'G', octave: 4 }, // Line
    { y: 90, note: 'A', octave: 4 },
    { y: 80, note: 'B', octave: 4 },  // Middle line
    { y: 70, note: 'C', octave: 5 },
    { y: 60, note: 'D', octave: 5 },  // Line
    { y: 50, note: 'E', octave: 5 },
    { y: 40, note: 'F', octave: 5 },  // Top line
    { y: 30, note: 'G', octave: 5 },
    { y: 20, note: 'A', octave: 5 }
];

const bassNotePositions = [
    { y: 140, note: 'E', octave: 2 }, // Below staff
    { y: 130, note: 'F', octave: 2 },
    { y: 120, note: 'G', octave: 2 }, // Bottom line
    { y: 110, note: 'A', octave: 2 },
    { y: 100, note: 'B', octave: 2 }, // Line
    { y: 90, note: 'C', octave: 3 },
    { y: 80, note: 'D', octave: 3 },  // Middle line
    { y: 70, note: 'E', octave: 3 },
    { y: 60, note: 'F', octave: 3 },  // Line (F clef line)
    { y: 50, note: 'G', octave: 3 },
    { y: 40, note: 'A', octave: 3 },  // Top line
    { y: 30, note: 'B', octave: 3 },
    { y: 20, note: 'C', octave: 4 }
];

const altoNotePositions = [
    { y: 140, note: 'D', octave: 3 }, // Below staff
    { y: 130, note: 'E', octave: 3 },
    { y: 120, note: 'F', octave: 3 }, // Bottom line
    { y: 110, note: 'G', octave: 3 },
    { y: 100, note: 'A', octave: 3 }, // Line
    { y: 90, note: 'B', octave: 3 },
    { y: 80, note: 'C', octave: 4 },  // Middle line (middle C)
    { y: 70, note: 'D', octave: 4 },
    { y: 60, note: 'E', octave: 4 },  // Line
    { y: 50, note: 'F', octave: 4 },
    { y: 40, note: 'G', octave: 4 },  // Top line
    { y: 30, note: 'A', octave: 4 },
    { y: 20, note: 'B', octave: 4 }
];

// Clef configurations
const clefs = [
    { name: 'treble', symbol: '𝄞', label: 'Treble Clef', transpose: 0, instrumentLabel: 'Concert Pitch (C)', y: 80, fontSize: 100, clefType: 'treble', notePositions: trebleNotePositions },
    { name: 'Bb', symbol: '𝄞', label: 'B♭ Treble', transpose: -2, instrumentLabel: 'B♭ (Cl, Tpt, Ten Sax)', y: 80, fontSize: 100, clefType: 'treble', notePositions: trebleNotePositions },
    { name: 'Eb', symbol: '𝄞', label: 'E♭ Treble', transpose: -9, instrumentLabel: 'E♭ (Alto Sax)', y: 80, fontSize: 100, clefType: 'treble', notePositions: trebleNotePositions },
    { name: 'F', symbol: '𝄞', label: 'F Treble', transpose: -7, instrumentLabel: 'F (Horn)', y: 80, fontSize: 100, clefType: 'treble', notePositions: trebleNotePositions },
    { name: 'bass', symbol: '𝄢', label: 'Bass Clef', transpose: -12, instrumentLabel: 'Bass Clef', y: 60, fontSize: 85, clefType: 'bass', notePositions: bassNotePositions },
    { name: 'alto', symbol: '𝄡', label: 'Alto Clef', transpose: 0, instrumentLabel: 'Alto Clef', y: 80, fontSize: 100, clefType: 'alto', notePositions: altoNotePositions }
];

// Note names
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Cycle through clefs
function cycleClef() {
    transposeState.clefIndex = (transposeState.clefIndex + 1) % clefs.length;
    updateClef();

    // Clear notes when changing clef type
    transposeState.writtenNote = null;
    transposeState.writtenOctave = null;
    writtenNoteGroup.innerHTML = '';
    concertNoteGroup.innerHTML = '';
    if (transposeResult) {
        transposeResult.textContent = 'Tap staff above to begin';
    }
}

// Update clef display
function updateClef() {
    const clef = clefs[transposeState.clefIndex];
    const textElement = writtenClefGroup.querySelector('text');
    if (textElement) {
        textElement.textContent = clef.symbol;
        textElement.setAttribute('y', clef.y);
        textElement.setAttribute('font-size', clef.fontSize);
    }
    if (instrumentLabel) {
        instrumentLabel.textContent = clef.instrumentLabel;
    }
}

// Place note on staff based on touch/click position
function placeNote(event) {
    event.preventDefault();

    const svg = writtenStaff;
    const pt = svg.createSVGPoint();

    // Get touch/click position
    if (event.touches) {
        pt.x = event.touches[0].clientX;
        pt.y = event.touches[0].clientY;
    } else {
        pt.x = event.clientX;
        pt.y = event.clientY;
    }

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Get note positions for current clef
    const clef = clefs[transposeState.clefIndex];
    const notePositions = clef.notePositions;

    // Find closest note position
    let closest = notePositions[0];
    let minDist = Math.abs(svgP.y - closest.y);

    notePositions.forEach(pos => {
        const dist = Math.abs(svgP.y - pos.y);
        if (dist < minDist) {
            minDist = dist;
            closest = pos;
        }
    });

    transposeState.writtenNote = closest.note;
    transposeState.writtenOctave = closest.octave;

    drawWholeNote(writtenNoteGroup, closest.y, 200);
    updateTransposition();
}

// Draw whole note (semibreve)
function drawWholeNote(group, y, x) {
    let html = '';

    // Draw ledger lines if needed
    if (y > 120) {
        for (let ly = 130; ly <= y; ly += 10) {
            html += `<line x1="${x-20}" y1="${ly}" x2="${x+20}" y2="${ly}" stroke="#d4af37" stroke-width="2"/>`;
        }
    } else if (y < 40) {
        for (let ly = 30; ly >= y; ly -= 10) {
            html += `<line x1="${x-20}" y1="${ly}" x2="${x+20}" y2="${ly}" stroke="#d4af37" stroke-width="2"/>`;
        }
    }

    // Draw whole note (semibreve) - hollow ellipse
    html += `<ellipse cx="${x}" cy="${y}" rx="12" ry="9" fill="none" stroke="#d4af37" stroke-width="3"/>`;

    // Add note label
    html += `<text x="${x+25}" y="${y+5}" font-size="14" fill="#d4af37" font-weight="bold">${transposeState.writtenNote}${transposeState.writtenOctave}</text>`;

    group.innerHTML = html;
}

// Update transposition
function updateTransposition() {
    if (transposeState.writtenNote === null) return;

    const clef = clefs[transposeState.clefIndex];
    const noteIndex = noteNames.indexOf(transposeState.writtenNote);
    const writtenSemitones = (transposeState.writtenOctave * 12) + noteIndex;
    const concertSemitones = writtenSemitones + clef.transpose;
    const concertOctave = Math.floor(concertSemitones / 12);
    const concertNoteIndex = ((concertSemitones % 12) + 12) % 12;
    const concertNote = noteNames[concertNoteIndex];

    // Find Y position for concert note (always treble clef)
    const concertPos = trebleNotePositions.find(p => p.note === concertNote && p.octave === concertOctave);
    const concertY = concertPos ? concertPos.y : 80;

    drawWholeNote(concertNoteGroup, concertY, 200);

    if (transposeResult) {
        if (clef.transpose === 0) {
            transposeResult.textContent = `Same pitch: ${concertNote}${concertOctave}`;
        } else {
            transposeResult.textContent = `Sounds: ${concertNote}${concertOctave}`;
        }
    }
}

// Event listeners
if (writtenClefGroup) {
    writtenClefGroup.addEventListener('click', cycleClef);
    writtenClefGroup.addEventListener('touchstart', (e) => {
        e.preventDefault();
        cycleClef();
    });
}

if (writtenTouchArea) {
    writtenTouchArea.addEventListener('click', placeNote);
    writtenTouchArea.addEventListener('touchstart', placeNote);
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialize beat dots
    updateBeatDots();

    // Initialize timer display
    updateTimerDisplay();

    // Initialize transpose clef display
    updateClef();

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
