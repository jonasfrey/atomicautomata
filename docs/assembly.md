# Assembly controls

The simulation fills the window. Use ⛶ to enter or leave fullscreen; browsers
require a user action before entering fullscreen.

Start with the **Try a pattern** card. Waves, Worms, and Pulse each apply a complete
rule and a fresh seed, so a single click produces a visible experiment. The app
starts with Waves running. Drag on the image with a mouse, pen, or touch to add
color; drawing or choosing a preset resumes a paused simulation.

Use **New seed** to restart the current rules with fresh pixels, and **Speed** to
slow down or accelerate evolution. Open **How to use · Try a guided experiment**
for a brief explanation or select **Show me** to learn by choosing a pattern,
painting, and saving a snapshot. Collapse the card with its arrow to see more of
the image.

The toolbar provides pause/resume, video recording, a PNG snapshot, fullscreen,
the three color channels, and assembly settings. Hover over a button for its name;
buttons also have accessible labels for screen readers and keyboard users.

Advanced controls stay hidden until their toolbar button is selected. Drag an
overlay's header with a mouse, pen, or touch to move it. Drag its bottom-right
corner with a mouse, pen, or touch to resize it. The resize button also accepts
arrow keys. Select a panel to bring it forward. Close it
with × or its toolbar button. Escape closes all panels. Position and size remain
when reopened, and panels stay reachable after the viewport changes.

Channel overlays contain the existing kernel, rule, shader, and parameter controls.
Assembly settings contain frame rate and rendering resolution. Recording downloads
when stopped; browser codec support determines the video format.

This repository renders cellular automata; it does not currently provide a
microscope camera or hardware driver. Connect those through your existing assembly
workflow.
