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
      ability.defense = 10 + ability.value - systemData.exhaustion;
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
    used += Math.floor(systemData.sc / 100);
    systemData.slots.used = used + systemData.exhaustion;
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

  // Set default token parameters
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId)
    let prototypeToken = {
      appendNumber: true,
      displayName: CONST.TOKEN_DISPLAY_MODES.OWNER,
      displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
      disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
      sight: {
        enabled: true
      }
    }

    if (data.type === 'character') {
      prototypeToken = {
        actorLink: true,
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        sight: {
          enabled: true
        }
      }
    }

    return this.updateSource({prototypeToken});
  }
}
