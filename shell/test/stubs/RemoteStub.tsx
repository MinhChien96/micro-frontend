// Stub thay cho MF remote component trong unit test (mfe_*/App không resolve trong Vitest).
export default function RemoteStub() {
  return <div data-testid="remote-stub">remote-stub</div>;
}
