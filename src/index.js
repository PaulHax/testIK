import { AvatarIK } from './avatarik/AvatarIK';
import { TrackedPerson, MirroredTrackedPerson } from './avatarik/TrackedPerson';
import { SkeletonAxisHelper } from './avatarik/SkeletonAxisHelper';
import { ActorParser } from './avatarik/ActorParser';

// If this is being included via script tag and using THREE
// globals, attach our exports to THREE.
if (typeof window !== 'undefined' && typeof window.THREE === 'object') {
  window.THREE.Actor = { 
    AvatarIK: AvatarIK, 
    TrackedPerson: TrackedPerson,
    SkeletonAxisHelper: SkeletonAxisHelper
  };
}

export { ActorParser, AvatarIK, TrackedPerson, MirroredTrackedPerson, SkeletonAxisHelper };
