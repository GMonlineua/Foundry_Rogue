export async function createRollDialog(type, sheet, note) {
  const { rollName, rollFunction, needDialog, templateData } = getTestData(type, sheet, note);
  const html = await renderTemplate("systems/rogue/templates/apps/rollDialog.hbs", templateData);

  if (needDialog) {
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

              await rollFunction(rollName, data, sheet, note);
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
  } else {
    await rollFunction(rollName, sheet, note);
  }
}

function toIntData(data) {
  for (const prop in data) {
    if (data.hasOwnProperty(prop) && !isNaN(data[prop])) {
      data[prop] = parseInt(data[prop], 10);
    }
  }

  return data;
}

function getTestData(type, sheet, note) {
  const testData = {
    abilityCheck: {
      rollName: `${game.i18n.localize("ROGUE.AbilityCheck")}: ${game.i18n.localize(CONFIG.ROGUE.abilities[note])}`,
      rollFunction: abilityCheck,
      needDialog: true
    },
    moraleCheck: {
      rollName: game.i18n.localize("ROGUE.MoraleCheck"),
      rollFunction: moraleCheck,
      needDialog: false
    }
  };

  return testData[type];
}

function abilityCheck(rollName, data, sheet, note) {
  const rollData = {
    name: rollName,
    speaker: ChatMessage.getSpeaker({ actor: sheet.actor }),
    formula: "",
    modifier: sheet.object.system.abilities[note].value,
    difficulty: 15
  }
  rollData.modifier += data.modifier;

  const advantage = data.advantage;
  if (advantage == "advantage") {
    rollData.formula = "2d20kh+@modifier";
  } else if (advantage == "disadvantage") {
    rollData.formula = "2d20kl+@modifier";
  } else {
    rollData.formula = "1d20+@modifier";
  }

  if (data.opposition) {
    rollData.difficulty = data.difficulty;
  }

  roll(rollData);
}

function moraleCheck(rollName, sheet) {
  const rollData = {
    name: rollName,
    speaker: ChatMessage.getSpeaker({ actor: sheet.actor }),
    formula: "2d6",
    difficulty: sheet.object.system.morale
  }

  roll(rollData);
}

async function roll(rollData) {
  const modifier = rollData.modifier
  const roll = new Roll(rollData.formula, { modifier });
  await roll.evaluate();
  rollData.success = roll.total >= rollData.difficulty;

  roll.toMessage({
    speaker: rollData.speaker,
    flavor: rollData.name,
    rollMode: game.settings.get('core', 'rollMode'),
  });
}
