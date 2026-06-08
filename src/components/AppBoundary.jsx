import React from 'react';

export class AppBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      crashed: true,
      message: error?.message ?? 'Nieznany problem aplikacji.'
    };
  }

  render() {
    if (!this.state.crashed) return this.props.children;

    return (
      <main className="app-shell">
        <section className="render-export-panel">
          <div>
            <p className="panel-kicker">Safety boundary</p>
            <h1>FotoBeat zatrzymał UI po problemie.</h1>
            <p>{this.state.message}</p>
            <p>Odśwież stronę. Dane projektu i lokalne eksporty powinny zostać w localStorage / IndexedDB.</p>
          </div>
          <div className="render-export-actions">
            <button className="primary-button compact" onClick={() => window.location.reload()}>Odśwież</button>
          </div>
        </section>
      </main>
    );
  }
}
