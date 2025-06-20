// WhyJunoBox.jsx
import classes from "./whyJunoBox.module.css";
export default function WhyJunoBox({ item }) {
  return (
    <div className={classes.container}>
      <p className={classes.rectangle}>{item.img}</p>
      <h2>{item.header}</h2>
      <p className={classes.description}>{item.subHeader}</p>
    </div>
  );
}
