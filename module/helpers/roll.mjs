export async function createRollDialog(type, note, sheet) {
  const { rollName, rollFunction, rollData, templateData } = getTestData(type, note, sheet);
  const html = await renderTemplate("systems/rogue/templates/apps/rollDialog.hbs", templateData);
  const dialog = new Dialog({
    title: rollName,
    content: html,
    buttons: {
      roll: {
        label: game.i18n.localize("ROGUE.Roll"),
        icon: '<i class="fas fa-dice"></i>',
        callback: async (html) => {
          try {
            const formData = new FormData(html[0].querySelector("form"));
            const data = toIntData(Object.fromEntries(formData.entries()));

            await rollFunction(rollName, rollData, data, sheet);
          } catch (error) {
            console.error("Error submit in roll dialog:", error);
          }
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("ROGUE.RollCancel"),
        callback: () => {},
      },
    },
    default: "roll",
    close: () => {},
  });
  dialog.render(true);
}

function toIntData(data) {
  for (const prop in data) {
    if (data.hasOwnProperty(prop) && !isNaN(data[prop])) {
      data[prop] = parseInt(data[prop], 10);
    }
  }

  return data;
}

function getTestData(type, note, sheet) {
  const testData = {
    abilityCheck: {
      rollName: `${game.i18n.localize("ROGUE.AbilityCheck")}: ${game.i18n.localize(CONFIG.ROGUE.abilities[note])}`,
      rollFunction: abilityCheck,
      rollData: sheet.object.system.abilities[note].value
    },
    default: {
      rollName: game.i18n.localize("ROGUE.Roll"),
      rollFunction: roll
    },
  };

  return testData[type] || testData.default;
}

function abilityCheck(rollName, rollData, data, sheet) {
  const speaker = ChatMessage.getSpeaker({ actor: sheet.actor });
  const modifier = data.modifier;

  const advantage = data.advantage;
  let formula;
  if (advantage == "advantage") {
    formula = "2d20kh+@rollData+@modifier";
  } else if (advantage == "disadvantage") {
    formula = "2d20kl+@rollData+@modifier";
  } else {
    formula = "1d20+@rollData+@modifier";
  }

  const roll = new Roll(formula, { rollData, modifier });

  roll.toMessage({
    speaker: speaker,
    flavor: rollName,
    rollMode: game.settings.get('core', 'rollMode'),
  });
}

function roll(rollName, rollData, data, sheet) {
  const speaker = ChatMessage.getSpeaker({ actor: sheet.actor });
  const roll = new Roll("1d20", sheet.actor.getRollData());
  roll.toMessage({
    speaker: speaker,
    flavor: rollName,
    rollMode: game.settings.get('core', 'rollMode'),
  });
}
