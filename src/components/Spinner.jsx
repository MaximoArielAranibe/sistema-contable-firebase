// components/Spinner.js
import React from "react";
import { Circles } from "react-loader-spinner";

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
      <Circles
        height="40"
        width="40"
        color="#4fa94d"
        ariaLabel="cargando..."
      />
    </div>
  );
}

export default Spinner;
