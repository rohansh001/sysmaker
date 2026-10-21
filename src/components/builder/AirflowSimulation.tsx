'use client';

import React from 'react';

interface AirflowSimulationProps {
  isActive: boolean;
}

export const AirflowSimulation: React.FC<AirflowSimulationProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <g className="airflow-simulation-layer pointer-events-none transition-opacity duration-300">
      <defs>
        {/* Cold air gradient */}
        <linearGradient id="coldAirGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
        </linearGradient>

        {/* Hot exhaust gradient */}
        <linearGradient id="hotAirGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9" />
        </linearGradient>

        {/* Cold particle pulse */}
        <filter id="airGlow">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Front Intake Streams (Cold blue arrows) */}
      <g filter="url(#airGlow)">
        {/* Stream 1 - Top front intake */}
        <path
          d="M 120 180 Q 240 185 360 210"
          fill="none"
          stroke="url(#coldAirGrad)"
          strokeWidth="3.5"
          strokeDasharray="10 14"
          className="animate-[dash_1.2s_linear_infinite]"
        />
        <circle cx="150" cy="182" r="3" fill="#38bdf8" opacity="0.8" />
        <circle cx="270" cy="195" r="3" fill="#38bdf8" opacity="0.8" />

        {/* Stream 2 - Mid front intake pointing directly toward CPU/RAM */}
        <path
          d="M 120 260 Q 260 260 410 265"
          fill="none"
          stroke="url(#coldAirGrad)"
          strokeWidth="4"
          strokeDasharray="12 16"
          className="animate-[dash_1s_linear_infinite]"
        />
        <circle cx="160" cy="260" r="3.5" fill="#38bdf8" opacity="0.9" />
        <circle cx="310" cy="262" r="3.5" fill="#38bdf8" opacity="0.9" />

        {/* Stream 3 - Bottom front intake toward GPU */}
        <path
          d="M 120 340 Q 260 345 380 370"
          fill="none"
          stroke="url(#coldAirGrad)"
          strokeWidth="3.5"
          strokeDasharray="10 14"
          className="animate-[dash_1.1s_linear_infinite]"
        />
        <circle cx="180" cy="342" r="3" fill="#38bdf8" opacity="0.8" />
      </g>

      {/* Bottom Intake Stream (Cold air into GPU) */}
      <g filter="url(#airGlow)">
        <path
          d="M 320 490 Q 340 430 360 380"
          fill="none"
          stroke="url(#coldAirGrad)"
          strokeWidth="3"
          strokeDasharray="8 12"
          className="animate-[dash_1.3s_linear_infinite]"
        />
        <path
          d="M 440 490 Q 450 430 460 380"
          fill="none"
          stroke="url(#coldAirGrad)"
          strokeWidth="3"
          strokeDasharray="8 12"
          className="animate-[dash_1.3s_linear_infinite]"
        />
      </g>

      {/* Internal Heat Dissipation Waves (over CPU Cooler and GPU) */}
      <g opacity="0.6">
        <rect
          x="350"
          y="200"
          width="130"
          height="120"
          rx="12"
          fill="none"
          stroke="#fb923c"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <rect
          x="300"
          y="350"
          width="240"
          height="60"
          rx="8"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </g>

      {/* Rear Exhaust (Hot exhaust fan out of the back) */}
      <g filter="url(#airGlow)">
        <path
          d="M 480 230 Q 560 215 670 210"
          fill="none"
          stroke="url(#hotAirGrad)"
          strokeWidth="4"
          strokeDasharray="12 16"
          className="animate-[dash_0.9s_linear_infinite]"
        />
        <circle cx="540" cy="222" r="3.5" fill="#f43f5e" opacity="0.9" />
        <circle cx="620" cy="214" r="3.5" fill="#f43f5e" opacity="0.9" />

        {/* Top Exhaust 1 (Above CPU cooler) */}
        <path
          d="M 430 180 Q 435 120 440 70"
          fill="none"
          stroke="url(#hotAirGrad)"
          strokeWidth="3.5"
          strokeDasharray="10 14"
          className="animate-[dash_1s_linear_infinite]"
        />

        {/* Top Exhaust 2 (Mid-top radiator) */}
        <path
          d="M 320 180 Q 320 120 320 70"
          fill="none"
          stroke="url(#hotAirGrad)"
          strokeWidth="3.5"
          strokeDasharray="10 14"
          className="animate-[dash_1.1s_linear_infinite]"
        />
      </g>

      {/* Airflow Legend Overlay */}
      <g transform="translate(40, 520)">
        <rect x="0" y="0" width="220" height="42" rx="8" fill="#0f172a" fillOpacity="0.85" stroke="#334155" />
        <circle cx="18" cy="21" r="5" fill="#38bdf8" />
        <text x="32" y="25" fill="#94a3b8" fontSize="11" fontWeight="bold">
          Cool Air Intake (~28°C)
        </text>
        <circle cx="128" cy="21" r="5" fill="#f43f5e" />
        <text x="142" y="25" fill="#94a3b8" fontSize="11" fontWeight="bold">
          Exhaust (~58°C)
        </text>
      </g>

      {/* SVG animation keyframe styling */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </g>
  );
};
