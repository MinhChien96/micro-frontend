import { Card, PageSpinner, StatusBadge } from '@app/shared/ui';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAccount, fetchTransactionPage } from '../api/accounts';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(d),
  );

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'credit', label: 'Tiền vào' },
  { key: 'debit', label: 'Tiền ra' },
];

// memo để tránh re-render khi virtualizer scroll
const TransactionRow = memo(function TransactionRow({ tx }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: tx.type === 'credit' ? '#dcfce7' : '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {tx.type === 'credit' ? '↓' : '↑'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{tx.desc}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{fmtDate(tx.date)}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: tx.type === 'credit' ? '#16a34a' : '#dc2626',
            }}
          >
            {tx.type === 'credit' ? '+' : ''}
            {fmt(tx.amount)}
          </div>
          <StatusBadge
            label={tx.type === 'credit' ? 'Vào' : 'Ra'}
            color={tx.type === 'credit' ? 'green' : 'red'}
          />
        </div>
      </div>
    </Card>
  );
});

export default function TransactionList() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── useInfiniteQuery: load trang theo trang, không load hết 1 lúc ──
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['transactions', id],
    queryFn: ({ pageParam }) => fetchTransactionPage({ accountId: id, pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { data: account } = useQuery({
    queryKey: ['account', id],
    queryFn: () => fetchAccount(id),
  });

  // Gộp tất cả items đã load từ nhiều trang
  const allTxns = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  // ── useTransition: filter switch không block UI ──
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState('all');

  const handleFilter = useCallback((key) => {
    startTransition(() => setFilter(key));
  }, []);

  // ── useDeferredValue: search text — UI input đáp ứng ngay, filter chạy sau ──
  const [searchText, setSearchText] = useState('');
  const deferredSearch = useDeferredValue(searchText);
  const isSearchStale = searchText !== deferredSearch;

  // Summary stats (tính trên toàn bộ đã load)
  const totalIn = useMemo(
    () => allTxns.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
    [allTxns],
  );
  const totalOut = useMemo(
    () => allTxns.filter((t) => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0),
    [allTxns],
  );

  // Filter + search dùng deferredSearch để không block input
  const filtered = useMemo(() => {
    let list = filter === 'all' ? allTxns : allTxns.filter((t) => t.type === filter);
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      list = list.filter((t) => t.desc.toLowerCase().includes(q));
    }
    return list;
  }, [allTxns, filter, deferredSearch]);

  // ── Virtual scrolling: chỉ render rows đang visible trong viewport ──
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5, // render thêm 5 rows ngoài viewport để scroll mượt
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading) return <PageSpinner label="Đang tải lịch sử..." />;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: 6,
          fontSize: 12,
          color: '#94a3b8',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        MFE-ACCOUNTS TEAM
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          padding: '6px 14px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          background: '#fff',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        ← Chi tiết tài khoản
      </button>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, color: '#0f172a' }}>Lịch sử giao dịch</h2>
        {account && (
          <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
            {account.number}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Tổng tiền vào</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#16a34a' }}>+{fmt(totalIn)}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Tổng tiền ra</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#dc2626' }}>-{fmt(totalOut)}</div>
        </Card>
      </div>

      {/* Filter buttons — useTransition: isPending cho thấy React đang xử lý transition */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilter(f.key)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              background: filter === f.key ? '#1e3a5f' : '#f1f5f9',
              color: filter === f.key ? '#fff' : '#64748b',
              fontWeight: filter === f.key ? 600 : 400,
              opacity: isPending ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
          {allTxns.length}/{total} giao dịch
        </span>
      </div>

      {/* Search input — useDeferredValue: input cập nhật ngay, filter chạy sau */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <input
          type="text"
          placeholder="Tìm kiếm giao dịch..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 32px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13,
            boxSizing: 'border-box',
            opacity: isSearchStale ? 0.7 : 1,
            transition: 'opacity 0.1s',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          🔍
        </span>
        {isSearchStale && (
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 11,
              color: '#94a3b8',
            }}
          >
            đang lọc...
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
        Hiển thị {filtered.length} kết quả
        {deferredSearch && ` · tìm "${deferredSearch}"`}
      </div>

      {/* Virtual scroll container — chỉ render visible rows */}
      <div
        ref={parentRef}
        style={{ height: 480, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            Không có giao dịch nào
          </div>
        ) : (
          /* Container cao bằng tổng chiều cao của tất cả rows (kể cả chưa render) */
          <div
            style={{ height: virtualizer.getTotalSize(), position: 'relative', padding: '8px 8px' }}
          >
            {virtualItems.map((vItem) => (
              <div
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 8,
                  right: 8,
                  transform: `translateY(${vItem.start}px)`,
                  paddingBottom: 8,
                }}
              >
                <TransactionRow tx={filtered[vItem.index]} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load more — useInfiniteQuery: tải trang tiếp theo khi cần */}
      {hasNextPage && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              padding: '10px 28px',
              borderRadius: 8,
              border: 'none',
              cursor: isFetchingNextPage ? 'default' : 'pointer',
              background: '#1e3a5f',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              opacity: isFetchingNextPage ? 0.6 : 1,
            }}
          >
            {isFetchingNextPage ? 'Đang tải...' : `Tải thêm (còn ${total - allTxns.length})`}
          </button>
        </div>
      )}

      {!hasNextPage && allTxns.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Đã hiển thị tất cả {total} giao dịch
        </div>
      )}
    </div>
  );
}
