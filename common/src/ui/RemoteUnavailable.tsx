interface RemoteUnavailableProps {
  /** id remote/expose để dev nhìn ra ngay màn nào chết, vd "mfe_accounts/AccountsApp" */
  remote?: string;
  onRetry?: () => void;
}

/**
 * Fallback chuẩn khi một remote không tải được (remote chưa chạy, manifest
 * chết, chunk 404 sau deploy...). Shell vẫn sống — chỉ màn này bị thay thế.
 */
export function RemoteUnavailable({ remote, onRetry }: RemoteUnavailableProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-bg-card p-10 text-center">
      <p className="m-0 text-3xl">🔌</p>
      <p className="mt-3 mb-1 font-bold text-text-main">Tính năng tạm thời không khả dụng</p>
      <p className="m-0 text-[13px] text-text-muted">
        {remote ? (
          <>
            Remote <code>{remote}</code> không phản hồi. Vui lòng thử lại sau.
          </>
        ) : (
          'Vui lòng thử lại sau.'
        )}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 cursor-pointer rounded-lg border border-border bg-transparent px-4 py-1.5 text-[13px] text-text-main"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
