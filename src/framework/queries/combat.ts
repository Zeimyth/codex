import {
  GameState,
  InstanceID,
} from "../types";

import {
  getInstance,
  getPlayer,
  isHero,
  isUnit,
} from './common';
import { getOpponents } from "./players";
import { lookupCard } from "../../../data";

export const canAttack = (
  $: GameState,
  iid: InstanceID,
): boolean => {
  const I = getInstance($, iid);
  if (I == null) {
    return false;
  }
  const card = lookupCard(I.card);

  // If this isn't a unit or hero, it can't attack.
  if (!isHero(card) && !isUnit(card)) {
    return false;
  }

  if (I.readyState !== 'READY' || I.arrivalFatigue) {
    return false;
  }

  return true;
};

export const canPatrol = (
  $: GameState,
  iid: InstanceID,
): boolean => {
  const I = getInstance($, iid);
  if (I == null) {
    return false;
  }
  const card = lookupCard(I.card);

  if (!isHero(card) && !isUnit(card)) {
    return false;
  }

  if (I.readyState !== 'READY') {
    return false;
  }

  return true;
}

export const getPossibleAttackTargets = (
  $: GameState,
  attackerIID: InstanceID,
): Array<InstanceID> => {
  const targets: Array<InstanceID> = [];

  const attackerI = getInstance($, attackerIID);
  if (attackerI != null) {
    for (const pid of getOpponents($, attackerI.controller)) {
      const P = getPlayer($, pid);
      if (P == null) {
        continue;
      }

      // If there's a squad leader, we can't attack anything else
      if (P.patrol.squadLeader != null) {
        targets.push(P.patrol.squadLeader);
        continue;
      }

      // If there are other patrollers, we can't attack anything else
      let foundPatroller = false;
      for (const defenderIID of [P.patrol.elite, P.patrol.scavenger, P.patrol.technician, P.patrol.lookout]) {
        if (defenderIID != null) {
          targets.push(defenderIID);
          foundPatroller = true;
        }
      }
      if (foundPatroller) {
        continue;
      }

      // Otherwise, we can attack anything
      // TODO get all instances for this opponent
      // TODO get tech buildings, base, addon (these should be instances maybe)
    }
  }
  
  return targets;
};
