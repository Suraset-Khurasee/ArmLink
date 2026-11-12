const sliderRoot = document.querySelector("#sliders");
const output = document.querySelector("#output");
const requestState = document.querySelector("#request-state");
const reset = document.querySelector("#reset");
const status = document.querySelector("#status");

const motors = [
  "Base",
  "Shoulder",
  "Upper arm",
  "Elbow",
  "Forearm",
  "Wrist pitch",
  "Wrist roll"
];

let values = Array(motors.length).fill(0);
let updateTimer;

function render() {
  sliderRoot.innerHTML = motors.map((motor, index) => `
    <label class="joint">
      <span class="joint-label">
        <span><strong>Motor ${index + 1}</strong><small>${motor}</small></span>
        <output id="value-${index}">${values[index]}°</output>
      </span>
      <input data-index="${index}" type="range" min="-180" max="180" step="1" value="${values[index]}" aria-label="Motor ${index + 1} ${motor}">
      <span class="range-labels"><span>-180°</span><span>0°</span><span>180°</span></span>
    </label>
  `).join("");

  sliderRoot.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.index);
      values[index] = Number(event.target.value);
      document.querySelector(`#value-${index}`).value = `${values[index]}°`;
      scheduleUpdate();
    });
  });
}

function showOutput() {
  output.textContent = JSON.stringify({
    mode: "mock",
    joints: values,
    timestamp: new Date().toISOString()
  }, null, 2);
}

async function sendUpdate() {
  requestState.textContent = "Sending…";
  try {
    const response = await fetch("/api/joints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joints: values })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    values = data.joints;
    showOutput();
    requestState.textContent = "Updated";
  } catch (error) {
    requestState.textContent = error.message;
  }
}

function scheduleUpdate() {
  showOutput();
  clearTimeout(updateTimer);
  updateTimer = setTimeout(sendUpdate, 100);
}

reset.addEventListener("click", () => {
  values = Array(motors.length).fill(0);
  render();
  scheduleUpdate();
});

render();
showOutput();
