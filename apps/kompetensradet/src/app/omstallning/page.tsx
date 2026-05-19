import OmstallningsPanel from "@/components/OmstallningsPanel";

export const dynamic = "force-dynamic";

export default function OmstallningPage() {
  return (
    <main>
      <h1>Omställningsstöd</h1>
      <p>Identifiera yrken med hög substituerbarhet och planera omställningsinsatser.</p>
      <OmstallningsPanel />
    </main>
  );
}
