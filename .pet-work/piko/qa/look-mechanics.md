# Piko look mechanics

Piko stays grounded through both feet and lower torso. His enormous physical eyeballs lead each gaze as complete globes—the irises, pupils, highlights, rims, and eyelids rotate together—then his head, ears, muzzle, and upper torso follow with a restrained turn. The bag remains worn against the torso, the cup stays attached to his hand, and the location-pin tail keeps its loop while lagging only slightly.

Each 22.5-degree step uses an even motion budget: small whole-eye rotation, a smaller head turn or pitch, subtle ear follow-through, and minimal upper-body movement. No whole-sprite rotation, body scaling, lateral foot movement, or prop teleporting.

- 000 up: chin lifts, pupils and eye highlights rise, more underside of muzzle shows; both feet and bag stay fixed.
- 090 screen-right: nose, pupils, and head turn clearly toward the image's right edge; the left side of his face becomes more visible and the cup follows slightly.
- 180 down: chin lowers, upper eyelids angle downward, pupils move down as whole eyes rotate; more forehead shows.
- 270 screen-left: nose, pupils, and head turn clearly toward the image's left edge; the right side of his face becomes more visible while bag and cup remain attached.

Diagonals interpolate these pose families evenly. The tail loop, feet, bag body, and cup never jump sides. The 337.5 pose lands one smooth step before 000.
