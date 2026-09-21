(() => {
  "use strict";

  const STRINGS = [
    { number: 1, label: "e", midi: 64 },
    { number: 2, label: "B", midi: 59 },
    { number: 3, label: "G", midi: 55 },
    { number: 4, label: "D", midi: 50 },
    { number: 5, label: "A", midi: 45 },
    { number: 6, label: "E", midi: 40 }
  ];

  const MISSIONS = [
    { string: 6, fret: 0, title: "Wake the low string", tavi: "Start easy. Bottom TAB line, zero fret. Zero means open string — no fingers down." },
    { string: 5, fret: 0, title: "Cross the second rune", tavi: "Move one TAB line up. Still a zero, so let that string ring open." },
    { string: 4, fret: 2, title: "Find fret two", tavi: "Now the number matters. Same rule: line = string, number = fret." },
    { string: 3, fret: 0, title: "Open the green gate", tavi: "You’re reading TAB already. Don’t overthink it." },
    { string: 2, fret: 1, title: "Unlock the hidden stair", tavi: "Second line from the top, first fret. Nice and clean." },
    { string: 1, fret: 0, title: "Ring the high beacon", tavi: "Top line now. Same letter name as the low string, way higher pitch." },
    { string: 6, fret: 3, title: "Power the stone bridge", tavi: "Low string, third fret. You’ve got this." },
    { string: 5, fret: 2, title: "Tune the crystal lock", tavi: "Read first, then move your hand. The goal is to make TAB feel automatic." },
    { string: 4, fret: 2, title: "Echo the chamber", tavi: "We’re repeating one on purpose. Fast recognition beats memorizing speeches." },
    { string: 3, fret: 2, title: "Light the map", tavi: "Third line, second fret. The symbols are turning into movement now." },
    { string: 2, fret: 3, title: "Call the skybird", tavi: "Second string, third fret. Hold the note long enough for me to hear it." },
    { string: 1, fret: 3, title: "Finish String Scout", tavi: "Final beacon: top string, third fret. Then we start chaining notes into riffs." }
  ];

  const els = {
    score: document.getElementById("score"),
    streak: document.getElementById("streak"),
    stars: document.getElementById("stars"),
    missionNumber: document.getElementById("missionNumber"),
    missionTitle: document.getElementById("missionTitle"),
    missionCopy: document.getElementById("missionCopy"),
    tabDisplay: document.getElementById("tabDisplay"),
    targetPrompt: document.getElementById("targetPrompt"),
    feedback: document.getElementById("feedback"),
    meterNeedle: document.getElementById("meterNeedle"),
    micButton: document.getElementById("micButton"),
    hintButton: document.getElementById("hintButton"),
    skipButton: document.getElementById("skipButton"),
    taviLine: document.getElementById("taviLine")
  };

  let state = loadState();
  let audioContext = null;
  let analyser = null;
  let stream = null;
  let micOn = false;
  let detectionTimer = null;
  let stableHits = 0;
  let lastPitch = null;
  let locked = false;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("itabQuestMvp") || "null");
      if (saved && Number.isInteger(saved.index)) {
        return {
          index: Math.max(0, Math.min(saved.index, MISSIONS.length - 1)),
          score: Number(saved.score) || 0,
          streak: Number(saved.streak) || 0,
          solved: Number(saved.solved) || 0
        };
      }
    } catch (_) {}
    return { index: 0, score: 0, streak: 0, solved: 0 };
  }

  function saveState() {
    try {
      localStorage.setItem("itabQuestMvp", JSON.stringify(state));
    } catch (_) {}
  }

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function targetInfo() {
    const mission = MISSIONS[state.index];
    const stringInfo = STRINGS.find(s => s.number === mission.string);
    const midi = stringInfo.midi + mission.fret;
    return {
      ...mission,
      stringInfo,
      midi,
      frequency: midiToFrequency(midi)
    };
  }

  function renderTab(stringNumber, fret) {
    const width = 12;
    const markerPos = 6;
    return STRINGS.map(s => {
      const marker = s.number === stringNumber ? String(fret) : "-";
      const before = "-".repeat(markerPos);
      const after = "-".repeat(Math.max(2, width - markerPos - marker.length));
      return s.label + "|" + before + marker + after;
    }).join("\n");
  }

  function render() {
    const t = targetInfo();
    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    const starCount = state.solved >= 10 ? 3 : state.solved >= 6 ? 2 : state.solved >= 3 ? 1 : 0;
    els.stars.textContent = "★".repeat(starCount) + "☆".repeat(3 - starCount);
    els.missionNumber.textContent = String(state.index + 1);
    els.missionTitle.textContent = t.title;
    els.tabDisplay.textContent = renderTab(t.string, t.fret);
    els.targetPrompt.textContent = "Play the TAB above";
    els.taviLine.textContent = t.tavi;
    setFeedback(micOn ? "Listening… play one clean note and let it ring." : "Tap “Use Guitar Mic” to begin.", "");
    setMeter(0);
  }

  function setFeedback(message, kind) {
    els.feedback.textContent = message;
    els.feedback.className = "feedback" + (kind ? " " + kind : "");
  }

  function setMeter(cents) {
    const clamped = Math.max(-50, Math.min(50, Number.isFinite(cents) ? cents : 0));
    const percent = 50 + clamped;
    els.meterNeedle.style.left = percent + "%";
  }

  function centsOff(freq, target) {
    return 1200 * Math.log2(freq / target);
  }

  function noteName(midi) {
    const names = ["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
    return names[((midi % 12) + 12) % 12];
  }

  async function startMic() {
    if (micOn) {
      stopMic();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFeedback("This browser does not expose microphone input. Try Chrome or Safari over HTTPS.", "bad");
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        }
      });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);

      micOn = true;
      els.micButton.textContent = "⏹ Stop Listening";
      stableHits = 0;
      setFeedback("Listening… play one clean note and let it ring.", "");
      detectionTimer = window.setInterval(analyzePitch, 85);
    } catch (err) {
      setFeedback("Microphone permission was blocked. Allow mic access, then try again.", "bad");
      console.error(err);
    }
  }

  function stopMic() {
    micOn = false;
    els.micButton.textContent = "🎤 Use Guitar Mic";
    if (detectionTimer) {
      clearInterval(detectionTimer);
      detectionTimer = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    analyser = null;
    stableHits = 0;
    setMeter(0);
    if (!locked) setFeedback("Listening stopped.", "");
  }

  function analyzePitch() {
    if (!analyser || !audioContext || locked) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const pitch = detectPitchYin(buffer, audioContext.sampleRate);
    if (!pitch || pitch < 65 || pitch > 800) {
      stableHits = Math.max(0, stableHits - 1);
      return;
    }

    lastPitch = pitch;
    const target = targetInfo();
    const cents = centsOff(pitch, target.frequency);
    setMeter(cents);

    const abs = Math.abs(cents);
    if (abs <= 35) {
      stableHits += 1;
      setFeedback("That’s it — hold it…", "ok");
      if (stableHits >= 4) completeMission();
    } else {
      stableHits = 0;
      if (cents < -35) {
        setFeedback("Too low. Move to a higher pitch and try again.", "warn");
      } else {
        setFeedback("Too high. Move to a lower pitch and try again.", "warn");
      }
    }
  }

  function completeMission() {
    if (locked) return;
    locked = true;
    state.score += 100 + Math.min(state.streak * 10, 100);
    state.streak += 1;
    state.solved += 1;
    saveState();
    setMeter(0);
    setFeedback("Correct! ✨ TAB decoded.", "ok");
    els.taviLine.textContent = state.index === MISSIONS.length - 1
      ? "You did it. Next up: two-note patterns, then tiny riffs. This is where it starts feeling like music."
      : "Yes! That symbol just became a real note under your fingers.";

    window.setTimeout(() => {
      if (state.index < MISSIONS.length - 1) {
        state.index += 1;
      } else {
        state.index = 0;
      }
      saveState();
      locked = false;
      stableHits = 0;
      render();
    }, 1300);
  }

  function showHint() {
    const t = targetInfo();
    els.taviLine.textContent = "Hint: string " + t.string + ", fret " + t.fret + ". On TAB, the top line is the skinny high-e string and the bottom line is the thick low-E string.";
    els.targetPrompt.textContent = "String " + t.string + " • Fret " + t.fret;
    setFeedback("Target pitch: " + noteName(t.midi) + ". Play it cleanly and let it ring.", "warn");
  }

  function skipMission() {
    if (locked) return;
    state.streak = 0;
    state.index = (state.index + 1) % MISSIONS.length;
    saveState();
    stableHits = 0;
    render();
  }

  // Simplified YIN pitch detector for monophonic guitar notes.
  function detectPitchYin(buffer, sampleRate) {
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.012) return null;

    const minFreq = 70;
    const maxFreq = 750;
    const minTau = Math.max(2, Math.floor(sampleRate / maxFreq));
    const maxTau = Math.min(Math.floor(sampleRate / minFreq), Math.floor(buffer.length / 2));

    const diff = new Float32Array(maxTau + 1);
    for (let tau = minTau; tau <= maxTau; tau++) {
      let sum = 0;
      const limit = buffer.length - tau;
      for (let i = 0; i < limit; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      diff[tau] = sum;
    }

    const cmnd = new Float32Array(maxTau + 1);
    cmnd[0] = 1;
    let running = 0;
    for (let tau = 1; tau <= maxTau; tau++) {
      running += diff[tau];
      cmnd[tau] = running === 0 ? 1 : diff[tau] * tau / running;
    }

    const threshold = 0.14;
    let tauEstimate = -1;
    for (let tau = minTau; tau <= maxTau; tau++) {
      if (cmnd[tau] < threshold) {
        while (tau + 1 <= maxTau && cmnd[tau + 1] < cmnd[tau]) tau++;
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate < 0) {
      let bestTau = minTau;
      let best = cmnd[minTau];
      for (let tau = minTau + 1; tau <= maxTau; tau++) {
        if (cmnd[tau] < best) {
          best = cmnd[tau];
          bestTau = tau;
        }
      }
      if (best > 0.28) return null;
      tauEstimate = bestTau;
    }

    const x0 = tauEstimate > 1 ? tauEstimate - 1 : tauEstimate;
    const x2 = tauEstimate + 1 <= maxTau ? tauEstimate + 1 : tauEstimate;
    const s0 = cmnd[x0];
    const s1 = cmnd[tauEstimate];
    const s2 = cmnd[x2];

    let betterTau = tauEstimate;
    const denom = 2 * (2 * s1 - s2 - s0);
    if (denom !== 0) betterTau += (s2 - s0) / denom;

    if (!Number.isFinite(betterTau) || betterTau <= 0) return null;
    return sampleRate / betterTau;
  }

  els.micButton.addEventListener("click", startMic);
  els.hintButton.addEventListener("click", showHint);
  els.skipButton.addEventListener("click", skipMission);

  window.addEventListener("pagehide", () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  });

  render();
})();