import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { getEmailWarning } from "@/utils/validation";

function LoginPage() {
	const { login } = useAuth();
	const location = useLocation();
	// Cast to extract the optional message passed via navigate state (e.g. after registration)
	const successMessage = (
		location.state as { message?: string } | null
	)?.message;
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Validated on every keystroke — blocks submit if the email format is invalid
	const emailWarning = getEmailWarning(formData.email);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [event.target.name]: event.target.value });
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Guard against submitting with an invalid email
		if (emailWarning) return;
		setLoading(true);
		setError(null);

		try {
			const { data } = await api.post("/auth/login", formData);
			login(data.user);
			navigate("/search");
		} catch {
			setError("Email ou mot de passe incorrect");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col justify-center px-6">
			<div className="mb-10 text-center">
				<h1 className="text-4xl font-bold text-accent">
					<Link to="/search">Leaf</Link>
				</h1>
				<p className="text-secondary mt-2">Ta bibliothèque personnelle</p>
			</div>

			{/* Success message passed via navigation state, e.g. after registration */}
			{successMessage && (
				<p className="text-accent text-sm text-center mb-4 bg-surface p-3 rounded-lg border border-accent">
					{successMessage}
				</p>
			)}

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					{/* htmlFor + id links the label to the input for accessibility and click-to-focus */}
					<label
						htmlFor="email"
						className="text-sm font-medium text-secondary"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="ton@email.com"
						autoComplete="email"
						required
						className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
					/>
					{emailWarning && (
						<p className="text-orange-400 text-xs mt-0.5">{emailWarning}</p>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="password"
						className="text-sm font-medium text-secondary"
					>
						Mot de passe
					</label>
					<input
						id="password"
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						placeholder="••••••••"
						// Tells password managers this is a login form, not a new password field
						autoComplete="current-password"
						required
						className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
					/>
				</div>

				{error && <p className="text-red-400 text-sm">{error}</p>}

				{/* Disabled while loading or if email validation fails */}
				<button
					type="submit"
					disabled={loading || !!emailWarning}
					className="mt-2 bg-accent hover:bg-accent-hover text-background font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
				>
					{loading ? "Connexion..." : "Se connecter"}
				</button>
			</form>

			<p className="text-center text-sm text-muted mt-6">
				Pas encore de compte ?{" "}
				<Link to="/register" className="text-accent font-medium">
					S'inscrire
				</Link>
			</p>
		</div>
	);
}

export default LoginPage;