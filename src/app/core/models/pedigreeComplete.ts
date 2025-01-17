import { Pedigree } from './pedigree';

export interface PedigreeComplete {
  pedigree: Pedigree;
  siblings: Pedigree[];
  offsprings: Pedigree[];
  generation1: Pedigree[];
  generation2: Pedigree[];
  generation3: Pedigree[];
  generation4: Pedigree[];
}
