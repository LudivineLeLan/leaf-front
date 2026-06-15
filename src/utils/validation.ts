// Warnings related to Joi schemas for real-time validation

export const getEmailWarning = (value: string): string | null => {
	if (!value) return null;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(value)) return "Email invalide";
	return null;
};

export const getUsernameWarning = (value: string): string | null => {
	if (!value) return null;
	if (value.length < 2)
		return "Le nom d'utilisateur doit contenir au moins 2 caractères";
	if (value.length > 30)
		return "Le nom d'utilisateur ne peut pas dépasser 30 caractères";
	return null;
};

export const getPasswordWarning = (value: string): string | null => {
	if (!value) return null;
	const passwordRegex =
		/^(?=.*\p{L})(?=.*\p{N})[\p{L}\p{N}!@#$%^&*()_+\-=[\]{}|;:'",.<>?/]{8,30}$/u;
	if (!passwordRegex.test(value))
		return "Le mot de passe doit contenir 8 à 30 caractères, avec au moins une lettre et un chiffre";
	return null;
};
