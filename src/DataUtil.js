///<reference path="../data/Data5.ts"/>
///<reference path="../data/PersonaData.ts"/>
///<reference path="../data/SkillData.ts"/>
/**
 * Created by Chin on 08-Apr-17.
 */
function addStatProperties(persona) {
    persona.strength = persona.stats[0];
    persona.magic = persona.stats[1];
    persona.endurance = persona.stats[2];
    persona.agility = persona.stats[3];
    persona.luck = persona.stats[4];
}
function addElementProperties(persona) {
    var properties = ['physical', 'gun', 'fire', 'ice', 'electric', 'wind', 'psychic', 'nuclear', 'bless', 'curse'];
    var elemsValue = { "wk": 0, "-": 1, "rs": 2, "nu": 3, "rp": 4, "ab": 5 };
    for (var i = 0; i < properties.length; i++) {
        persona[properties[i]] = persona.elems[i];
        persona[properties[i] + 'Value'] = elemsValue[persona.elems[i]];
    }
}
function isDlcPersonaOwned(dlcPersona) {
    if (!localStorage["dlcPersona"])
        return true;
    return JSON.parse(localStorage["dlcPersona"])[dlcPersona] === true;
}
/**
 * List of persona with DLC persona potentially removed based on user config
 */
var customPersonaList = (function () {
    var arr = [];
    for (var key in personaMap) {
        if (personaMap.hasOwnProperty(key)) {
            var persona = personaMap[key];
            if (persona.dlc && !isDlcPersonaOwned(key)) {
                continue;
            }
            persona.name = key;
            addStatProperties(persona);
            addElementProperties(persona);
            arr.push(persona);
        }
    }
    return arr;
})();
var fullPersonaList = (function () {
    var arr = [];
    for (var key in personaMap) {
        if (personaMap.hasOwnProperty(key)) {
            var persona = personaMap[key];
            persona.name = key;
            addStatProperties(persona);
            addElementProperties(persona);
            arr.push(persona);
        }
    }
    return arr;
})();
var skillList = (function () {
    var arr = [];
    for (var key in skillMap) {
        if (skillMap.hasOwnProperty(key)) {
            var skill = skillMap[key];
            skill.name = key;
            skill.elemDisplay = capitalizeFirstLetter(skill.element);
            skill.costDisplay = getSkillCost(skill);
            skill.personaDisplay = getSkillPersonaList(skill);
            if (skill.talk) {
                skill.talkDisplay = createPersonaLink(skill.talk);
            }
            if (skill.fuse) {
                if (typeof skill.fuse === 'string') {
                    skill.fuseDisplay = createPersonaLink(skill.fuse);
                }
                else {
                    var arr_1 = [];
                    for (var i = 0; i < skill.fuse.length; i++) {
                        arr_1.push(createPersonaLink(skill.fuse[i]));
                    }
                    skill.fuseDisplay = arr_1.join(", ");
                }
            }
            arr.push(skill);
        }
    }
    return arr;
})();
/**
 * Persona by arcana based on customPersonaList
 */
var customPersonaeByArcana = (function () {
    var personaeByArcana_ = {};
    for (var i = 0; i < customPersonaList.length; i++) {
        var persona = customPersonaList[i];
        if (!personaeByArcana_[persona.arcana]) {
            personaeByArcana_[persona.arcana] = [];
        }
        personaeByArcana_[persona.arcana].push(persona);
    }
    for (var key in personaeByArcana_) {
        personaeByArcana_[key].sort(function (a, b) { return a.level - b.level; });
    }
    return personaeByArcana_;
})();
var arcanaMap = (function () {
    var map = {};
    for (var i = 0; i < arcana2Combos.length; i++) {
        var combo = arcana2Combos[i];
        if (!map[combo.source[0]])
            map[combo.source[0]] = {};
        map[combo.source[0]][combo.source[1]] = combo.result;
        if (!map[combo.source[1]])
            map[combo.source[1]] = {};
        map[combo.source[1]][combo.source[0]] = combo.result;
    }
    return map;
})();
var getResultArcana = function (arcana1, arcana2) {
    return arcanaMap[arcana1][arcana2];
};
var special2Combos = (function () {
    var combos = [];
    for (var i = 0; i < specialCombos.length; i++) {
        if (specialCombos[i].sources.length == 2) {
            combos.push(specialCombos[i]);
        }
    }
    return combos;
})();
function getElems(personaName) {
    var elems = personaMap[personaName].elems;
    for (var i = 0; i < elems.length; i++) {
        if (elems[i] == 'wk')
            elems[i] = 'Weak';
        else if (elems[i] == 'rs')
            elems[i] = 'Resist';
        else if (elems[i] == 'ab')
            elems[i] = 'Absorb';
        else if (elems[i] == 'rp')
            elems[i] = 'Repel';
        else if (elems[i] == 'nu')
            elems[i] = 'Null';
    }
    return elems;
}
function getSkills(personaName) {
    var skills = personaMap[personaName].skills;
    var sorted = [];
    for (var name_1 in skills) {
        if (skills.hasOwnProperty(name_1)) {
            sorted.push([name_1, skills[name_1]]);
        }
    }
    sorted.sort(function (a, b) {
        return a[1] - b[1];
    });
    var resSkills = [];
    for (var i = 0; i < sorted.length; i++) {
        var skillData = skillMap[sorted[i][0]];
        resSkills.push({
            name: sorted[i][0],
            level: sorted[i][1],
            description: skillData.effect,
            elem: capitalizeFirstLetter(skillData.element),
            cost: getSkillCost(skillData)
        });
    }
    return resSkills;
}
function getSkillPersonaList(skill) {
    var arr = [];
    for (var key in skill.personas) {
        if (skill.personas.hasOwnProperty(key)) {
            var level = skill.personas[key];
            var keyHref = createPersonaLink(key);
            arr.push(keyHref + (level !== 0 ? " (" + level + ")" : ""));
        }
    }
    var str = arr.join(", ");
    if (skill.note) {
        str = (str ? (str + ". ") : "") + skill.note;
    }
    return str;
}
function createPersonaLink(personaName) {
    return "<a href='#/persona/" + personaName + "'>" + personaName + "</a>";
}
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function getSkillCost(skill) {
    if (skill.element != 'passive') {
        if (skill.cost < 100) {
            return String(skill.cost) + '% HP';
        }
        else {
            return String(skill.cost / 100) + ' SP';
        }
    }
    else {
        return "-";
    }
}
