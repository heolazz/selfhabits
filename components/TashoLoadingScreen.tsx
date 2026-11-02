
import React from "react";
import { motion } from "framer-motion";

interface TashoLoadingScreenProps {
  onFinish?: () => void;
}

export const TashoLoadingScreen: React.FC<TashoLoadingScreenProps> = () => {
  const blueColor = "#1D5BF0"; // Warna biru background logo Tasho

  // Varian animasi untuk transisi berurutan
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  };

  const catVariants = {
    hidden: { y: 50, scale: 0.8, opacity: 0 },
    visible: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12
      }
    }
  };

  const sparkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const textVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const pulseVariants = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.9, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: blueColor,
        fontFamily: "'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <div className="flex flex-col items-center gap-3">
        {/* SVG Logo Vektor Tasho */}
        <motion.svg
          width="200"
          height="160"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          variants={catVariants}
          style={{ overflow: "visible" }}
        >
          {/* Badan Kucing */}
          <path
            d="M40 140 C20 140 25 100 45 60 L60 25 C62 20 70 22 75 35 L85 60 C95 55 110 55 120 60 L130 35 C135 22 143 20 145 25 L160 60 C180 100 185 140 165 140 C155 140 150 125 140 125 C130 125 125 140 115 140 C105 140 100 130 90 130 C80 130 75 140 65 140 C55 140 50 125 40 125 C30 125 25 140 15 140 Z"
            fill="white"
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cakar Kucing (Garis Pemisah Biru) */}
          <path
            d="M45 145 L50 125 M65 145 L60 125 M160 145 L155 125 M140 145 L145 125"
            stroke={blueColor}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Mata Kiri */}
          <ellipse
            cx="80"
            cy="85"
            rx="14"
            ry="20"
            fill={blueColor}
            transform="rotate(15 80 85)"
          />
          <ellipse
            cx="83"
            cy="80"
            rx="4"
            ry="7"
            fill="white"
            transform="rotate(15 83 80)"
          />

          {/* Mata Kanan */}
          <ellipse
            cx="125"
            cy="85"
            rx="14"
            ry="20"
            fill={blueColor}
            transform="rotate(-15 125 85)"
          />
          <ellipse
            cx="128"
            cy="80"
            rx="4"
            ry="7"
            fill="white"
            transform="rotate(-15 128 80)"
          />

          {/* Hidung */}
          <path
            d="M102 105 L108 105 L105 110 Z"
            fill={blueColor}
            stroke={blueColor}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Percikan Kanan (Sparks) */}
          <motion.line
            variants={sparkVariants}
            x1="165"
            y1="55"
            x2="180"
            y2="40"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <motion.line
            variants={sparkVariants}
            x1="175"
            y1="70"
            x2="190"
            y2="60"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <motion.line
            variants={sparkVariants}
            x1="180"
            y1="85"
            x2="192"
            y2="83"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Teks Tasho */}
        <motion.h1
          variants={textVariants}
          className="text-white text-5xl font-extrabold tracking-tight m-0"
        >
          tasho
        </motion.h1>

        {/* Subtle loading dots indicator */}
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="flex items-center gap-1.5 mt-2"
        >
          <span className="w-2 h-2 rounded-full bg-white/70"></span>
          <span className="w-2 h-2 rounded-full bg-white/70"></span>
          <span className="w-2 h-2 rounded-full bg-white/70"></span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TashoLoadingScreen;
