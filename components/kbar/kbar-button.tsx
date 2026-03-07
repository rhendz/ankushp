import { useKBar, VisualState } from 'kbar'
import { KBAR_DIALOG_ID, KBAR_TRIGGER_LABEL } from './constants'

const KBarButton = () => {
  const { query, isOpen } = useKBar((state) => ({
    isOpen: state.visualState !== VisualState.hidden,
  }))

  const handleButtonClick = () => {
    query.toggle()
  }

  return (
    <button
      type="button"
      aria-label={KBAR_TRIGGER_LABEL}
      aria-haspopup="dialog"
      aria-controls={KBAR_DIALOG_ID}
      aria-expanded={isOpen}
      onClick={handleButtonClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 text-secondary"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </button>
  )
}

export default KBarButton
