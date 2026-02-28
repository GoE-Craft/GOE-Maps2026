import { system } from "@minecraft/server";
import { playSoundsForPlayers } from "../tnt_manager";

export function* soundTNTAction(dimension, chargeLevel, location, entity) {

	const cx = Math.floor(location?.x ?? 0);
	const cy = Math.floor(location?.y ?? 0);
	const cz = Math.floor(location?.z ?? 0);

	const center = { x: cx + 0.5, y: cy + 0.5, z: cz + 0.5 };
	const radius = 40;

	const tracks = [
		"goe_tnt:sound_tnt_music_1",
		"goe_tnt:sound_tnt_music_2",
		"goe_tnt:sound_tnt_music_3"
	];

	const track = tracks[Math.floor(Math.random() * tracks.length)];

	let players = [];
	try {
		players = dimension.getEntities({ location: center, maxDistance: radius, families: ["player"] });
	} catch { players = []; }

	for (const player of players) {
		try {
			if (!player?.isValid) continue;
			// Stop any currently playing sounds so the new track is clean
			player.runCommand("stopsound @s");
		} catch (e) {
			console.warn("stopsound failed for player " + (player?.name ?? "?") + ": " + e);
		}
	}

	playSoundsForPlayers(center, dimension, track, undefined, 1, radius);

	yield;
}