function BottomSheet({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="bottom-sheet" onClick={onClose}>
      <div className="bottom-sheet__panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default BottomSheet
