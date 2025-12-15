const fs = require('fs');
const path = require('path');

// Ensure directory exists
const outputDir = path.resolve(__dirname, '../public/assets/sounds');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function createWavFile(filename, frequency, durationSec, type = 'sine') {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const numSamples = sampleRate * durationSec;
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const fileSize = 36 + dataSize; // 36 + data chunk size

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF Chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true); // File size - 8
    writeString(view, 8, 'WAVE');

    // fmt Chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Chunk size (16 for PCM)
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data Chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write samples
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let sample = 0;

        // Envelope (ADSR-ish)
        // Fast attack, exponential decay
        let envelope = 1;
        if (t < 0.005) {
            envelope = t / 0.005; // Attack
        } else {
            envelope = Math.exp(-(t - 0.005) * 15); // Decay
        }

        if (type === 'sine') {
            sample = Math.sin(2 * Math.PI * frequency * t);
        } else if (type === 'square') {
            sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
        } else if (type === 'noise') {
            sample = (Math.random() * 2) - 1;
        }

        sample *= envelope * 0.5; // Master volume 0.5

        // Convert to 16-bit PCM
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Generated: ${filename}`);
}

// Generate files
// Metronome Quartz (Tick/Tock - Percussive)
createWavFile('Perc_MetronomeQuartz_hi.wav', 1200, 0.1, 'noise'); // Creating a 'click' with high freq component? Actually noise burst is better for "wood" sound approximation
createWavFile('Perc_MetronomeQuartz_lo.wav', 800, 0.1, 'noise');

// Electronic Click (Beeps)
createWavFile('Synth_Tick_A_hi.wav', 2000, 0.05, 'square');
createWavFile('Synth_Tick_A_lo.wav', 1000, 0.05, 'square');

// Digital Bell (Sine/Tones)
createWavFile('Synth_Bell_A_hi.wav', 1500, 0.3, 'sine');
createWavFile('Synth_Bell_A_lo.wav', 1000, 0.3, 'sine');

console.log('All audio files generated successfully.');
