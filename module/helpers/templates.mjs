/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor tabs
    "systems/rogue/templates/actor/parts/character-general.hbs",
    "systems/rogue/templates/actor/parts/character-notes.hbs",
    // Parts
    "systems/rogue/templates/actor/parts/abilities.hbs"
    // Item parts
  ]);
};
