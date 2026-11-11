import Helpdesk from "@/components/Helpdesk";

export default async function HelpdeskPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuestion = typeof q === "string" ? q.slice(0, 500) : undefined;
  return <Helpdesk initialQuestion={initialQuestion} />;
}
