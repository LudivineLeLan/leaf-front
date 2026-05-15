import { useEffect, useState } from "react";
import api from "@/api/axios";

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

	useEffect(() => {
		async function fetchNotifications() {
			try {
				const { data } = await api.get("/notifications");
				setNotifications(data);
				// Marquer comme lues
				await api.put("/notifications/read");
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		fetchNotifications();
	}, []);

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

	return (
		<div className="px-4 pt-6 pb-4">
			<h1 className="text-2xl font-bold mb-4">Alertes</h1>

			{notifications.length === 0 ? (
				<p className="text-center text-gray-400 mt-10">Aucune notification</p>
			) : (
				<div className="flex flex-col gap-3">
					{notifications.map((notification) => (
						<div
							key={notification.id}
							className={`p-3 rounded-lg text-sm ${
								notification.isRead
									? "bg-gray-50 text-gray-400"
									: "bg-green-50 text-gray-700"
							}`}
						>
							<p>{notification.message}</p>
							<p className="text-xs text-gray-400 mt-1">
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
