"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TextHoverEffect = ({
  text,
  duration,
}: {
  text: string;
  duration?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      
      // Guard against division by zero or invalid dimensions
      if (svgRect.width === 0 || svgRect.height === 0) {
        return;
      }
      
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      
      // Guard against NaN values
      if (isNaN(cxPercentage) || isNaN(cyPercentage)) {
        return;
      }
      
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 500 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none"
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor={"#93C5FD"} /> {/* Very Light Blue */}
              <stop offset="25%" stopColor={"#3B82F6"} /> {/* Vivid Blue */}
              <stop offset="50%" stopColor={"#60A5FA"} /> {/* Light Blue */}
              <stop offset="75%" stopColor={"#3B82F6"} /> {/* Vivid Blue */}
              <stop offset="100%" stopColor={"#93C5FD"} /> {/* Very Light Blue */}
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          animate={maskPosition}
          // Ensure initial values are set to avoid "undefined" error
          initial={{ cx: "50%", cy: "50%" }}
          transition={{ duration: duration ?? 0, ease: "linear" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
        {/* Glow Filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Base Text (Solid Vivid Blue) */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        className="font-[helvetica] font-bold fill-[#3B82F6] dark:fill-[#60A5FA] stroke-[#3B82F6] dark:stroke-[#60A5FA] text-7xl"
        style={{ opacity: 1 }}
      >
        {text}
      </text>
      
      {/* Animated Stroke Text */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1.5"
        className="font-[helvetica] font-bold fill-transparent text-7xl stroke-[#3B82F6] dark:stroke-[#60A5FA]"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>

      {/* Glow Layer (Blurred Background) */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="4"
        mask="url(#textMask)"
        filter="url(#glow)"
        className="font-[helvetica] font-bold fill-transparent text-7xl opacity-80"
      >
        {text}
      </text>
      
      {/* Gradient Text (Sharp Foreground) */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="2"
        mask="url(#textMask)"
        className="font-[helvetica] font-bold fill-transparent text-7xl"
      >
        {text}
      </text>
    </svg>
  );
};
