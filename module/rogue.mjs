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

Handlebars.registerHelper("ability", function(modifier) {
  return 10+modifier;
});
