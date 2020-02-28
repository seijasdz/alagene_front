'use strict';
const gff = require('@gmod/gff').default;

const makeGeneFeature = (seq_id, number, gene) => {
  return makeFeature(
    seq_id,
    'gene',
    gene.ss[0],
    gene.ss[1],
    null,
    { ID: ['gene' + number]},
  );
};

const makeRNAFeature = (seq_id, number, rna) => {
  return makeFeature(
    seq_id,
    'mRNA',
    rna.ss[0],
    rna.ss[1],
    null,
    { ID: ['rna' + number], parent: ['gene' + number] },
  );
};

const makeFeature = (seq_id, type, start, end, phase, attributes) => {
  return {
    seq_id,
    source: 'alagene',
    type,
    start,
    end,
    score: null,
    strand: '+',
    phase,
    attributes,
    child_features: [],
    derived_features: [],
  }
};

const makeGff = (pre) => {
  const features = [
    { directive: "gff-version",  value: 3}
  ]
  let geneC = 0;
  let cdsC = 0;
  let exonC = 0;
  let binC = 0;

  if (pre.result && pre.result.genes) {
    for (const gene of pre.result.genes) {
      features.push(makeGeneFeature(pre.seq_id, geneC, gene));
      features.push(makeRNAFeature(pre.seq_id, geneC, gene)); // gene == mRNA
      geneC += 1;
      for (const binding of gene.binding) {
        features.push(makeFeature(pre.seq_id, 'TF_binding_site', binding, binding + 10, null, {ID: 'tfbs' + binC, parent: 'gene' + (geneC - 1)}))
        binC += 1
      }
      for (const ex of gene.exon) {
        features.push(makeFeature(pre.seq_id, 'exon', ex[0], ex[1], null, {ID: 'exon' + exonC, parent: 'mRNA' + (geneC - 1)}));
        exonC += 1
      }
      for (const cds of gene.cds) {
        features.push(makeFeature(pre.seq_id, 'cds', cds[0], cds[1], 0, {ID: 'cds' + cdsC, parent: 'rna' + (geneC - 1)}));
        cdsC += 1
      }
    } 
  }
  return gff.formatSync(features);
}
 
module.exports = {
  makeGff,  
}
