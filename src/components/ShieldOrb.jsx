import React from 'react';

/**
 * ShieldOrb — GuardRail Commerce Core 3D Visualization
 * Visualizing: AI Agent -> Request -> GuardRail Core -> Approve/Block -> Payment -> Audit
 */
const ShieldOrb = ({ revoked = false, running = false }) => {
    const coreColor = revoked
        ? '#EF4444'
        : running
            ? '#22D3EE'
            : '#5B8CFF';

    const glowColor = revoked
        ? 'rgba(239,68,68,0.35)'
        : running
            ? 'rgba(34,211,238,0.35)'
            : 'rgba(91,140,255,0.3)';

    return (
        <div className="relative flex items-center justify-center select-none" style={{ width: 220, height: 220 }}>
            {/* Atmospheric radial core glow */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)`,
                    filter: 'blur(25px)',
                    animation: 'core-pulse 3s ease-in-out infinite',
                }}
            />

            {/* Floating Commerce Core container */}
            <div
                style={{
                    animation: 'shield-float 6s ease-in-out infinite',
                    position: 'relative',
                    width: 160,
                    height: 160,
                }}
            >
                {/* Outer Orbit Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: -22,
                        borderRadius: '50%',
                        border: `1px solid rgba(91,140,255,0.25)`,
                        transform: 'rotateX(72deg)',
                        animation: 'orbit-spin 7s linear infinite',
                    }}
                />

                {/* Inner Orbit Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: -10,
                        borderRadius: '50%',
                        border: `1px solid rgba(34,211,238,0.20)`,
                        transform: 'rotateX(60deg) rotateZ(45deg)',
                        animation: 'orbit-reverse 10s linear infinite',
                    }}
                />

                {/* 3D Glass Shield SVG */}
                <svg
                    viewBox="0 0 130 150"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 16px rgba(91,140,255,0.3))' }}
                >
                    {/* Outer Shield Hull */}
                    <path
                        d="M65 8 L118 32 L118 80 C118 112 65 142 65 142 C65 142 12 112 12 80 L12 32 Z"
                        fill="rgba(11, 18, 32, 0.7)"
                        stroke={revoked ? 'rgba(239,68,68,0.6)' : 'rgba(91,140,255,0.45)'}
                        strokeWidth="1.5"
                    />

                    {/* Inner Shield Refraction */}
                    <path
                        d="M65 20 L108 40 L108 78 C108 106 65 130 65 130 C65 130 22 106 22 78 L22 40 Z"
                        fill="rgba(255,255,255,0.03)"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />

                    {/* Top Specular Glint */}
                    <path
                        d="M65 20 L108 40 L100 35 L65 22 L30 35 L22 40 Z"
                        fill="rgba(255,255,255,0.08)"
                    />

                    {/* Core Quantum Rings */}
                    <circle cx="65" cy="74" r="22" fill="rgba(255,255,255,0.02)" stroke={`${coreColor}30`} strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="65" cy="74" r="14" fill={`${coreColor}15`} stroke={`${coreColor}60`} strokeWidth="1.5" style={{ animation: 'core-pulse 2.5s ease-in-out infinite' }} />
                    <circle cx="65" cy="74" r="6" fill={coreColor} style={{ filter: `drop-shadow(0 0 8px ${coreColor})`, animation: 'core-pulse 2s ease-in-out infinite' }} />
                </svg>
            </div>

            {/* Bottom Label Tag */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <span className="mono text-[9px] font-bold tracking-[0.2em] text-[#94A3B8] uppercase px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                    Commerce Decision Core
                </span>
            </div>
        </div>
    );
};

export default ShieldOrb;
