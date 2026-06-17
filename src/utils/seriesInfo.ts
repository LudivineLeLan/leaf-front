/**
 * Find serie & tome number from book title
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
		/(.+?)\s+(\d+)\s*$/,
		/(.+?)\s+t\.\s*(\d+)/i,
		/(.+?)\s+t(\d+)\s*$/i,
	];

	for (const pattern of patterns) {
		const match = title.match(pattern);
		if (match) {
			return {
				name: match[1]
					.replace(/\s*[-–,:]\s*$/, "")
					.replace(/[,،。]\s*$/, "")
					.trim(),
				position: parseInt(match[2], 10),
			};
		}
	}

	return null;
}
