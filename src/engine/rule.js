/* =====================================================================
   THE RULE OF THE RIVER (base-rules Rule 1) — the single source of truth.
   Used by the reader (to generate end-of-scene choices) and by the
   validator (to block any change that breaks it).

   Authors declare only `branches: [["character", id] | ["place", id]]`.
   Each choice leads to the NEXT moment in time (t_story > now) in which
   that character appears / whose setting is that place. Never backward,
   never skipping ahead.
   ===================================================================== */

/** @typedef {{id:string,t:number,place:string,cast:string[],status:string}} Node */

/**
 * The next moment strictly after `afterT` that features `ref`.
 * @param {Node[]} timeline sorted by t ascending
 * @param {"character"|"place"} by
 * @param {string} ref
 * @param {number} afterT
 * @returns {Node|null}
 */
export function nextMoment(timeline, by, ref, afterT) {
  return timeline.find(n => n.t > afterT && (by === "character" ? n.cast.includes(ref) : n.place === ref)) || null;
}

/**
 * Generate the end-of-scene choices for a moment, reporting any rule violations.
 * @param {Node} node
 * @param {Array<[string,string]>} branches
 * @param {Node[]} timeline sorted by t ascending
 * @returns {{choices:Array<{by:string,ref:string,to:Node}>, violations:Array<{code:string,message:string}>}}
 */
export function choicesFor(node, branches, timeline) {
  const choices = [], violations = [];
  (branches || []).forEach(([by, ref]) => {
    if (by !== "character" && by !== "place") {
      violations.push({ code: "branch-type", message: `branch must be by character or place, got "${by}"` });
      return;
    }
    if (by === "character" && !node.cast.includes(ref)) {
      violations.push({ code: "branch-absent-character", message: `can only follow a character present in this scene; "${ref}" is not in the cast` });
      return;
    }
    const to = nextMoment(timeline, by, ref, node.t);
    if (!to) return; // the thread ends here: no choice is shown
    choices.push({ by, ref, to });
  });
  return { choices, violations };
}
