import CenterWorkspace from './CenterWorkspace.jsx';
import TopBar from './TopBar.jsx';
import { ShellCommandProvider } from '../../contexts/ShellCommandContext.jsx';

export default function ShellContainer({ children }) {
  return (
    <ShellCommandProvider>
      <div
        className="single-shell profile-workspace workspace-shell"
        style={{
          '--profile-accent': '#8be9ff',
          '--profile-accent-2': '#b6ff5b'
        }}
      >
        <TopBar />

        <div className="shell-grid workspace-grid-shell">
          <CenterWorkspace activeProfile="workspace">{children}</CenterWorkspace>
        </div>
      </div>
    </ShellCommandProvider>
  );
}
