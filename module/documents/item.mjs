//
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class RogueItem extends Item {
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable show description.
   * @param {Event} event   The originating click event
   * @private
   */
  async show() {
    const item = this;

    // Initialize chat data.
    const name = item.name;
    const description = item.system.description;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      content: `
      <h4 class="name">${name}</h3>
      <div class="description">${description}</div>
      `
    });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const name = item.name;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const type = item.type;

    if (type == 'weapon') {
      const rollData = this.getRollData();
      const roll = new Roll(rollData.item.damage, rollData);
      roll.toMessage({
        speaker: speaker,
        flavor: name,
        rollMode: rollMode,
      });
    } else if (type == 'spell') {
      item.show();
    } else {
      item.show();
    }
  }
}
