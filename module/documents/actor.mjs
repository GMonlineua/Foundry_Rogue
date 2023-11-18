/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class RogueActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override*/
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.rogue || {};

    for (let [key, ability] of Object.entries(systemData.abilities)) {
      ability.defense = 10 + ability.value;
    }
    systemData.armor.defense = 10 + systemData.armor.value

    if (actorData.type == 'character') this._prepareCharacterData(actorData);

    // this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const systemData = actorData.system;

    // Experience
    const lvl_exp = [0, 200, 400, 800, 1600, 3200, 6400]

    for (let i = 0; i < lvl_exp.length; i++) {
      const lvl = i+1
      const min = lvl_exp[i];
      const max = lvl_exp[lvl];

      if (i == (lvl_exp.length - 1)) {
        systemData.exp.max = 10000;
        systemData.level = lvl;
        break;
      }

      if (systemData.exp.value >= min && systemData.exp.value < max) {
        systemData.exp.max = max;
        systemData.level = lvl;
        break;
      }
    }

    // Inventory slots
    systemData.slots.max = systemData.abilities.con.defense;
    let used = 0;
    for (let i of actorData.items) {
      if (i.system.slots) {
        used += i.system.slots;
      }
    }
    systemData.slots.used = used;
    systemData.slots.free = systemData.slots.max - systemData.slots.used;

    // Prepared spells
    systemData.preparedSpellsMax = systemData.level;
    let prepared = 0;
    for (let i of actorData.items) {
      if (i.system.prepared) {
        prepared += 1;
      }
    }
    systemData.preparedSpells = prepared;
  }
}
