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
      rollName: `${game.i18n.localize("ROGUE.AbilityCheck")}: ${note ? game.i18n.localize(note.split(', ')[1]) : ''}`,
      rollFunction: abilityCheck,
      needDialog: true
    },
    moraleCheck: {
      rollName: game.i18n.localize("ROGUE.MoraleCheck"),
      rollFunction: moraleCheck,
      needDialog: false
    },
    restRoll: {
      rollName: game.i18n.localize("ROGUE.Rest." + note),
      rollFunction: restRoll,
      needDialog: false
    },
    weapon: {
      rollName: sheet.name,
      rollFunction: weaponRoll,
      needDialog: true
    },
    spell: {
      rollName: sheet.name,
      rollFunction: spellRoll,
      needDialog: true
    }
  };

  return testData[type];
}

async function abilityCheck(rollName, data, sheet, note) {
  const ablity = note.split(', ')[0];
  const rollData = {
    name: rollName,
    speaker: ChatMessage.getSpeaker({ actor: sheet }),
    formula: "",
    modifier: sheet.system.abilities[ablity].value,
    difficulty: 15,
  };
  rollData.modifier += data.modifier;
  rollData.modifier -= sheet.system.exhaustion;

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

  await roll(rollData);

  return rollData;
}


function moraleCheck(rollName, sheet) {
  const rollData = {
    name: rollName,
    speaker: ChatMessage.getSpeaker({ actor: sheet }),
    formula: "2d6",
    difficulty: sheet.system.morale
  }

  roll(rollData);
}

async function restRoll(rollName, sheet, note) {
  const rollData = {
    name: rollName,
    speaker: ChatMessage.getSpeaker({ actor: sheet })
  };

  if (note == "FourHour") {
    rollData.formula = "1d3"
  } else if (note == "Sleep") {
    rollData.formula = "1d6"
  } else if (note == "Day") {
    rollData.formula = "1d6+@modifier";
    rollData.modifier = sheet.system.abilities.con.value;
    sheet.update({ "system.exhaustion": sheet.system.exhaustion - 1 });
  } else {
    sheet.update({ "system.hp.value": sheet.system.hp.max });
    sheet.update({ "system.exhaustion": 0 });
  }

  if (rollData.formula) {
    await roll(rollData);
    const newHP = sheet.system.hp.value + rollData.result;
    if (newHP <= sheet.system.hp.max) {
      sheet.update({ "system.hp.value": newHP });
    } else {
      sheet.update({ "system.hp.value": sheet.system.hp.max });
    }
  }

}

async function roll(rollData) {
  const modifier = rollData.modifier
  const roll = new Roll(rollData.formula, { modifier });
  await roll.evaluate();
  rollData.result = roll.total;
  rollData.success = roll.total >= rollData.difficulty;

  roll.toMessage({
    speaker: rollData.speaker,
    flavor: rollData.name,
    rollMode: game.settings.get('core', 'rollMode'),
  });

  return rollData
}

async function weaponRoll(rollName, data, sheet) {
  const ability = sheet.system.ability;
  const rollData = await abilityCheck(rollName, data, sheet.actor, ability);
  if (rollData.success) {
    sheet.roll();
  }
}

async function spellRoll(rollName, data, sheet) {
  const rollData = await abilityCheck(rollName, data, sheet.actor, "int");
  if (rollData.success) {
    sheet.roll();
  }
}
