import Helpdesk from "@/components/Helpdesk";

type Params = Promise<{ q?: string | string[]; c?: string | string[] }>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function HelpdeskPage({ searchParams }: { searchParams: Params }) {
  const { q, c } = await searchParams;
  const initialQuestion = typeof q === "string" ? q.slice(0, 500) : undefined;
  const conversationId = typeof c === "string" && UUID.test(c) ? c : undefined;
  return <Helpdesk initialQuestion={initialQuestion} conversationId={conversationId} />;
}
