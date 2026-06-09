function AddButton({
	onClick,
}: {
	onClick: (event: React.MouseEvent) => void;
}) {
	return (
		<button
			onClick={onClick}
			style={{
				backgroundColor: "#34d399",
				color: "#0f0f0f",
				border: "none",
				borderRadius: "999px",
				padding: "4px 16px",
				fontSize: "12px",
				cursor: "pointer",
				display: "inline-block",
				width: "auto",
				fontWeight: "600",
			}}
		>
			+ Ajouter
		</button>
	);
}

export default AddButton;
