import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CANDIDATE_DIRS = [
	path.join(process.cwd(), 'public', 'Gallery', 'Greviews'),
	path.join(process.cwd(), 'public', 'Gallery', 'GReviews'),
	path.join(process.cwd(), 'public', 'gallery', 'Greviews'),
	path.join(process.cwd(), 'public', 'Greviews'),
];

export async function GET() {
	try {
		let dirPath: string | null = null;
		for (const p of CANDIDATE_DIRS) {
			try {
				const stat = await fs.stat(p);
				if (stat.isDirectory()) { dirPath = p; break; }
			} catch {}
		}
		if (!dirPath) {
			return NextResponse.json({ images: [] }, { status: 200 });
		}

		const entries = await fs.readdir(dirPath);
		const images = entries
			.filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

		// Build public URLs using the actual case we found
		const publicPrefix = dirPath.replace(path.join(process.cwd(), 'public'), '').replace(/\\/g, '/');
		const urls = images.map((f) => `${publicPrefix}/${f}`);

		return NextResponse.json({ images: urls }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
	} catch {
		return NextResponse.json({ images: [] }, { status: 200 });
	}
}


