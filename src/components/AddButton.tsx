import { cn } from "@/lib/utils";

function AddButton({
	onClick,
}: {
	onClick: (event: React.MouseEvent) => void;
}) {
	return (
		<button
			onClick={onClick}
			className="bg-accent hover:bg-accent-hover text-background rounded-full px-4 py-1 text-xs font-semibold cursor-pointer transition-colors"
		>
			+ Ajouter
		</button>
	);
}

export default AddButton;
