// System info panel: CPU, RAM as concentric rings, thermal state in the middle.
// Refreshes every 30 seconds. Position: bottom right, below the energy widget.

export const command = `top -l 1 | grep -E "^(CPU usage|PhysMem)" ; memory_pressure | grep "free percentage" ; pmset -g therm ; ioreg -r -n AppleSmartBattery 2>/dev/null | grep '"Temperature"' | head -1 | awk '{print $3}'`;

export const refreshFrequency = 30000;

export const className = `
  bottom: 20px;
  right: 20px;
  .card {
    background: rgba(20, 20, 25, 0.65);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 18px 20px;
    color: #fff;
    font-family: -apple-system, "SF Pro Text", Helvetica, sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 18px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  .legend { width: 130px; }
  .legend-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 0;
  }
  .label { color: rgba(255, 255, 255, 0.6); font-size: 12px; }
  .value { font-weight: 600; font-variant-numeric: tabular-nums; font-size: 12px; }
  .center-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    fill: rgba(255, 255, 255, 0.9);
  }
  .ring-track { stroke: rgba(255, 255, 255, 0.09); fill: none; }
  .ring {
    fill: none;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s ease;
  }
`;

const RINGS = [
  { key: "cpu", label: "CPU", r: 52, width: 8 },
  { key: "ram", label: "RAM", r: 38, width: 8 },
];

const colorFor = (pct) =>
  pct > 80 ? "#ff5c5c" : pct > 50 ? "#ffc45c" : "rgba(130, 220, 130, 0.95)";

// Temperature ranges for the thermometer + colors (battery/SoC sensor °C).
const TEMP_RANGES = [
  { max: 40, color: "rgba(130, 220, 130, 0.95)" }, // cool
  { max: 55, color: "#ffc45c" },                  // warm
  { max: 70, color: "#ff8c5c" },                  // hot
  { max: Infinity, color: "#ff5c5c" },            // very hot
];

const tempColor = (t) => (TEMP_RANGES.find((r) => t < r.max) || TEMP_RANGES[3]).color;

export const render = ({ output }) => {
  const lines = (output || "").split("\n").filter(Boolean);
  const cpuLine = lines.find((l) => l.startsWith("CPU usage")) || "";
  const memLine = lines.find((l) => l.startsWith("PhysMem")) || "";
  const pressureLine = lines.find((l) => l.includes("free percentage")) || "";

  const cpuMatch = cpuLine.match(/([\d.]+)% user,\s*([\d.]+)% sys/);
  const cpuUser = cpuMatch ? parseFloat(cpuMatch[1]) : 0;
  const cpuSys = cpuMatch ? parseFloat(cpuMatch[2]) : 0;
  const cpuPct = Math.min(cpuUser + cpuSys, 100);

  const memUsedMatch = memLine.match(/(\d+)([MG]) used/);
  const memAvailableMatch = pressureLine.match(/(\d+)%/);
  const memUsed = memUsedMatch ? memUsedMatch[1] + memUsedMatch[2] : "—";
  const ramPct = memAvailableMatch ? Math.min(100 - parseInt(memAvailableMatch[1], 10), 100) : 0;

  // Thermal state: pmset -g therm only prints "Note: ..." lines when everything is fine;
  // when a warning is active, extra lines (e.g. "CPU_SLR_PAST: status=...") appear.
  const thermalOk = lines
    .filter((l) => l.includes("warning") || l.includes("Thermal") || l.includes("throttl"))
    .every((l) => l.startsWith("Note:"));

  // Battery/SoC temperature sensor (centi-degrees). No sudo needed.
  const tempLine = lines.find((l) => /^\d+$/.test(l.trim()));
  const tempC = tempLine ? parseInt(tempLine.trim(), 10) / 100 : null;

  const throttling = !thermalOk;
  const thermoColor = throttling ? "#ff5c5c" : tempC !== null ? tempColor(tempC) : "rgba(255,255,255,0.45)";

  const values = { cpu: cpuPct, ram: ramPct };

  const SIZE = 132;
  const C = SIZE / 2;

  return (
    <div className="card">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {RINGS.map(({ key, r, width }) => {
          const circumference = 2 * Math.PI * r;
          const pct = values[key];
          const offset = circumference * (1 - pct / 100);
          return (
            <g key={key}>
              <circle className="ring-track" cx={C} cy={C} r={r} strokeWidth={width} />
              <circle
                className="ring"
                cx={C}
                cy={C}
                r={r}
                strokeWidth={width}
                stroke={colorFor(pct)}
                style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                transform={`rotate(-90 ${C} ${C})`}
              />
            </g>
          );
        })}
        {tempC !== null && (() => {
          // Thermometer icon: tube + bulb, mercury level & color follow the temp.
          const frac = Math.min(Math.max((tempC - 20) / (90 - 20), 0), 1);
          const tubeTop = C - 18;
          const bulbY = C + 9;
          const mercuryY = tubeTop + (1 - frac) * (bulbY - 4 - tubeTop);
          return (
            <g>
              <line
                x1={C} y1={tubeTop} x2={C} y2={bulbY - 4}
                stroke="rgba(255,255,255,0.15)" strokeWidth={6} strokeLinecap="round"
              />
              <line
                x1={C} y1={mercuryY} x2={C} y2={bulbY - 4}
                stroke={thermoColor} strokeWidth={4} strokeLinecap="round"
              />
              <circle cx={C} cy={bulbY} r={6.5} style={{ fill: thermoColor }} />
              <text
                className="center-label"
                x={C}
                y={C + 26}
                textAnchor="middle"
                style={{ fill: "rgba(255,255,255,0.8)" }}
              >
                {tempC.toFixed(0)}°C
              </text>
            </g>
          );
        })()}
        {tempC === null && (
          <text
            className="center-label"
            x={C}
            y={C + 5}
            textAnchor="middle"
            style={{ fill: thermoColor }}
          >
            {throttling ? "HOT" : "Normal"}
          </text>
        )}
      </svg>

      <div className="legend">
        <div className="legend-title">System</div>
        <div className="row">
          <span className="label">CPU</span>
          <span className="value">{cpuPct.toFixed(0)}%</span>
        </div>
        <div className="row">
          <span className="label">RAM</span>
          <span className="value">{ramPct}% · {memUsed}</span>
        </div>
      </div>
    </div>
  );
};
