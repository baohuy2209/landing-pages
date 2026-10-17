export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeContent: "center",
        padding: 30,
        textAlign: "center",
      }}
    >
      <p>404 / A SMALL DETOUR</p>
      <h1 style={{ fontSize: 48, margin: "25px 0" }}>A little lost?</h1>
      <a href="/" style={{ textDecoration: "underline", padding: 20 }}>
        Back to the studio
      </a>
    </main>
  );
}
