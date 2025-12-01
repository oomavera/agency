import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const GALLERY_ROOT = path.join(process.cwd(), 'public', 'Gallery');
const ALLOWED_ALBUMS = new Set(['cleans', 'team']);
// Prefer WebP (smaller/faster), then AVIF, then legacy
const EXT_PRIORITY = ['.webp', '.avif', '.jpg', '.jpeg', '.png'];

function isMetadataFile(name: string): boolean {
	const lower = name.toLowerCase();
	return lower.includes('zone.identifier') || lower.startsWith('.') || lower.endsWith('~');
}

async function listAlbumImages(album: string): Promise<string[]> {
	if (!ALLOWED_ALBUMS.has(album)) return [];
	const albumDir = path.join(GALLERY_ROOT, album);
	if (!fs.existsSync(albumDir)) return [];

	const entries = await fs.promises.readdir(albumDir);
	// Group by basename and pick best available extension
	const byBase = new Map<string, Map<string, string>>();
	for (const entry of entries) {
		if (isMetadataFile(entry)) continue;
		const ext = path.extname(entry);
		const base = path.basename(entry, ext);
		const lowerExt = ext.toLowerCase();
		if (!EXT_PRIORITY.includes(lowerExt)) continue;
		let map = byBase.get(base);
		if (!map) {
			map = new Map<string, string>();
			byBase.set(base, map);
		}
		map.set(lowerExt, `/${path.posix.join('Gallery', album, `${base}${lowerExt}`)}`);
	}

	// Sort basenames using natural compare (numbers within names)
	const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
	const bases = Array.from(byBase.keys()).sort((a, b) => collator.compare(a, b));

	const result: string[] = [];
	for (const base of bases) {
		const extMap = byBase.get(base)!;
		for (const ext of EXT_PRIORITY) {
			const found = extMap.get(ext);
			if (found) {
				result.push(found);
				break;
			}
		}
	}
	return result;
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const album = (searchParams.get('album') || 'cleans').trim();
		if (!ALLOWED_ALBUMS.has(album)) {
			return NextResponse.json({ images: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
		}
		const images = await listAlbumImages(album);
		return NextResponse.json({ images }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
	} catch (err) {
		return NextResponse.json({ images: [], error: (err as Error)?.message || 'Unknown error' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
	}
}


