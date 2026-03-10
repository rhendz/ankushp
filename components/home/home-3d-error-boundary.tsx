"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type Home3DErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type Home3DErrorBoundaryState = {
  hasError: boolean;
};

class Home3DErrorBoundary extends Component<Home3DErrorBoundaryProps, Home3DErrorBoundaryState> {
  state: Home3DErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Home 3D scene failed to render.", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default Home3DErrorBoundary;
