// Client-side validation helpers for real-time form feedback.
// These mirror the backend Joi schemas but run on every keystroke,
// before any API call is made.

/**
 * Returns a warning message if the email format is invalid, null if valid.
 */
export const getEmailWarning = (value: string): string | null => {
	if (!value) return null;
	// Intentionally permissive — only checks for the basic a@b.c structure
	// to avoid false positives on uncommon but valid email formats
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(value)) return "Email invalide";
	return null;
};

/**
 * Returns a warning message if the username length is out of bounds, null if valid.
 */
export const getUsernameWarning = (value: string): string | null => {
	if (!value) return null;
	if (value.length < 2)
		return "Le nom d'utilisateur doit contenir au moins 2 caractères";
	if (value.length > 30)
		return "Le nom d'utilisateur ne peut pas dépasser 30 caractères";
	return null;
};

/**
 * Returns a warning message if the password does not meet the requirements, null if valid.
 * Requirements: 8–30 characters, at least one letter and one digit.
 */
export const getPasswordWarning = (value: string): string | null => {
	if (!value) return null;
	// \p{L} matches any Unicode letter (including accented characters)
	// \p{N} matches any Unicode digit
	// The /u flag enables Unicode property escapes
	const passwordRegex =
		/^(?=.*\p{L})(?=.*\p{N})[\p{L}\p{N}!@#$%^&*()_+\-=[\]{}|;:'",.<>?/]{8,30}$/u;
	if (!passwordRegex.test(value))
		return "Le mot de passe doit contenir 8 à 30 caractères, avec au moins une lettre et un chiffre";
	return null;
};
