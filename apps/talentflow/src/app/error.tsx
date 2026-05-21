"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main>
      <h1>Något gick fel</h1>
      <p>Vi kunde inte hämta din data just nu. Försök igen eller ladda upp ditt CV på nytt.</p>
      <p>
        <small>{error.message}</small>
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <button onClick={reset}>Försök igen</button>
        <Link href="/" style={{ alignSelf: "center" }}>
          Tillbaka till start
        </Link>
      </div>
    </main>
  );
}
