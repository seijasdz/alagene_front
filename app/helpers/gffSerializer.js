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
    { ID: ['rna' + number] },
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
  const features = []
  let geneC = 0;
  let cdsC = 0;
  let exonC = 0;

  if (pre.result && pre.result.genes) {
    for (const gene of pre.result.genes) {
      features.push(makeGeneFeature(pre.seq_id, geneC, gene));
      features.push(makeRNAFeature(pre.seq_id, geneC, gene)); // gene == mRNA
      geneC += 1;
      
      for (const ex of gene.exon) {
        features.push(makeFeature(pre.seq_id, 'exon', ex[0], ex[1], null, {ID: 'exon' + exonC}));
        exonC += 1
      }
      for (const cds of gene.cds) {
        features.push(makeFeature(pre.seq_id, 'cds', cds[0], cds[1], 0, {ID: 'cds' + cdsC}));
        cdsC += 1
      }
    } 
  }
  console.log(gff.formatSync(features))
}
 
module.exports = {
  makeGff,  
}
