export default function DateDivider({ date }: { date: string }) {
  return (
    <div className="mb-5 flex justify-center">
      <span className="px-2 py-0.5 text-xs font-medium text-white rounded-lg bg-(--color-violet-dark-opacity)">
        {date}
      </span>
    </div>
  );
}
