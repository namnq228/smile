'use client'

import React from 'react'
import ErrorFallback from './ErrorFallback'

interface Props {
  children: React.ReactNode
  /** Tuỳ chọn: fallback riêng thay vì UI mặc định */
  fallback?: React.ReactNode
  /** Nhãn định danh để biết lỗi xảy ra ở đâu, hiện trong console và UI dev */
  boundaryTag?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Bọc quanh bất kỳ component nào cần bắt lỗi render.
 *
 * @example
 * // Dùng UI fallback mặc định
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // Dùng fallback tuỳ chỉnh
 * <ErrorBoundary fallback={<p>Lỗi rồi!</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const tag = this.props.boundaryTag ?? 'unknown'
    console.error(`[ErrorBoundary:${tag}]`, error.message)
    console.error(`[ErrorBoundary:${tag}] componentStack:`, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          boundaryTag={this.props.boundaryTag}
        />
      )
    }

    return this.props.children
  }
}
