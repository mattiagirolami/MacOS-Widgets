// System info panel: CPU, RAM, thermal state and disk.
// Refreshes every 30 seconds. Position: bottom right, below the clock.

export const command = `top -l 1 | grep -E "^(CPU usage|PhysMem)" ; memory_pressure | grep "free percentage" ; pmset -g therm ; df -h / | tail -1 | awk '{print $4"|"$2"|"$5}'`;

export const refreshFrequency = 30000;

export const className = `
  bottom: 20px;
  right: 20px;
  .card {
    background: rgba(20, 20, 25, 0.65);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 16px 20px;
    color: #fff;
    font-family: -apple-system, "SF Pro Text", Helvetica, sans-serif;
    font-size: 13px;
    width: 260px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  .title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 10px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }
  .label { color: rgba(255, 255, 255, 0.6); }
  .value { font-weight: 600; font-variant-numeric: tabular-nums; }
  .value.hot { color: #ff5c5c; }
  .value.normal { color: rgba(130, 220, 130, 0.95); }
`;

export const render = ({ output }) => {
  const lines = (output || "").split("\n").filter(Boolean);
  const cpuLine = lines.find((l) => l.startsWith("CPU usage")) || "";
  const memLine = lines.find((l) => l.startsWith("PhysMem")) || "";
  const pressureLine = lines.find((l) => l.includes("free percentage")) || "";
  const diskLine = lines.find((l) => /^\d/.test(l.trim())) || "";
  const parts = diskLine.split("|");
  const diskFree = (parts[0] || "—").trim();
  const diskTotal = (parts[1] || "—").trim();
  const diskUsedPct = (parts[2] || "—").trim();


  const cpuMatch = cpuLine.match(/([\d.]+)% user,\s*([\d.]+)% sys/);
  const cpuUser = cpuMatch ? cpuMatch[1] : "—";
  const cpuSys = cpuMatch ? cpuMatch[2] : "—";

  const memUsedMatch = memLine.match(/(\d+)([MG]) used/);
  const memAvailableMatch = pressureLine.match(/(\d+)%/);
  const memUsed = memUsedMatch ? memUsedMatch[1] + memUsedMatch[2] : "—";
  // memory_pressure restituisce la memoria REALMENTE disponibile (meglio di "used")
  const memPct = memAvailableMatch ? memAvailableMatch[1] + "% disp." : "";

  // Thermal state: pmset -g therm only prints "Note: ..." lines when everything is fine;
  // when a warning is active, extra lines (e.g. "CPU_SLR_PAST: status=...") appear.
  const thermalOk = lines
    .filter((l) => l.includes("warning") || l.includes("Thermal") || l.includes("throttl"))
    .every((l) => l.startsWith("Note:"));
  const thermalLabel = thermalOk ? "Normal" : "Throttling";

  return (
    <div className="card">
      <div className="title">System</div>
      <div className="row">
        <span className="label">CPU</span>
        <span className="value">{cpuUser}% user · {cpuSys}% sys</span>
      </div>
      <div className="row">
        <span className="label">RAM</span>
        <span className="value">{memUsed} · {memPct || "—"}</span>
      </div>
      <div className="row">
        <span className="label">Temperature</span>
        <span className={`value ${thermalOk ? "normal" : "hot"}`}>{thermalLabel}</span>
      </div>
      <div className="row">
        <span className="label">Disk</span>
        <span className="value">{diskFree} free of {diskTotal} ({diskUsedPct})</span>
      </div>
    </div>
  );
};
