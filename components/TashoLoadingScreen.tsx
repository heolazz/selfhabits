
import React from "react";
import { motion } from "framer-motion";

interface TashoLoadingScreenProps {
  onFinish?: () => void;
}

export const TashoLoadingScreen: React.FC<TashoLoadingScreenProps> = () => {
  const blueBg = "#175DFD"; // Warna biru persis dari sampel gambar asli

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: {
        duration: 0.45,
        ease: "easeInOut",
      },
    },
  };

  const catVariants = {
    hidden: { y: 35, scale: 0.9, opacity: 0 },
    visible: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 160,
        damping: 14,
      },
    },
  };

  const whiskerVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 16,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.85 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[9999] flex flex-col justify-center items-center select-none"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: blueBg,
      }}
    >
      <motion.svg
        width="360"
        height="360"
        viewBox="120 150 780 730"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={containerVariants}
        className="max-w-[85vw] max-h-[75vh]"
        style={{ overflow: "visible" }}
      >
        {/* ================= GRUP KUCING ================= */}
        <motion.g
          variants={catVariants}
          style={{ transformOrigin: "490px 450px" }}
        >
          {/* Siluet Utama Badan, Telinga, Pipi & Tangan (1:1 Coordinate Trace) */}
          <path
            d="
              M 498 317
              C 482 317 440 265 390 220
              C 358 190 328 194 316 230
              C 295 292 288 338 278 360
              C 245 415 215 478 198 532
              C 162 562 158 615 190 644
              C 215 662 248 660 264 654
              C 282 662 308 660 322 652
              C 340 662 365 654 378 630
              L 614 630
              C 626 654 650 662 668 652
              C 684 660 710 662 728 654
              C 748 660 778 662 802 642
              C 832 612 824 558 788 532
              C 775 472 745 412 710 364
              C 700 335 692 290 680 232
              C 670 194 640 192 608 220
              C 558 265 514 317 498 317 Z
            "
            fill="#FFFFFF"
          />

          {/* Garis Jari Tangan Kiri (Cutout Biru) */}
          <path
            d="M 262 658 C 266 635 262 612 254 600"
            stroke={blueBg}
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 328 654 C 330 626 322 600 312 588"
            stroke={blueBg}
            strokeWidth="22"
            strokeLinecap="round"
          />

          {/* Garis Jari Tangan Kanan (Cutout Biru) */}
          <path
            d="M 664 654 C 662 626 670 600 680 588"
            stroke={blueBg}
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 730 658 C 726 635 730 612 738 600"
            stroke={blueBg}
            strokeWidth="22"
            strokeLinecap="round"
          />

          {/* Mata Kiri + Pupil Putih */}
          <ellipse
            cx="420"
            cy="486"
            rx="54"
            ry="74"
            transform="rotate(14 420 486)"
            fill={blueBg}
          />
          <ellipse
            cx="442"
            cy="486"
            rx="21"
            ry="38"
            transform="rotate(14 442 486)"
            fill="#FFFFFF"
          />

          {/* Mata Kanan + Pupil Putih */}
          <ellipse
            cx="636"
            cy="492"
            rx="56"
            ry="74"
            transform="rotate(14 636 492)"
            fill={blueBg}
          />
          <ellipse
            cx="636"
            cy="492"
            rx="22"
            ry="40"
            transform="rotate(14 636 492)"
            fill="#FFFFFF"
          />

          {/* Hidung Segitiga Membulat */}
          <path
            d="
              M 505 538
              Q 523 534 541 538
              Q 552 541 545 552
              L 531 572
              Q 523 582 515 572
              L 501 552
              Q 494 541 505 538 Z
            "
            fill={blueBg}
          />
        </motion.g>

        {/* ================= GARIS AKSEN KANAN (SPARKS) ================= */}
        <motion.path
          variants={whiskerVariants}
          d="M 790 328 L 826 283"
          stroke="#FFFFFF"
          strokeWidth="32"
          strokeLinecap="round"
          style={{ transformOrigin: "790px 328px" }}
        />
        <motion.path
          variants={whiskerVariants}
          d="M 818 390 L 872 367"
          stroke="#FFFFFF"
          strokeWidth="32"
          strokeLinecap="round"
          style={{ transformOrigin: "818px 390px" }}
        />
        <motion.path
          variants={whiskerVariants}
          d="M 831 452 L 861 453"
          stroke="#FFFFFF"
          strokeWidth="30"
          strokeLinecap="round"
          style={{ transformOrigin: "831px 452px" }}
        />

        {/* ================= TIPOGRAFI VEKTOR "tasho" ================= */}
        <motion.g variants={letterVariants}>
          {/* Huruf 't' */}
          <path
            d="
              M 252 708
              L 251 800
              C 251 825 266 832 282 827
              M 218 752
              L 283 752
            "
            stroke="#FFFFFF"
            strokeWidth="44"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Huruf 'a' */}
          <path
            d="
              M 405 768
              C 388 742 332 746 332 792
              C 332 836 388 838 407 808
              M 410 752
              L 412 826
            "
            stroke="#FFFFFF"
            strokeWidth="42"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Huruf 's' */}
          <path
            d="
              M 510 755
              C 492 742 456 746 458 769
              C 460 792 516 786 516 814
              C 516 838 472 838 454 822
            "
            stroke="#FFFFFF"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Huruf 'h' */}
          <path
            d="
              M 568 696
              L 562 826
              M 565 776
              C 582 748 634 750 632 786
              L 630 826
            "
            stroke="#FFFFFF"
            strokeWidth="44"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Huruf 'o' */}
          <ellipse
            cx="726"
            cy="792"
            rx="34"
            ry="32"
            stroke="#FFFFFF"
            strokeWidth="42"
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

export default TashoLoadingScreen;
