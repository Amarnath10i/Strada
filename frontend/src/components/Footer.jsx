export default function Footer() {
  return (
    <footer style={{ borderTop: "1.5px solid var(--ink)", marginTop: "auto" }}>
      <div className="container" style={{
        padding: "28px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <span className="mono" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          STRADA &mdash; CARS &amp; BIKES, BY THE DAY
        </span>
        <span className="mono" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          THREE YARDS &middot; DOWNTOWN / UPTOWN / AIRPORT
        </span>
      </div>
    </footer>
  );
}
