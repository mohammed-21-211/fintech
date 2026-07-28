import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className={styles.container}>
          <div className={styles.icon}>⚠️</div>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.message}>{this.state.error.message}</p>
          <button
            className={styles.retry}
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
