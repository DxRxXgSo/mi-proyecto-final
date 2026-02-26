import { Link } from "react-router-dom";

const ErrorPage = ({ type = "404" }) => {
  const is404 = type === "404";

  const content = {
    title: is404 ? "Página no encontrada" : "Error interno del servidor",
    message: is404
      ? "La página que buscas no existe o fue movida."
      : "Ocurrió un problema en el servidor. Intenta más tarde.",
    code: is404 ? "404" : "500",
    color: is404 ? "#b39ddb" : "#ffab91"
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, borderTop: `6px solid ${content.color}` }}>
        <h1 style={{ ...styles.code, color: content.color }}>
          {content.code}
        </h1>

        <h2 style={styles.title}>{content.title}</h2>

        <p style={styles.text}>{content.message}</p>

        <Link to="/" style={styles.button}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f6f0ff, #e8f4ff)",
    padding: "1rem"
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "3rem 2.5rem",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    maxWidth: "420px",
    width: "100%"
  },
  code: {
    fontSize: "5rem",
    margin: "0"
  },
  title: {
    fontSize: "1.5rem",
    margin: "0.5rem 0",
    color: "#5c6bc0"
  },
  text: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "2rem"
  },
  button: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f8bbd0",
    color: "#4a4a4a",
    borderRadius: "30px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  }
};

export default ErrorPage;