export default function BalloonNFTView({ rgbColor, inflation }) {
    const balloonStyle = {
      margin: "10px auto",
      position: "relative",
      transformOrigin: "50% 300%",
      width: `${12 + inflation / 10}rem`,
      animation: "anim 5s ease-in-out 1s infinite alternate",
    };
  
    const ballStyle = {
      height: `${16 + inflation / 10}rem`,
      width: "100%",
      background: rgbColor,
      borderRadius: "80%",
      position: "relative",
      overflow: "hidden",
      border: "1px solid #555",
      boxShadow: "2px 2px 50px #aaa",
    };
  
    const ballBeforeStyle = {
      height: `${16 + inflation / 10}rem`,
      width: `${12 + inflation / 10}rem`,
      background: rgbColor,
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
  
    return (
      <div id="balloonNFTContainer" style={balloonStyle}>
        <div style={ballStyle}>
          <div style={ballBeforeStyle}></div>
        </div>
        <div style={stickStyle}></div>
      </div>
    );
  }
  