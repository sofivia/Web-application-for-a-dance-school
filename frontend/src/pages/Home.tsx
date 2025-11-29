// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Witaj w Szkole Tańca!</h1>

      <p style={{ marginTop: "15px", fontSize: "18px" }}>
        Przeglądaj zajęcia, zapisuj się na lekcje i zarządzaj swoim kontem.
      </p>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/login"
          style={{
            padding: "10px 20px",
            border: "1px solid black",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          Przejdź do logowania
        </Link>
      </div>
    </div>
  );
}
