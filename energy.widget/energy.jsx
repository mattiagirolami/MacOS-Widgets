// Top energy consumers: top 3 processes by "POWER" impact (Apple Silicon).
// top -l 2 is required: the first sample always reports 0 for every process,
// the second one has real values. Position: bottom right, above the clock.

export const command = `top -l 2 -o power -stats pid,command,power -n 15 | awk '$1 ~ /^[0-9]+$/ && $NF ~ /^[0-9.]+$/ && $2 != "top" {p[$1]=$0} END {for (k in p) print p[k]}'`;

export const refreshFrequency = 30000;

export const className = `
  bottom: 270px;
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
  .app {
    margin-bottom: 8px;
  }
  .app:last-child { margin-bottom: 0; }
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .app-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 170px;
  }
  .app-power {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .bar-track {
    margin-top: 4px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }
  .bar {
    height: 100%;
    border-radius: 2px;
  }
  .empty {
    color: rgba(130, 220, 130, 0.95);
  }
`;

export const render = ({ output }) => {
  const rows = (output || "")
    .split("\n")
    .filter((l) => /^\s*\d/.test(l))
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      const name = parts.slice(1, -1).join(" ") || parts[0];
      const power = parseFloat(parts[parts.length - 1]) || 0;
      return { name, power };
    })
    .filter((p) => p.power > 0)
    .sort((a, b) => b.power - a.power)
    .slice(0, 3);

  const max = rows.length ? rows[0].power : 1;

  return (
    <div className="card">
      <div className="title">Top Energy Drain</div>
      {rows.length === 0 ? (
        <div className="empty">Sistema in riposo 🌙</div>
      ) : (
        rows.map((p, i) => (
          <div className="app" key={i}>
            <div className="app-header">
              <span className="app-name">{p.name}</span>
              <span className="app-power">{p.power.toFixed(1)}</span>
            </div>
            <div className="bar-track">
              <div
                className="bar"
                style={{
                  width: `${Math.max((p.power / max) * 100, 6)}%`,
                  background:
                    p.power / max > 0.66
                      ? "#ff5c5c"
                      : p.power / max > 0.33
                        ? "#ffc45c"
                        : "rgba(130, 220, 130, 0.95)",
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};
