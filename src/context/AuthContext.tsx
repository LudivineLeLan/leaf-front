import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import api from "@/api/axios";

interface User {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (userData: User) => void;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchMe() {
			try {
				// Typed as User to ensure the response matches the expected shape
				const { data } = await api.get<User>("/auth/me");
				setUser(data);
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		}
		fetchMe();
	}, []);

	const login = (userData: User) => {
		setUser(userData);
	};

	const logout = async () => {
		try {
			await api.post("/auth/logout");
		} finally {
			// Always clear local state, even if the server request fails,
			// to avoid leaving the user stuck in an authenticated state
			setUser(null);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
