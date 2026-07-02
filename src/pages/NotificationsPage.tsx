import { useEffect, useState } from "react";
import api from "@/api/axios";
import { cn } from "@/lib/utils";

interface Notification {
	id: number;
	message: string;
	isRead: boolean;
	type: string;
	created_at: string;
}

function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	// Separate error state to distinguish a fetch failure from an empty list
	const [error, setError] = useState(false);

	useEffect(() => {
		async function fetchNotifications() {
			try {
				const { data } = await api.get<Notification[]>("/notifications");
				setNotifications(data);
				// Only mark as read if there are notifications to mark
				if (data.length > 0) {
					await api.put("/notifications/read");
				}
			} catch (error) {
				console.error(error);
				setError(true);
			} finally {
				setLoading(false);
			}
		}
		fetchNotifications();
	}, []);

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;

	// Show a dedicated error message instead of the empty list state,
	// so the user isn't misled into thinking they have no notifications
	if (error)
		return (
			<p className="text-center text-muted mt-10">
				Impossible de charger les notifications.
			</p>
		);

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			{/* mb-4 replaces the inline style={{ marginBottom: "1rem" }} */}
			<h1 className="text-2xl font-bold text-primary mb-4">Notifications</h1>

			{notifications.length === 0 ? (
				<p className="text-center text-muted mt-10">Aucune notification</p>
			) : (
				<div className="flex flex-col gap-3">
					{notifications.map((notification) => (
						<div
							key={notification.id}
							// cn() instead of template literal — handles conditional
							// classes more safely and avoids potential Tailwind conflicts
							className={cn(
								"p-3 rounded-xl text-sm border",
								notification.isRead
									? "bg-surface border-border text-muted"
									: "bg-surface border-accent text-primary",
							)}
						>
							<p>{notification.message}</p>
							<p className="text-xs text-muted mt-1">
								{new Date(notification.created_at).toLocaleDateString("fr-FR")}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default NotificationsPage;
