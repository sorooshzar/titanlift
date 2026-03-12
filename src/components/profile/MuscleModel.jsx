import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FRONT_BODY_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/6af09a181_FrontBodyModel.png";
const BACK_BODY_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/7bb9c1029_BackBodyModel.png";

const RANK_ORDER = ["wood", "bronze", "silver", "gold", "platinum", "diamond", "champion", "titan", "olympian"];
const RANK_COLORS = ["#8B5E3C", "#CD7F32", "#9B9BB0", "#FFD700", "#E5E4E2", "#4DD8FF", "#9B59B6", "#E74C3C", "#FF6B35"];
const RECOVERY_ORDER = ["light", "moderate", "heavy", "sore"];
const RECOVERY_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

const GROUP_TO_MUSCLE = {
  "Upper Chest": "chest",
  "Mid/Low Chest": "chest",
  "Abs": "abs",
  "Obliques": "abs",
  "Front Delts": "shoulders",
  "Side Delts": "shoulders",
  "Biceps": "biceps",
  "Wrist Flexors": "forearms",
  "Brachioradialis": "forearms",
  "Quads": "quads",
  "Adductors": "quads",
  "Abductors": "quads",
  "Calves": "calves",
  "Neck": null,
  "Traps": "traps",
  "Mid Back": "back",
  "Lats": "lats",
  "Rear Delts": "shoulders",
  "Erectors": "back",
  "Triceps": "triceps",
  "Glutes": "glutes",
  "Hamstrings": "hamstrings",
};

const MUSCLE_LABELS = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", quads: "Quads", calves: "Calves",
  traps: "Traps", lats: "Lats", back: "Back", glutes: "Glutes", hamstrings: "Hamstrings",
};

