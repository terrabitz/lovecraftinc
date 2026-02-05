# Lovecraft Inc.

![](./src/assets/Logo/Logo.png)

This website is a wiki for my latest RPG campaign, Lovecraft Inc.

<https://eidolon.hackandsla.sh/>

This is a mid-90s corporate horror setting, where the players all work for a shady mega-corporation called Eidolon Capital, Inc. This company seeks to secure and contain eldritch anomalies for profit. The players serve as field agents who investigate these anomalies, and contain them or eradicate them as needed. During their investigations, they will have to deal with many rival mega-corps and organizations who have conflicting goals to their own. And they may even find that the biggest danger comes from within their very own company.

This setting is inspired by SCP lore, Delta Green, the Magnus Archives, and Severance.

The goal of this campaign is to do episodic, collaborative worldbuilding. Each session will be a new standalone investigation that the players need to deal with. This will allow us to do a rotating DM-style, where each player will get a turn to run an investigation and contribute to the worldbuilding.

## How to Update Content

This is a static site built from Markdown docs. You can find all the content in the [src/content](./src/content/) directory. After adding or modifying files in these directories, a build job will kick off to rebuild the site with the new content. This job typically takes about a minute, so your changes may not be seen instantly.

Each file is named with its `EID-*` ID. Each type of file has some metadata associated with it that will be rendered in the UI. The most important are `id` and `name`. The others are optional, but should be filled in where possible.

## Technical Goals

- The site should lean into the 90s UI aesthetic. This can include UI behaviors that aren't optimal for modern websites, but contribute to the overall 90s feel of the site. A prime example of this is the SID assistant, which is not as easy to use as a dedicated search page but feels like a real "clippy".
- The site should be mobile-friendly
- The site should be minimal and lean
