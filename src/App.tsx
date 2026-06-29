import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import SearchPage from "@/pages/SearchPage";
import LibraryPage from "@/pages/LibraryPage";
import StatsPage from "@/pages/StatsPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import BookDetailPage from "@/pages/BookDetailPage";
import SeriePage from "@/pages/SeriePage";
import BottomNav from "@/components/BottomNav";
import NotificationsPage from "@/pages/NotificationsPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthorPage from "@/pages/AuthorPage";

const noNavPages = ["/login", "/register"]; //no nav menu in those pages

function App() {
	const location = useLocation();
	const showNav = !noNavPages.includes(location.pathname);

	return (
		<div className="min-h-screen pb-24">
			<Routes>
				<Route path="/" element={<Navigate to="/search" />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/search" element={<SearchPage />} />
				<Route path="/library" element={<LibraryPage />} />
				<Route path="/book/:bookId" element={<BookDetailPage />} />
				<Route path="/stats" element={<StatsPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route
					path="/serie/:id"
					element={
						<ProtectedRoute>
							<SeriePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/notifications"
					element={
						<ProtectedRoute>
							<NotificationsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/author/:authorId"
					element={
						<ProtectedRoute>
							<AuthorPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
			{showNav && <BottomNav />}
		</div>
	);
}

export default App;