// Front SVG path data (viewBox: 0 0 538 1164)
const FRONT_GROUPS = {
  "Upper Chest": [
    "M229.669 82.4543C158.069 52.8544 100.169 124.121 80.169 163.454C152.169 153.454 220.836 175.288 246.169 187.454C261.169 194.658 264.169 187.454 264.169 175.954C264.169 150.449 270.669 99.4041 229.669 82.4543Z",
    "M306.546 82.4647C378.146 52.8647 436.046 124.131 456.046 163.465C384.046 153.465 315.379 175.298 290.046 187.465C275.046 194.669 272.046 187.465 272.046 175.965C272.046 150.46 265.546 99.4144 306.546 82.4647Z",
  ],
  "Mid/Low Chest": [
    "M254.669 195.954C191.469 164.354 124.002 162.788 98.169 165.954C122.169 173.954 141.644 205.454 148.169 219.954C157.169 239.954 182.434 268.304 186.169 259.954C203.169 221.954 217.169 216.454 244.169 210.454C271.169 204.454 261.169 199.204 254.669 195.954Z",
    "M281.982 195.589C345.182 163.989 412.649 162.422 438.482 165.589C414.482 173.589 395.007 205.089 388.482 219.589C379.482 239.589 354.217 267.938 350.482 259.589C333.482 221.589 319.482 216.089 292.482 210.089C265.482 204.089 275.482 198.839 281.982 195.589Z",
  ],
  "Abs": [
    "M254.669 213.455C186.269 221.855 192.836 264.955 204.669 285.455C212.169 280.454 216.669 270.454 254.669 268.455C264.669 267.929 264.669 268.455 264.669 241.455C264.669 222.396 267.669 211.859 254.669 213.455Z",
    "M281.968 213.613C350.368 222.013 343.802 265.113 331.968 285.613C324.468 280.612 319.968 270.612 281.968 268.613C271.968 268.087 271.968 268.613 271.968 241.613C271.968 222.554 268.968 212.016 281.968 213.613Z",
    "M264.671 279.454C264.671 325.954 271.169 322.454 235.671 322.454C204.169 322.454 208.671 326.954 208.671 289.954C208.671 281.454 264.671 263.454 264.671 279.454Z",
    "M272.136 278.857C272.136 325.357 265.638 321.857 301.136 321.857C332.638 321.857 328.136 326.357 328.136 289.357C328.136 280.857 272.136 262.857 272.136 278.857Z",
    "M212.169 345.454C216.151 366.954 228.669 371.558 238.169 372.454C264.669 374.954 264.669 377.454 264.669 352.954C264.669 322.454 268.169 327.454 238.169 327.454C207.169 327.454 208.558 325.954 212.169 345.454Z",
    "M324.294 345.759C320.313 367.259 307.794 371.863 298.294 372.759C271.794 375.259 271.794 377.759 271.794 353.259C271.794 322.759 268.294 327.759 298.294 327.759C329.294 327.759 327.905 326.259 324.294 345.759Z",
    "M249.669 422.954C231.169 422.954 221.55 412.954 218.669 386.454C216.495 366.454 215.669 375.881 237.169 377.454C264.669 379.467 264.669 380.454 264.669 392.954C264.669 426.454 268.169 422.954 249.669 422.954Z",
    "M286.933 423.545C305.433 423.545 315.052 413.545 317.933 387.045C320.107 367.045 320.933 376.472 299.433 378.045C271.933 380.057 271.933 381.045 271.933 393.545C271.933 427.045 268.433 423.545 286.933 423.545Z",
    "M230.669 435.454C226.983 422.052 233.169 425.454 256.669 429.454C265.669 430.987 262.911 429.253 263.169 447.954C263.651 482.954 266.669 496.038 256.669 498.954C246.669 501.871 236.169 455.454 230.669 435.454Z",
    "M304.969 436.018C308.655 422.615 302.469 426.017 278.969 430.018C269.969 431.55 272.727 429.816 272.469 448.517C271.987 483.517 268.969 496.601 278.969 499.517C288.969 502.434 299.469 456.017 304.969 436.018Z",
  ],
  "Obliques": [
    "M187.669 273.454C166.169 262.9 154.169 244.454 141.169 222.454C141.169 255.954 144.169 273.454 166.169 316.954C156.169 408.454 150.169 371.954 198.669 444.954C255.669 525.954 236.183 487.954 217.169 419.954C187.669 314.454 202.669 280.818 187.669 273.454Z",
    "M348.426 273.454C369.926 262.9 381.926 244.454 394.926 222.454C394.926 255.954 391.926 273.454 369.926 316.954C379.926 408.454 385.926 371.954 337.426 444.954C280.426 525.954 299.911 487.954 318.926 419.954C348.426 314.454 333.426 280.818 348.426 273.454Z",
  ],
  "Front Delts": [
    "M162.669 77.9544C203.169 63.7586 165.169 61.4544 140.669 55.4544C124.669 52.9543 74.7123 91.4543 69.1691 133.454C64.0218 172.454 71.5922 168.954 78.1691 159.454C82.6691 152.954 112.669 95.4802 162.669 77.9544Z",
    "M374.45 78.0698C333.95 63.8739 371.95 61.5698 396.45 55.5698C412.45 53.0696 462.407 91.5696 467.95 133.57C473.097 172.57 465.527 169.07 458.95 159.57C454.45 153.07 424.45 95.5956 374.45 78.0698Z",
  ],
  "Side Delts": [
    "M124.669 49.9542C68.169 53.0927 61.169 103.454 64.669 136.954C73.669 95.9543 99.169 68.1538 124.669 57.9542C134.669 53.9543 140.669 49.0654 124.669 49.9542Z",
    "M413.546 49.5601C470.046 52.6986 477.046 103.06 473.546 136.56C464.546 95.5603 439.046 67.7598 413.546 57.5601C403.546 53.5603 397.546 48.6714 413.546 49.5601Z",
  ],
};

