// shimmer: gradient + animate-shimmer (keyframe khai báo trong theme.css)
const shimmer =
  'animate-shimmer rounded-md bg-[length:200%_100%] bg-[linear-gradient(90deg,#f1f5f9_25%,#e2e8f0_50%,#f1f5f9_75%)]';

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#f1f5f9] p-4">
      <div className="flex items-center gap-3.5">
        <div className={`${shimmer} h-12 w-12 shrink-0 rounded-xl`} />
        <div className="flex-1">
          <div className={`${shimmer} mb-2 h-3.5 w-3/5`} />
          <div className={`${shimmer} h-[11px] w-2/5`} />
        </div>
        <div className={`${shimmer} h-[18px] w-20`} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="rounded-lg border border-[#f1f5f9] px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className={`${shimmer} h-9 w-9 shrink-0 rounded-[10px]`} />
        <div className="flex-1">
          <div className={`${shimmer} mb-1.5 h-[13px] w-[55%]`} />
          <div className={`${shimmer} h-[11px] w-[30%]`} />
        </div>
        <div className={`${shimmer} h-[15px] w-[70px]`} />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton tĩnh, không reorder
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
