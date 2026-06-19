/**
 * @fileoverview Application Composition Root
 * @description Serves as the central entry point for all global context providers.
 * This pattern isolates the application's provider tree, enhancing maintainability,
 * testability, and error isolation without external library bloat.
 */

"use client";

import React, { Component, ErrorInfo, ReactNode, memo } from "react";
import { SessionProvider } from "next-auth/react";

// ============================================================================
// TYPE DEFINITIONS FOR NATIVE ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// NATIVE ENTERPRISE-GRADE ERROR BOUNDARY IMPLEMENTATION
// ============================================================================

/**
 * NativeErrorBoundary Class Component
 * Catch runtime errors anywhere in the child component tree, log incidents,
 * and display a structural fallback UI.
 */
class NativeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  /**
   * Update component state so the next render shows the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Component lifecycle catch hook for side-effect telemetry reporting.
   */
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Production log tracking point (e.g., Sentry, Datadog, CloudWatch metrics)
    console.error("Composition Root Boundary Incident Caught:", error, errorInfo);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return this.fallbackUI;
    }

    return this.props.children;
  }

  /**
   * Memoized access hook parsing valid elements or executing node elements
   */
  private get fallbackUI(): ReactNode {
    return this.props.fallback;
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Fallback UI for authentication provider or core tree layout context failures.
 */
const ProviderErrorBoundaryFallback = () => (
  <div className="flex h-screen w-full items-center justify-center p-6 text-center bg-black text-white">
    <div className="max-w-md p-8 rounded-[24px] border border-white/5 bg-neutral-950 shadow-2xl">
      <h2 className="text-xl font-black tracking-tighter uppercase mb-2">
        Authentication Sync Halted
      </h2>
      <p className="text-sm text-neutral-400 font-medium leading-relaxed">
        The global runtime engine encountered a validation conflict. Check connection rules or refresh active credentials.
      </p>
    </div>
  </div>
);

interface AppProvidersProps {
  children: ReactNode;
}

// ============================================================================
// MAIN COMPOSITION ROOT PROVIDER ENTRY
// ============================================================================

/**
 * AppProviders Component
 * Acts as the centralized composition root for the React tree.
 * 
 * @param {React.ReactNode} children - The application component tree.
 * @returns {JSX.Element} The wrapped application tree with zero-dependency runtime resilience.
 */
const AppProvidersBase = ({ children }: AppProvidersProps) => {
  return (
    <NativeErrorBoundary fallback={<ProviderErrorBoundaryFallback />}>
      <SessionProvider refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </NativeErrorBoundary>
  );
};

/**
 * Exported memoized AppProviders to prevent unnecessary structural re-renders
 * of the entire application subtree during parent context transitions.
 */
export const AppProviders = memo(AppProvidersBase);

export default AppProviders;