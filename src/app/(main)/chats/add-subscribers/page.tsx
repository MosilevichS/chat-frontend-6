import AddSubscribersPage from "@/src/components/ui/chat/AddSubscribersPage";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <AddSubscribersPage searchParams={searchParams} />;
}
