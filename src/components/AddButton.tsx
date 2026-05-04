function AddButton({ onClick }: { onClick: () => void }) {
    return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#16a34a',
        color: 'white',
        border: 'none',
        borderRadius: '999px',
        padding: '4px 16px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'inline-block',
        width: 'auto'
      }}
    >
      Ajouter
    </button>
  )
}

export default AddButton