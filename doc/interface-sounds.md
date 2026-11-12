# Interface sounds

The login sequence plays a quiet, low-frequency computer hum. Buttons, navigation
links, sortable headers, and the SID help icon play a short mechanical-style
click on activation, including native keyboard activation. Sounds are synthesized
locally with Web Audio; no recordings, external requests, or audio downloads are
needed.

While SID types a message, it "speaks" with short square-wave blips at slightly
randomized pitches, like classic RPG dialog boxes. In horror mode the blips drop
to a low, detuned sawtooth that is run through a waveshaper for a distorted,
glitchy voice. Blips stop when typing finishes, a new message interrupts, the
SID panel closes, the page is hidden, or sound is muted.

The title-bar speaker icon button controls all effects. Its setting is saved
as `soundMuted` in local storage and survives page navigation and reloads. Audio
is created only after interaction, respecting browser autoplay restrictions.
The hum fades out when login finishes, navigation replaces the page, the page
is hidden, or sound is muted.

`src/utils/interface-audio.ts` owns the shared audio context and delegated click
listener. Native buttons, links, and elements with `role="button"` are detected
automatically, including controls rendered by Preact after hydration. Use
`data-sound-click` for other clickable elements; disabled controls are excluded.
Audio failures are logged without blocking the interface.
