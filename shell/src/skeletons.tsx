import { SkeletonCard, SkeletonList } from '@app/shared/ui';

interface BarProps {
  w?: number | string;
  h?: number;
  mb?: number;
  opacity?: number;
}

const Bar = ({ w = '60%', h = 14, mb = 0, opacity = 1 }: BarProps) => (
  <div
    style={{
      height: h,
      width: w,
      borderRadius: 6,
      marginBottom: mb,
      background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'vb-shimmer 1.5s infinite',
      opacity,
    }}
  />
);

export function TransferSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div
        style={{ height: 12, width: 120, borderRadius: 6, background: '#e2e8f0', marginBottom: 20 }}
      />
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: 12,
            width: '40%',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.2)',
            marginBottom: 10,
          }}
        />
        <div
          style={{
            height: 16,
            width: '55%',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.25)',
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 12,
            width: '35%',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.15)',
            marginBottom: 14,
          }}
        />
        <div
          style={{ height: 28, width: '50%', borderRadius: 6, background: 'rgba(255,255,255,0.3)' }}
        />
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 72, borderRadius: 12, background: '#f1f5f9' }} />
        ))}
      </div>
      <SkeletonList rows={3} />
    </div>
  );
}

export function AccountsSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Bar w={100} h={11} mb={20} />
      <Bar w={140} h={13} mb={20} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Bar w={200} h={22} />
        <Bar w={120} h={14} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function CardSkeleton({ gradient }: { gradient: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '20px 24px', background: gradient, marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Bar w={70} h={11} mb={6} opacity={0.35} />
          <Bar w={140} h={15} opacity={0.45} />
        </div>
        <Bar w={60} h={18} opacity={0.4} />
      </div>
      <Bar w="70%" h={20} mb={16} opacity={0.4} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Bar w={50} h={11} mb={4} opacity={0.3} />
          <Bar w={40} h={14} opacity={0.4} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <Bar w={80} h={11} mb={4} opacity={0.3} />
          <Bar w={110} h={15} opacity={0.4} />
        </div>
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Bar w={100} h={11} mb={20} />
      <Bar w={140} h={13} mb={20} />
      <Bar w={160} h={22} mb={24} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CardSkeleton gradient="linear-gradient(135deg,#1e3a5f,#2563eb)" />
        <CardSkeleton gradient="linear-gradient(135deg,#b45309,#d97706)" />
        <CardSkeleton gradient="linear-gradient(135deg,#374151,#6b7280)" />
      </div>
    </div>
  );
}

function LoanCardSkeleton() {
  return (
    <div style={{ padding: 16, border: '1px solid #f1f5f9', borderRadius: 12 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div
          style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <Bar w="45%" h={14} />
            <Bar w={60} h={14} />
          </div>
          <Bar w="35%" h={11} mb={10} />
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginBottom: 4 }}>
            <div style={{ height: '100%', width: '40%', background: '#cbd5e1', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Bar w="40%" h={10} />
            <Bar w={30} h={10} />
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <Bar w={90} h={16} mb={4} />
          <Bar w={70} h={10} mb={6} />
          <Bar w={80} h={12} />
        </div>
      </div>
    </div>
  );
}

export function LoansSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Bar w={100} h={11} mb={20} />
      <Bar w={140} h={13} mb={20} />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <Bar w={200} h={22} />
        <Bar w={130} h={14} />
      </div>
      <div
        style={{
          height: 48,
          borderRadius: 10,
          border: '2px dashed #e2e8f0',
          background: '#f8fafc',
          marginBottom: 20,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <LoanCardSkeleton />
        <LoanCardSkeleton />
      </div>
    </div>
  );
}

function InfoRowSkeleton({
  labelW = '30%',
  valueW = '55%',
}: {
  labelW?: number | string;
  valueW?: number | string;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Bar w={labelW} h={12} />
      <Bar w={valueW} h={13} />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Bar w={100} h={11} mb={8} />
      <Bar w={180} h={24} mb={24} />
      <div style={{ padding: 20, border: '1px solid #f1f5f9', borderRadius: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <Bar w={160} h={16} mb={6} />
            <Bar w={200} h={12} />
          </div>
          <Bar w={70} h={22} />
        </div>
        <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InfoRowSkeleton labelW={100} valueW="50%" />
          <InfoRowSkeleton labelW={80} valueW="60%" />
          <InfoRowSkeleton labelW={110} valueW="45%" />
          <InfoRowSkeleton labelW={95} valueW="30%" />
          <InfoRowSkeleton labelW={85} valueW="55%" />
          <InfoRowSkeleton labelW={70} valueW="25%" />
        </div>
        <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
        <div style={{ height: 34, width: 120, borderRadius: 8, background: '#f1f5f9' }} />
      </div>
    </div>
  );
}
