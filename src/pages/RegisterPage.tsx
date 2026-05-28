import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

function RegisterPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [event.target.name]: event.target.value });
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await api.post("/auth/register", formData);
			navigate("/login", {
				state: { message: "Compte créé avec succès ! Tu peux te connecter." },
			});
		} catch (err) {
			const error = err as { response?: { data?: { error?: string } } };
			setError(error.response?.data?.error || "Une erreur est survenue");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col justify-center px-6">
			<div className="mb-10 text-center">
				<h1 className="text-4xl font-bold text-accent">Leaf 🍃</h1>
				<p className="text-secondary mt-2">Crée ton compte</p>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-secondary">
						Nom d'utilisateur
					</label>
					<input
						type="text"
						name="username"
						value={formData.username}
						onChange={handleChange}
						placeholder="ton pseudo"
						required
						className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-secondary">Email</label>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="ton@email.com"
						required
						className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-secondary">
						Mot de passe
					</label>
					<input
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						placeholder="••••••••"
						required
						className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
					/>
				</div>

				{error && <p className="text-red-400 text-sm">{error}</p>}

				<button
					type="submit"
					disabled={loading}
					className="mt-2 bg-accent hover:bg-accent-hover text-background font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
				>
					{loading ? "Inscription..." : "S'inscrire"}
				</button>
			</form>

			<p className="text-center text-sm text-muted mt-6">
				Déjà un compte ?{" "}
				<Link to="/login" className="text-accent font-medium">
					Se connecter
				</Link>
			</p>
		</div>
	);
}

export default RegisterPage;
