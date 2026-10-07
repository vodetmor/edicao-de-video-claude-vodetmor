# KITE — Pocket World

A 15-second, 1920×1080, 30 fps announcement for a fictional AI Kanban product. A small clay kite and a human cursor turn a brief into a board, reveal a dependency and move work forward after human approval.

Use [the final-direction build prompt](build-prompt.md) with [the Pocket World styleboard](references/pocket-world-styleboard.png) and the four supplied artwork files. This prompt is a **new reusable consolidation** of the work across several revisions. It was not the original one-shot prompt for the final video.

## The actual progression

1. [Initial production prompt](history/01-original-production-prompt.md): the first native AE build, including its earlier copy and timing. Only the styleboard link has been normalized. References in that historical document to its delivery report and QA describe the original local package.
2. [Visual revision](history/02-visual-revision.md): snappier copy, layered reveals, drawn accents, cursor reactions and shorter camera handoffs. These are the visuals retained in the final v4 video.
3. [Sound direction](history/03-sound-direction.md): tactile effects and a sparse musical bed.
4. [Final background-music revision](history/04-background-music-revision.md): an audible 104 BPM instrumental groove while retaining the approved visuals and effects. This last file is a summary of the saved implementation, not a verbatim original user prompt.

Some words printed in the styleboard predate the final revision. The written build prompt supplies the final copy and product states. The design task becomes Ready while remaining unfinished in To do; only the approved copy task moves to Done.

## Artwork and asset prompts

| Supplied image | Purpose | Original image prompt |
|---|---|---|
| [desk-background.png](assets/desk-background.png) | Clean miniature desktop environment | [Prompt](asset-prompts/desk-background.txt) |
| [board.png](assets/board.png) | Ivory cardboard board and compartments | [Prompt](asset-prompts/board.txt) |
| [clay-card.png](assets/clay-card.png) | Reusable clay card surface | [Prompt](asset-prompts/clay-card.txt) |
| [kite.png](assets/kite.png) | Blank kite body; eyes and tail are separate AE elements | [Prompt](asset-prompts/kite.txt) |

These are the delivered **RGB** images. Although several original image prompts requested alpha transparency, the resulting images did not supply it. The AE build isolates the board, card and kite with native masks. Do not assume the backgrounds are transparent when importing them.

The material images stay raster artwork. Typography, status labels, eyes, tail, annotations, cursor, masks and animation remain editable native AE elements. This is a layered scene with shallow depth and modest camera travel, not an orbitable 3D clay model.

The original image prompts use the Pocket World styleboard as their material and lighting reference. Reusing the supplied images avoids needing to generate replacement artwork. Generating new images can produce different material details and silhouettes.

The final audio uses local synthesis and Kenney CC0 samples from [Impact Sounds](https://kenney.nl/assets/impact-sounds), [Interface Sounds](https://kenney.nl/assets/interface-sounds) and [RPG Audio](https://kenney.nl/assets/rpg-audio). These prompts describe the sound direction; they are not an exact soundtrack-generation program.
