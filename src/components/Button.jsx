import React from "react";
import styles from "./buttonStyles.module.css";

const Button = ({ text, fn }) => {
  return (
    <div className={styles.btn} onClick={fn}>
      {text}
    </div>
  );
};

export default Button;
