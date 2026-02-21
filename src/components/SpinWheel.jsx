import { useCallback, useRef, useState } from 'react';
import './SpinWheel.css';

const SEGMENT_COLORS = [
  '#e94560', '#0f3460', '#16213e', '#1a1a2e',
  '#533483', '#e94560', '#0f3460', '#16213e',
  '#1a1a2e', '#533483', '#e94560', '#0f3460',
  '#16213e', '#1a1a2e', '#533483', '#e94560',
];

function getSegmentColor(index) {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
}

/**
 * Wheel drawn with SVG. Each segment is equal size; only unread questions are pickable.
 * No text on segments (only colors).
 */
export function SpinWheel({ questions, onPick, disabled }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const svgRef = useRef(null);

  const unreadIndexes = questions
    .map((q, i) => (q.isRead ? -1 : i))
    .filter((i) => i >= 0);
  const canSpin = !disabled && !spinning && unreadIndexes.length > 0;

  const spin = useCallback(() => {
    if (!canSpin) return;
    setSpinning(true);
    const count = unreadIndexes.length;
    const randomUnreadIndex = unreadIndexes[Math.floor(Math.random() * count)];
    const segments = questions.length;
    const segmentAngleDeg = 360 / segments;
    const segmentCenterDeg = (randomUnreadIndex + 0.5) * segmentAngleDeg;
    const fullRotations = 4 + Math.random() * 3;
    const finalAngle = 360 * fullRotations + (90 - segmentCenterDeg);
    const totalRotation = rotation + finalAngle;
    setRotation(totalRotation);

    const duration = 4000;
    const startTime = performance.now();
    const startRotation = rotation;

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);
      const current = startRotation + finalAngle * easeOut;
      setRotation(current);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setSpinning(false);
        onPick(questions[randomUnreadIndex]);
      }
    }
    requestAnimationFrame(tick);
  }, [questions, unreadIndexes, rotation, canSpin, onPick]);

  if (!questions.length) {
    return (
      <div className="spin-wheel-container empty">
        <p>No questions yet. Add API URLs in Settings.</p>
      </div>
    );
  }

  const segments = questions.length;
  const segmentAngle = (2 * Math.PI) / segments;
  const radius = 45;
  const cx = 50;
  const cy = 50;

  return (
    <div className="spin-wheel-container">
      <div className="spin-wheel-pointer" aria-hidden />
      <div
        className="spin-wheel-wrapper"
        style={{ '--current-rotation': `${rotation}deg` }}
      >
        <svg
          ref={svgRef}
          className="spin-wheel-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="wheel-group">
            {questions.map((q, i) => {
              const startAngle = -Math.PI / 2 + i * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const x1 = cx + radius * Math.cos(startAngle);
              const y1 = cy + radius * Math.sin(startAngle);
              const x2 = cx + radius * Math.cos(endAngle);
              const y2 = cy + radius * Math.sin(endAngle);
              const large = segmentAngle > Math.PI ? 1 : 0;
              const d = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`,
                'Z',
              ].join(' ');
              return (
                <path
                  key={q.id}
                  d={d}
                  fill={getSegmentColor(i)}
                  className={`segment ${q.isRead ? 'read' : ''}`}
                />
              );
            })}
          </g>
          <circle cx={cx} cy={cy} r={8} fill="#1a1a2e" className="center-dot" />
        </svg>
      </div>
      <button
        type="button"
        className="spin-button"
        onClick={spin}
        disabled={!canSpin}
        aria-label="Spin wheel to pick a question"
      >
        {spinning ? 'Spinning…' : 'Spin'}
      </button>
    </div>
  );
}
