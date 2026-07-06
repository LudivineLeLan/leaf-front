import { cn } from "@/lib/utils";

function AddButton({
	onClick,
}: {
	onClick: (event: React.MouseEvent) => void;
}) {
	return (
		<button
			onClick={onClick}
			style={{
				padding: "4px 12px",
				borderRadius: "999px",
				fontSize: "11px",
				border: "1px solid #34d399",
				cursor: "pointer",
				backgroundColor: "#34d399",
				color: "#0f0f0f",
			}}
		>
			+ Ajouter
		</button>
	);
}

export default AddButton;
