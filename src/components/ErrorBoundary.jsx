import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 bg-mufi-bg px-6 text-center safe-top safe-bottom">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50">
            <span className="text-2xl font-semibold text-red-500">!</span>
          </div>
          <h1 className="text-[20px] font-semibold text-mufi-label">
            Bir sorun oluştu
          </h1>
          <p className="text-[14px] text-mufi-secondary">
            {this.state.error?.message || 'Beklenmeyen bir hata meydana geldi.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-mufi-accent px-6 py-3 text-[15px] font-semibold text-white shadow-sm"
          >
            Tekrar dene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
