import { apiClient } from "@/lib/api-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobbDetaljPage({ params }: Props) {
  const { id } = await params;
  const jobb = await apiClient<{ title: string; description: string; employer: string }>(
    `/jobs/${id}`
  );

  return (
    <main>
      <h1>{jobb.title}</h1>
      <p>{jobb.employer}</p>
      <section>
        <h2>Beskrivning</h2>
        <p>{jobb.description}</p>
      </section>
    </main>
  );
}
