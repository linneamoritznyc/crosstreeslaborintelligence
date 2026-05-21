"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main>
      <h1>Kunde inte hämta data</h1>
      <p>
        Något gick fel vid anslutning till systemet. Kontrollera att API:et
        är igång och försök igen.
      </p>
      <p>
        <small>{error.message}</small>
      </p>
      <button onClick={reset}>Försök igen</button>
    </main>
  );
}
