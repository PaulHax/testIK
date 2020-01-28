import { ActorIK } from './ActorIK'


class AvatarIK extends ActorIK {
  constructor(parsedActor, trackedPerson) {
    super(parsedActor);
    this.targetHandR = trackedPerson.handR;
    this.targetHandL = trackedPerson.handL;
  }
}

export { AvatarIK }