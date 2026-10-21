import type { PatientDefinition, PatientId } from '../types';
import { mochi } from './mochi';
import { pip } from './pip';
import { prickle } from './prickle';
import { waddles } from './waddles';

/** All patients, in waiting-room order. To add a patient, create a file like pip.ts and list it here. */
export const PATIENTS: readonly PatientDefinition[] = [pip, waddles, prickle, mochi];

export const PATIENT_BY_ID: Record<PatientId, PatientDefinition> = { pip, waddles, prickle, mochi };
