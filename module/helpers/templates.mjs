/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    "systems/rogue/templates/actor/parts/img-block.hbs",
    "systems/rogue/templates/actor/parts/abilities.hbs",
    "systems/rogue/templates/actor/parts/inventory.hbs",
    "systems/rogue/templates/actor/parts/spells.hbs",
    "systems/rogue/templates/actor/parts/movement.hbs",
    "systems/rogue/templates/actor/parts/notes.hbs",

    "systems/rogue/templates/item/parts/gear.hbs"
  ]);
};