// Back SVG path data (viewBox: 0 0 534 1058)
const BACK_GROUPS = {
  "Traps": [
    "M148.736 57C200.736 57 224.069 19.1667 229.235 0.5H264.235V260.5C210.236 125 172.736 85.5 148.736 57Z",
    "M388.235 56.5C336.235 56.5 312.402 19.1667 307.236 0.5H272.236V260.5C326.235 125 364.235 85 388.235 56.5Z",
  ],
  "Mid Back": [
    "M139.736 158.5L115.236 167C152.236 219.5 220.736 207 215.736 203C197.236 200 163.736 167 139.736 158.5Z",
    "M163.736 150.5C159.736 150.9 148.736 154.5 144.736 157C164.736 171.167 163.736 166.5 192.736 187.5C182.736 174.5 165.736 150.3 163.736 150.5Z",
    "M196.736 133.5C193.736 136.5 182.236 145 168.236 148.5C173.736 157 186.494 175.115 203.236 192.5C218.236 205.5 231.736 200.5 223.736 183C215.736 165.5 199.136 131.1 196.736 133.5Z",
    "M395.426 158.82L418.426 165.82C386.236 217 313.236 207 317.736 203.32C340.235 201 364.236 174.5 395.426 158.82Z",
    "M372.735 151.119C376.735 151.519 387.735 155.119 391.735 157.619C371.735 171.786 356.736 179.5 340.235 189.5C350.235 176.5 370.735 150.919 372.735 151.119Z",
    "M340.235 132.619C343.235 135.619 354.236 145.5 368.236 149C362.736 157.5 348.592 174.234 331.851 191.619C315.236 206 304.037 198.119 311.351 182.119C319.351 164.619 337.835 130.219 340.235 132.619Z",
  ],
  "Lats": [
    "M111.236 169.5C107.902 170.667 101.836 173.8 104.236 177C111.236 192 138.13 220.94 141.736 233.5C171.736 338 180.236 347.859 216.236 331C235.736 321.868 265.211 273 263.736 269.5C224.736 177 236.736 204.474 224.736 207C158.236 221 124.902 189 111.236 169.5Z",
    "M421.736 169C425.069 170.167 437.636 173.8 435.236 177C426.736 191.5 390.912 232.461 387.236 245C367.736 311.5 369.236 356 318.789 331C299.496 321.439 269.76 274 271.236 270.5C310.236 178 297.058 204.604 311.736 207C385.236 219 404.236 188 421.736 169Z",
  ],
  "Rear Delts": [
    "M165.236 144C201.236 128.317 199.236 129.5 168.736 89C144.016 56.1759 147.981 54.9999 134.236 67.9998C82.6356 116.8 72.5689 159.833 74.2356 175C85.5689 168.333 123.087 162.361 165.236 144Z",
    "M370.926 144.223C338.562 128.746 334.772 130 367.426 89.2236C396.034 53.5 385.92 55.4884 401.926 68.2235C441.236 99.5 458.236 142.5 460.236 174.5C448.902 167.833 411.236 163.5 370.926 144.223Z",
  ],
  "Side Delts": [
    "M141.236 57.5C122.236 55 39.2355 67.4999 70.2356 170C80.7356 113.5 109.236 88 141.236 57.5Z",
    "M394.736 57C435.235 50.9999 489.236 81 464.236 170C451.736 103 419.235 76 394.736 57Z",
  ],
  "Triceps": [
    "M99.7356 171.5C35.3356 183.1 33.9022 256.5 41.7356 293C46.7356 302.5 56.2356 249 77.7356 246.5C79.7356 246.267 77.7356 227.5 99.7356 171.5Z",
    "M441.235 174C496.735 175.5 501.569 257 493.736 293.5C488.736 303 480.236 251.5 459.736 246C456.332 245.087 459.736 221.5 441.235 174Z",
    "M132.158 223C132.158 220 111.236 192.667 101.236 179.5C92.2355 199.167 81.7355 238.5 81.7355 247.5C89.2355 256.5 99.2355 289.969 99.2355 294C99.2355 305.5 103.672 306.5 105.658 303C126.658 266 132.158 230 132.158 223Z",
    "M400.736 230C399.09 227.492 428.736 191.167 438.736 178C447.736 197.667 455.736 232 455.736 246C448.236 255 437.236 283.969 437.236 288C437.236 299.5 433.481 310.34 431.236 307C410.736 276.5 412.876 248.5 400.736 230Z",
  ],
  "Brachioradialis": [
    "M0.735558 431C22.8606 401.5 -9.26444 346 44.2356 298C44.2356 335 54.1199 389.76 42.2356 416.5C30.2356 443.5 26.2356 446 0.735558 431Z",
    "M532.736 426.5C510.611 397 545.236 341.5 491.236 298C489.236 334 481.851 395.76 493.736 422.5C501.736 440.5 506.236 453 532.736 426.5Z",
  ],
  "Wrist Flexors": [
    "M52.2356 389C47.7356 334.5 94.2356 311.5 103.736 302C111.736 379 71.7356 413 61.7356 425.5C43.2356 445.5 43.2356 447 32.2356 443.5C32.2356 439 54.1759 412.5 52.2356 389Z",
    "M483.236 391C481.239 333.5 456.236 328.5 429.736 303.5C419.236 368 464.008 419 471.736 426.5C488.736 443 487.736 446.5 498.736 443C498.736 438.5 484.537 428.477 483.236 391Z",
  ],
  "Erectors": [
    "M272.236 499V281C306.636 340.2 329.702 341.5 338.736 341.5C354.236 341.5 359.413 334 351.736 360C334.136 419.6 291.402 477.5 272.236 499Z",
    "M185.745 360.5C203.316 420 243.569 478.5 262.736 500V281C227.226 338 208.736 342 198.745 342C183.245 342 176.148 328 185.745 360.5Z",
  ],
  "Glutes": [
    "M282.236 515.501C267.036 518.301 274.236 506.001 279.736 499.501C292.736 482.168 322.236 441.201 336.236 416.001C357.069 378.5 400.236 412 414.236 485.001C423.736 558.5 307.736 555.5 282.236 515.501Z",
    "M250.736 516C272.736 516 262.077 506.5 255.287 499.494C241.236 484.994 212.787 441.194 198.787 415.993C177.68 378 135.236 413 120.787 484.994C112.736 554 222.236 559.5 250.736 516Z",
  ],
};

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");
  const [clickedMuscle, setClickedMuscle] = useState(null);
  const navigate = useNavigate();

  const getMuscleColor = (groupId) => {
    const appMuscle = GROUP_TO_MUSCLE[groupId];
    if (!appMuscle) return null;
    if (showRecovery) {
      const idx = RECOVERY_ORDER.indexOf(recoveryData[appMuscle]);
      return idx >= 0 ? RECOVERY_COLORS[idx] : null;
    }
    const idx = RANK_ORDER.indexOf(muscleRanks[appMuscle]);
    return idx >= 0 ? RANK_COLORS[idx] : null;
  };

  const handleMuscleClick = (groupId) => {
    const appMuscle = GROUP_TO_MUSCLE[groupId];
    if (appMuscle) setClickedMuscle(appMuscle);
  };

  const renderGroups = (groups) =>
    Object.entries(groups).map(([id, paths]) => {
      const color = getMuscleColor(id);
      const isClickable = !!GROUP_TO_MUSCLE[id];
      return (
        <g
          key={id}
          fill={color || "transparent"}
          fillOpacity={color ? 0.65 : 0}
          stroke={color ? "rgba(255,255,255,0.5)" : "transparent"}
          strokeWidth="0.8"
          onClick={() => handleMuscleClick(id)}
          style={{ cursor: isClickable ? "pointer" : "default" }}
        >
          {paths.map((d, i) => <path key={i} d={d} />)}
        </g>
      );
    });

  // Front: 538x1164, Back: 534x1058
  const containerW = 220;
  const containerH = view === "front"
    ? Math.round(containerW * 1164 / 538)
    : Math.round(containerW * 1058 / 534);

  return (
    <div className="relative">
      {/* View toggle */}
      <div className="flex justify-center gap-2 mb-3">
        {["front", "back"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
              view === v ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}>
            {v}
          </button>
        ))}
      </div>

      {/* Body model + SVG overlay */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === "front" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === "front" ? 20 : -20 }}
            transition={{ duration: 0.15 }}
            onTouchStart={(e) => { e.currentTarget._sx = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const diff = e.changedTouches[0].clientX - (e.currentTarget._sx || 0);
              if (Math.abs(diff) > 40) setView(diff > 0 ? "front" : "back");
            }}
            style={{ position: "relative", width: `${containerW}px`, height: `${containerH}px` }}
          >
            {/* PNG body model base */}
            <img
              src={view === "front" ? FRONT_BODY_URL : BACK_BODY_URL}
              alt="body model"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />

            {/* SVG muscle map overlay */}
            {view === "front" ? (
              <svg
                viewBox="0 0 538 1164"
                preserveAspectRatio="xMidYMid meet"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              >
                {renderGroups(FRONT_GROUPS)}
              </svg>
            ) : (
              <svg
                viewBox="0 0 534 1058"
                preserveAspectRatio="xMidYMid meet"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              >
                {renderGroups(BACK_GROUPS)}
              </svg>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-1">Tap muscle to find exercises · Swipe to flip</p>

      {/* Muscle click popup */}
      <AnimatePresence>
        {clickedMuscle && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setClickedMuscle(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-2xl p-5 shadow-2xl w-64 text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">Muscle selected</p>
              <p className="text-lg font-bold mb-4">{MUSCLE_LABELS[clickedMuscle]}</p>
              <button
                onClick={() => { navigate(createPageUrl(`Lifts?tab=exercises&muscle=${clickedMuscle}`)); setClickedMuscle(null); }}
                className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                Find exercises for {MUSCLE_LABELS[clickedMuscle]}
              </button>
              <button onClick={() => setClickedMuscle(null)}
                className="w-full mt-2 text-xs text-muted-foreground py-1.5">Cancel</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}