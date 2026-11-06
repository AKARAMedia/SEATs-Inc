// Page-view tracking is sampled to keep Worker CPU low: every beacon runs the full app plus database
// writes (see src/components/PageTracker.tsx, src/app/api/track/route.ts). One tab session in
// TRACK_SAMPLE_RATE sends beacons, and the server counts each of them TRACK_SAMPLE_RATE times
// (page views += rate, rate visitor rows), so dashboard totals stay about right with no changes
// to the stats queries. Change the rate here only; it is shared by the browser and the server.
export const TRACK_SAMPLE_RATE = 5;
