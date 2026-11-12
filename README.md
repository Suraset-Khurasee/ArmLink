# ArmLink

ArmLink is a safety-first web control surface for an AgileX NERO robotic arm.

The first prototype is intentionally **UI-only**: four live joint sliders update a local mock API and display the JSON command payload. It does not connect to, enable, or move physical hardware.

## Run locally

Requires Node.js 18 or newer.

```bash
npm start
```

Open <http://localhost:3000>.

To expose the API on a LAN interface, run the server on the computer that will host the eventual arm adapter and set `PORT` if needed:

```bash
PORT=3000 npm start
```

## Planned hardware integration

The next step is a separate, opt-in adapter process for `pyAgxArm`/the NERO API. It should include connection health checks, joint limits, rate limiting, a dead-man/enable control, an explicit hardware confirmation, and an emergency-stop procedure before any slider can issue real motion.
