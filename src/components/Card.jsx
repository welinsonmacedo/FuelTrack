export default function Card({ title, icon, children }) {
  return (
    <div style={styles.card}>
      {icon && <div style={styles.icon}>{icon}</div>}
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  icon: {
    fontSize: "24px",
    marginBottom: "10px",
  },
};
