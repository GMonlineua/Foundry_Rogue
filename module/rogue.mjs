// Import Modules
import { RogueActor } from "./documents/actor.mjs";
import { RogueActorSheet } from "./sheets/actor-sheet.mjs";
import { RogueItem } from "./documents/item.mjs";
import { RogueItemSheet } from "./sheets/item-sheet.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { preprocessChatMessage, renderChatMessage } from "./helpers/chat-portraits.mjs";

Hooks.once('init', async function() {

  game.rogue = {
    RogueActor,
    RogueItem
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = RogueActor;
  CONFIG.Item.documentClass = RogueItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("rogue", RogueActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("rogue", RogueItemSheet, { makeDefault: true });

  // Custom buners
  CONFIG.Actor.compendiumBanner = "systems/rogue/ui/actor-banner.jpg";
  CONFIG.Adventure.compendiumBanner = "systems/rogue/ui/adventure-banner.jpg";
  CONFIG.Card.compendiumBanner = "systems/rogue/ui/card-banner.jpg";
  CONFIG.JournalEntry.compendiumBanner = "systems/rogue/ui/journalentry-banner.jpg";
  CONFIG.Item.compendiumBanner = "systems/rogue/ui/item-banner.jpg";
  CONFIG.Macro.compendiumBanner = "systems/rogue/ui/macro-banner.jpg";
  CONFIG.Playlist.compendiumBanner = "systems/rogue/ui/playlist-banner.jpg";
  CONFIG.RollTable.compendiumBanner = "systems/rogue/ui/rolltable-banner.jpg";
  CONFIG.Scene.compendiumBanner = "systems/rogue/ui/scene-banner.jpg";

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});


/* -------------------------------------------- */
/*  Chat Message                   */
/* -------------------------------------------- */

// Preprocess chat message before it is created hook
Hooks.on("preCreateChatMessage", preprocessChatMessage);

// Render chat message hook
Hooks.on("renderChatMessage", renderChatMessage);


/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper("load", function(data) {
  let load = game.i18n.localize("ROGUE.Unloaded");
  if (data.free >= 5) {
    load = game.i18n.localize("ROGUE.Unloaded")
  } else if (data.free >= 2 && data.free < 5) {
    load = game.i18n.localize("ROGUE.LightlyLoaded")
  } else if (data.free >= 0 && data.free < 2) {
    load = game.i18n.localize("ROGUE.HeavilyLoaded")
  } else if (data.free >= -2 && data.free < 0) {
    load = game.i18n.localize("ROGUE.Overloaded")
  } else {
    load = game.i18n.localize("ROGUE.MoveBlocked")
  }
  return load;
});

Handlebars.registerHelper("gearWeight", function(slots) {
  let gearClass = "";
  if (slots > 1) {
    gearClass += "heavy"
  } else if (slots < 1) {
    gearClass += "light"
  }

  return gearClass;
});

Handlebars.registerHelper("spellClass", function(data) {
  const conditions = [
    { condition: data.prepared, className: "prepared" },
    { condition: data.blocked, className: "blocked" }
  ];

  let spellClass = "";

  conditions.forEach(({ condition, className }) => {
    if (condition) {
      spellClass += ` ${className}`;
    }
  });

  return spellClass;
});

Handlebars.registerHelper("itemTags", function(data) {
  console.log(data)
});
