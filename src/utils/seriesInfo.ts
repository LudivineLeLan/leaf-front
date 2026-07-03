/**
 * Extracts the series name and volume position from a book title.
 * Patterns are ordered from most specific to most permissive.
 * Returns null if no known pattern matches.
 *
 * @example
 * extractSeriesInfo("Naruto Tome 7")   // { name: "Naruto", position: 7 }
 * extractSeriesInfo("One Piece T01")   // { name: "One Piece", position: 1 }
 * extractSeriesInfo("One Piece")       // null
 */
export function extractSeriesInfo(
	title: string,
): { name: string; position: number } | null {
	if (!title) return null;

	const patterns = [
		/(.+?)\s+tome\s*(\d+)/i,
		/(.+?)\s+vol(?:ume|\.)?\s*(\d+)/i,
		/(.+?)\s+part\s*(\d+)/i,
		/(.+?)\s+book\s*(\d+)/i,
		/(.+?)\s+t\.\s*(\d+)/i,
		/(.+?)\s+t(\d+)\s*$/i,
		// Fallback: matches any title ending with a bare number.
		// Intentionally last and permissive — may produce false positives
		// on titles that end with a year or unrelated number.
		/(.+?)\s+(\d+)\s*$/,
	];

	for (const pattern of patterns) {
		const match = title.match(pattern);
		if (match) {
			return {
				name: match[1]
					// Strip trailing ASCII punctuation (dash, colon, comma...)
					.replace(/\s*[-–,:]\s*$/, "")
					// Strip trailing unicode punctuation variants (Arabic ، Chinese 。)
					.replace(/[،。]\s*$/, "")
					.trim(),
				position: parseInt(match[2], 10),
			};
		}
	}

	return null;
}
