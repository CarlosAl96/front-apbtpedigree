import { Pedigree } from '../../core/models/pedigree';
import { PedigreeComplete } from '../../core/models/pedigreeComplete';

export const fullnameTransform = (pedigree: PedigreeComplete) => {
  pedigree.pedigree.fullname = buildFullName(
    pedigree.pedigree.beforeNameTitles,
    pedigree.pedigree.name,
    pedigree.pedigree.afterNameTitles
  );

  pedigree.offsprings = pedigree.offsprings.map((offspring) => {
    offspring.fullname = buildFullName(
      offspring.beforeNameTitles,
      offspring.name,
      offspring.afterNameTitles
    );
    offspring.father_fullname = buildFullName(
      offspring.father_beforeNameTitles,
      offspring.father_name,
      offspring.father_afterNameTitles
    );
    offspring.mother_fullname = buildFullName(
      offspring.mother_beforeNameTitles,
      offspring.mother_name,
      offspring.mother_afterNameTitle
    );
    return offspring;
  });

  pedigree.siblings = pedigree.siblings.map((sibling) => {
    sibling.fullname = buildFullName(
      sibling.beforeNameTitles,
      sibling.name,
      sibling.afterNameTitles
    );
    sibling.father_fullname = buildFullName(
      sibling.father_beforeNameTitles,
      sibling.father_name,
      sibling.father_afterNameTitles
    );
    sibling.mother_fullname = buildFullName(
      sibling.mother_beforeNameTitles,
      sibling.mother_name,
      sibling.mother_afterNameTitle
    );
    return sibling;
  });

  const generations = [
    'generation1',
    'generation2',
    'generation3',
    'generation4',
  ] as const;

  generations.forEach((generation) => {
    pedigree[generation] = pedigree[generation].map((parent) => {
      if (parent) {
        parent.fullname = buildFullName(
          parent.beforeNameTitles,
          parent.name,
          parent.afterNameTitles
        );
      }
      return parent;
    });
  });

  return pedigree;
};

export const fullnameTransformPedigreeList = (pedigrees: Pedigree[]) => {
  pedigrees = pedigrees.map((pedigree) => {
    pedigree.fullname = buildFullName(
      pedigree.beforeNameTitles,
      pedigree.name,
      pedigree.afterNameTitles
    );

    return pedigree;
  });

  return pedigrees;
};

const buildFullName = (
  before: string | null | undefined,
  name: string | null | undefined,
  after: string | null | undefined
): string | null => {
  if (!name) {
    return null;
  } else {
    return `${before && before !== 'null' ? before + ' ' : ''}${name}${
      after && after !== 'null' ? ' ' + after : ''
    }`;
  }
};
