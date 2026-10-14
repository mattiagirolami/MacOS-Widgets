// Clock: updates every second via refreshFrequency (no external imports).
// Position: bottom right, above the system info panel.

export const command = `date "+%H:%M|%A %d %B"`;

export const refreshFrequency = 1000;

export const className = `
  bottom: 200px;
  right: 20px;
  width: 260px;
  text-align: right;
  .clock {
    font-family: -apple-system, "SF Pro Display", Helvetica, sans-serif;
    font-size: 44px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    line-height: 1;
  }
  .date {
    font-family: -apple-system, "SF Pro Text", Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
    margin-top: 4px;
  }
`;

export const render = ({ output }) => {
  const [time, date = ""] = (output || "").split("|");

  return (
    <div>
      <div className="clock">{time}</div>
      <div className="date">{date}</div>
    </div>
  );
};
