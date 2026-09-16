worker.js 

// public/worker.js
let dataBuffer = null;
let stateBuffer = null;

self.onmessage = function (e) {
    if (e.data.type === 'INIT') {
        dataBuffer = new Float32Array(e.data.sharedBuffer);
        stateBuffer = new Int32Array(e.data.stateBuffer);
        return;
    }

    if (!dataBuffer || !(e.data instanceof ArrayBuffer)) return;

    const view = new DataView(e.data);
    const stationId = view.getUint16(0, true);
    const channelId = view.getUint8(2);
    const channelIndex = (stationId - 1) * 3 + channelId;
    const historySize = 120000;

    if (channelIndex < 0 || channelIndex >= 27) return;

    for (let i = 0; i < 50; i++) {
        const sample = view.getInt32(16 + (i * 4), true);
        
        let writePos = Atomics.load(stateBuffer, channelIndex);
        dataBuffer[(channelIndex * historySize) + writePos] = sample;
        
        writePos = (writePos + 1) % historySize;
        Atomics.store(stateBuffer, channelIndex, writePos);
    }
};