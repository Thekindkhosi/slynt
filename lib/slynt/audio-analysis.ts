export async function getAudioMetadataAndPeaks(
  src: string,
  samples = 1024,
): Promise<{ durationInSeconds: number; waveformPeaks: number[] }> {
  const response = await fetch(src, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load uploaded audio for analysis.");
  }

  const buffer = await response.arrayBuffer();
  const AudioContextCtor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error("This browser does not support Web Audio decoding.");
  }

  const context = new AudioContextCtor();
  try {
    const decoded = await context.decodeAudioData(buffer.slice(0));
    const peaks = createWaveformPeaks(decoded, samples);
    return {
      durationInSeconds: decoded.duration,
      waveformPeaks: peaks,
    };
  } finally {
    await context.close();
  }
}

function createWaveformPeaks(audioBuffer: AudioBuffer, samples: number) {
  const channelCount = audioBuffer.numberOfChannels;
  const blockSize = Math.max(1, Math.floor(audioBuffer.length / samples));
  const peaks: number[] = [];
  let max = 0;

  for (let i = 0; i < samples; i += 1) {
    const start = i * blockSize;
    const end = Math.min(audioBuffer.length, start + blockSize);
    let sum = 0;
    let count = 0;

    for (let channel = 0; channel < channelCount; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = start; index < end; index += 1) {
        sum += Math.abs(data[index] ?? 0);
        count += 1;
      }
    }

    const value = count > 0 ? sum / count : 0;
    peaks.push(value);
    max = Math.max(max, value);
  }

  if (max <= 0) {
    return peaks.map(() => 0);
  }

  return peaks.map((peak) => Number((peak / max).toFixed(4)));
}

