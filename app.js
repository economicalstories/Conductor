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
    },
    pieces: []
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
const tempoMarking = document.getElementById('tempo-marking');
const metronomeToggle = document.getElementById('metronome-toggle');
const presetButtons = document.querySelectorAll('.preset-btn');
const signatureButtons = document.querySelectorAll('.sig-btn');
const beatDots = document.querySelectorAll('.dot');

// Tempo markings
function getTempoMarking(bpm) {
    if (bpm <= 45) return 'Grave';
    if (bpm <= 66) return 'Largo';
    if (bpm <= 80) return 'Adagio';
    if (bpm <= 100) return 'Andante';
    if (bpm <= 132) return 'Moderato';
    if (bpm <= 156) return 'Allegro';
    if (bpm <= 176) return 'Vivace';
    if (bpm <= 192) return 'Presto';
    return 'Prestissimo';
}

// Update BPM display
function updateBPM(bpm) {
    state.metronome.bpm = bpm;
    bpmDisplay.textContent = bpm;
    tempoMarking.textContent = getTempoMarking(bpm);
    tempoSlider.value = bpm;

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

// Preset buttons
presetButtons.forEach(button => {
    button.addEventListener('click', () => {
        updateBPM(parseInt(button.dataset.bpm));
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

// ============ PIECES / NOTES ============
const addPieceBtn = document.getElementById('add-piece-btn');
const pieceModal = document.getElementById('piece-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelModalBtn = document.getElementById('cancel-modal');
const savePieceBtn = document.getElementById('save-piece');
const piecesList = document.getElementById('pieces-list');
const emptyState = document.getElementById('empty-state');

let editingPieceId = null;

// Load pieces from localStorage
function loadPieces() {
    const saved = localStorage.getItem('conductorPieces');
    if (saved) {
        state.pieces = JSON.parse(saved);
    }
    renderPieces();
}

// Save pieces to localStorage
function savePieces() {
    localStorage.setItem('conductorPieces', JSON.stringify(state.pieces));
}

// Render pieces list
function renderPieces() {
    piecesList.innerHTML = '';

    if (state.pieces.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    state.pieces.forEach(piece => {
        const card = document.createElement('div');
        card.className = 'piece-card';
        card.innerHTML = `
            <div class="piece-header">
                <div class="piece-title-section">
                    <h3>${escapeHtml(piece.title)}</h3>
                    <div class="piece-composer">${escapeHtml(piece.composer)}</div>
                </div>
                <div class="piece-actions">
                    <button class="icon-btn edit-piece" data-id="${piece.id}">✏️</button>
                    <button class="icon-btn delete-piece" data-id="${piece.id}">🗑️</button>
                </div>
            </div>
            <div class="piece-notes">${escapeHtml(piece.notes)}</div>
        `;

        piecesList.appendChild(card);
    });

    // Attach event listeners
    document.querySelectorAll('.edit-piece').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editPiece(btn.dataset.id);
        });
    });

    document.querySelectorAll('.delete-piece').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePiece(btn.dataset.id);
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open modal for new piece
addPieceBtn.addEventListener('click', () => {
    editingPieceId = null;
    document.getElementById('modal-title').textContent = 'Add New Piece';
    document.getElementById('piece-title').value = '';
    document.getElementById('piece-composer').value = '';
    document.getElementById('piece-notes').value = '';
    pieceModal.classList.add('active');
});

// Close modal
function closeModal() {
    pieceModal.classList.remove('active');
    editingPieceId = null;
}

closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

pieceModal.addEventListener('click', (e) => {
    if (e.target === pieceModal) {
        closeModal();
    }
});

// Save piece
savePieceBtn.addEventListener('click', () => {
    const title = document.getElementById('piece-title').value.trim();
    const composer = document.getElementById('piece-composer').value.trim();
    const notes = document.getElementById('piece-notes').value.trim();

    if (!title) {
        alert('Please enter a title');
        return;
    }

    if (editingPieceId) {
        // Edit existing piece
        const piece = state.pieces.find(p => p.id === editingPieceId);
        if (piece) {
            piece.title = title;
            piece.composer = composer;
            piece.notes = notes;
        }
    } else {
        // Add new piece
        const newPiece = {
            id: Date.now().toString(),
            title,
            composer,
            notes
        };
        state.pieces.unshift(newPiece);
    }

    savePieces();
    renderPieces();
    closeModal();
});

// Edit piece
function editPiece(id) {
    const piece = state.pieces.find(p => p.id === id);
    if (!piece) return;

    editingPieceId = id;
    document.getElementById('modal-title').textContent = 'Edit Piece';
    document.getElementById('piece-title').value = piece.title;
    document.getElementById('piece-composer').value = piece.composer;
    document.getElementById('piece-notes').value = piece.notes;
    pieceModal.classList.add('active');
}

// Delete piece
function deletePiece(id) {
    if (confirm('Are you sure you want to delete this piece?')) {
        state.pieces = state.pieces.filter(p => p.id !== id);
        savePieces();
        renderPieces();
    }
}

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

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialize beat dots
    updateBeatDots();

    // Load saved pieces
    loadPieces();

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
