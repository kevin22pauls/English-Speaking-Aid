let sentence = "";
let blobAudio = null;
let audioURL = null;
const ngrokURL = ""; // replace with current ngrok

async function getSentence() {
    const res = await fetch(`${ngrokURL}/generate_sentence`);
    const data = await res.json();
    sentence = data.sentence;
    document.getElementById("sentenceText").setAttribute(
        "text",
        `value: ${sentence}; color: black; align: center; wrapCount: 20`
      );
      
    console.log("Fetched sentence:", sentence);

  }
  

let mediaRecorder;
let audioChunks = [];

function startRecording() {
  audioChunks = [];
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    alert("Recording... Speak now!");

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      blobAudio = new Blob(audioChunks, { type: 'audio/webm' });
      audioURL = URL.createObjectURL(blobAudio);
      sendAudioToBackend();
    };

    setTimeout(() => {
      mediaRecorder.stop();
    }, 4000);
  });
}

async function sendAudioToBackend() {
  const formData = new FormData();
  formData.append("original", sentence);
  formData.append("audio", blobAudio, "audio.webm");

  const res = await fetch(`${ngrokURL}/evaluate_speech`, {
    method: "POST",
    body: formData
  });

  const result = await res.json();
  document.getElementById("feedback").innerText =
    `You said: "${result.transcribed}"\nScore: ${result.score}%\nFeedback: ${result.feedback}`;
}

function playRecording() {
  if (audioURL) {
    new Audio(audioURL).play();
  } else {
    alert("Please record first.");
  }
}

async function playCorrect() {
  const res = await fetch(`${ngrokURL}/generate_audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence })
  });

  const blob = await res.blob();
  const correctAudioURL = URL.createObjectURL(blob);
  new Audio(correctAudioURL).play();
}