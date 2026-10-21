import type { ComponentType } from 'react';
import type { ActivityId } from '../../types';
import type { ActivityApi } from '../api';
import { SockRescue, SoundMystery } from './MochiActivities';
import { BubbleGame, HiccupHelpers } from './PipActivities';
import { BunnyCheck, ComfortPlan, PretendShot } from './PrickleActivities';
import { TissueGame, Wardrobe } from './WaddlesActivities';

/** Every mini-adventure, by id. Each patient lists the ones it offers in its definition. */
export const ACTIVITY_COMPONENTS: Record<ActivityId, ComponentType<{ api: ActivityApi }>> = {
  bubbles: BubbleGame,
  hiccupHelper: HiccupHelpers,
  wardrobe: Wardrobe,
  tissue: TissueGame,
  bunnyCheck: BunnyCheck,
  comfortPlan: ComfortPlan,
  pretendShot: PretendShot,
  soundMystery: SoundMystery,
  sockRescue: SockRescue,
};
