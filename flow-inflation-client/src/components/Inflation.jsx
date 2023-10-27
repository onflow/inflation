import React, { useState, useEffect, useCallback } from "react";
import Mint from "./Mint";
import Button from "./Button";
import Alert from "./Alert";

const BalloonGame = () => {
  const [inflation, setInflation] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [popThreshold, setPopThreshold] = useState(Math.random() * 50 + 50);
  const [inflateInterval, setInflateInterval] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const stopInflating = useCallback(() => {
    if (inflateInterval) {
      clearInterval(inflateInterval);
      setInflateInterval(null);
    }
  }, [inflateInterval]);

  const restartGame = useCallback(() => {
    stopInflating();

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    setInflation(0);
    setIsGameOver(false);
    setTimer(30);
    setPopThreshold(Math.random() * 50 + 50);
    setHasStarted(false);
  }, [stopInflating, timerInterval]);

  const startInflating = () => {
    if (isGameOver) {
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);

      let timerInt = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      setTimerInterval(timerInt);
    }

    if (!inflateInterval) {
      const inflationInt = setInterval(() => {
        setInflation((prevInflation) => prevInflation + 1);
      }, 100);
      setInflateInterval(inflationInt);
    }
  };

  useEffect(() => {
    if (timer <= 0) {
      setIsGameOver(true);
    }
  }, [timer]);

  useEffect(() => {
    if (inflation >= popThreshold) {
      setIsGameOver(true);
      stopInflating();
    }
  }, [inflation, popThreshold, stopInflating]);

  const getBalloonColor = (inflation, threshold, alpha) => {
    const percentageInflated = inflation / threshold;

    const red = [220, 20, 60];
    const bronze = [128, 0, 0];
    const violet = [138, 43, 226];
    const gold = [218, 165, 32];

    let color;

    if (percentageInflated < 0.25) {
      color = red;
    } else if (percentageInflated < 0.5) {
      color = bronze;
    } else if (percentageInflated < 0.75) {
      color = violet;
    } else {
      color = gold;
    }

    return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
  };

  const balloonStyle = isGameOver
    ? { display: "none" }
    : {
        margin: "10px auto",
        position: "relative",
        transformOrigin: "50% 300%",
        width: `${12 + inflation / 10}rem`,
        animation: "anim 5s ease-in-out 1s infinite alternate",
        cursor: "pointer",
      };

  const ballStyle = {
    height: `${16 + inflation / 10}rem`,
    width: "100%",
    background: getBalloonColor(inflation, popThreshold, 0.8),
    borderRadius: "80%",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #555",
    boxShadow: "2px 2px 50px #aaa",
  };

  const ballBeforeStyle = {
    height: `${16 + inflation / 10}rem`,
    width: `${12 + inflation / 10}rem`,
    background: getBalloonColor(inflation, popThreshold, 0.8),
    borderRadius: "80%",
    position: "absolute",
    top: "-1rem",
    left: "-1rem",
    opacity: "0.4",
  };

  const stickStyle = {
    width: ".1rem",
    height: "100%",
    background: "rgba(50,50,50, .8)",
    position: "absolute",
    top: `${16 + inflation / 10}rem`,
    left: `${6 + inflation / 20}rem`,
  };

  if (isMinting) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Mint
          rgbColor={getBalloonColor(inflation, popThreshold, 0.8)}
          inflation={inflation}
          onReset={() => {
            restartGame();
            setIsMinting(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <Alert
        title="Instructions"
        message={
          <>
            1. Tap balloon to start game.
            <br />
            <br />
            2. Press-and-hold (long press) to inflate your balloon and increase
            score.
            <br />
            <br />
            3. Tap 'End and Mint' to mint balloon to your collection before time
            runs out or balloon pops!
          </>
        }
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
        visible={alertVisible}
      />

      <h2>Time Left: {timer > 0 ? timer : 0}</h2>
      <h2>Inflation Level: {inflation}</h2>
      {/*<h2>Pop Threshold: {Math.round(popThreshold)}</h2>*/}
      <div>
        {!isGameOver && (
          <Button disabled={!hasStarted} label="End and Mint" onClick={() => setIsMinting(true)} />
        )}
      </div>
      <div id="balloonContainer" style={balloonStyle}>
        <div
          style={ballStyle}
          onMouseDown={startInflating}
          onMouseUp={stopInflating}
          onMouseLeave={stopInflating}
          onTouchStart={(e) => {
            e.preventDefault();
            startInflating();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopInflating();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            stopInflating();
          }}
        >
          <div style={ballBeforeStyle}></div>
        </div>
        <div style={stickStyle}></div>
      </div>
      {isGameOver && (
        <>
          <h2>Game Over! Balloon popped or times up!</h2>
          <Button label="Restart Game" onClick={restartGame} />
        </>
      )}
    </div>
  );
};

export default BalloonGame;
