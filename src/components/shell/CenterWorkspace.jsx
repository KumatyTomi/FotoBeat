export default function CenterWorkspace({ activeProfile, children }) {
  return (
    <main className={`center-workspace profile-${activeProfile}`}>
      <div className="center-workspace-header">
        <span>Center Workspace</span>
        <strong>{activeProfile}</strong>
      </div>
      {children}
    </main>
  );
}
