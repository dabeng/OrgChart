describe('Hybrid(horizontal + vertical) Chart', () => {

  const laolao = '.node:contains("Lao Lao")';
  const bomiao = '.node:contains("Bo Miao")';
  const sumiao = '.node:contains("Su Miao")';
  const hongmiao = '.node:contains("Hong Miao")';
  const lixin = '.node:contains("Li Xin")';
  const tiehua = '.node:contains("Tie Hua")';
  const heihei = '.node:contains("Hei Hei")';
  const pangpang = '.node:contains("Pang Pang")';
  const dandan = '.node:contains("Dan Dan")';

  beforeEach(() => {
    cy.visit('demo/drag-drop.html');
  });

  function dropNodeToAnother (sourceNode, targetNode) {
    const dataTransfer = new DataTransfer();
    cy.get(sourceNode).trigger('dragstart', { dataTransfer, force: true });
    cy.get(targetNode).trigger('drop', { dataTransfer, force: true });
  }

  it('drag lixin onto hongmiao', () => {
    dropNodeToAnother(lixin, hongmiao);
    cy.get(hongmiao).should(($node) => {
      expect($node.siblings('.nodes')).to.exist;
      expect($node.siblings('.nodes').find('.node:contains("Li Xin")')).to.exist;
    });
    cy.get(bomiao).should(($node) => {
      expect($node.siblings('.nodes')).not.to.exist;
    });
  });

  it('drag lixin onto heihei', () => {
    dropNodeToAnother(lixin, heihei);
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').find('.node').length).to.equal(3);
      expect($node.siblings('.nodes').find('.node:contains("Li Xin")')).to.exist;
    });
    cy.get(bomiao).should(($node) => {
      expect($node.siblings('.nodes')).not.to.exist;
    });
  });

  it('heihei onto hongmiao', () => {
    dropNodeToAnother(heihei, hongmiao);
    cy.get(hongmiao).should(($node) => {
      expect($node.siblings('.nodes')).to.exist;
      expect($node.siblings('.nodes').find('.node').length).to.equal(3);
      expect($node.siblings('.nodes').find('.node:contains("Hei Hei")')).to.exist;
    });
    cy.get(sumiao).should(($node) => {
      expect($node.siblings('.nodes').find('.node:contains("Tie Hua")')).to.exist;
    });
  });

  it('heihei onto bomiao', () => {
    dropNodeToAnother(heihei, bomiao);
    cy.get(bomiao).should(($node) => {
      expect($node.siblings('.nodes').find('.node').length).to.equal(4);
      expect($node.siblings('.nodes').find('.node:contains("Hei Hei")')).to.exist;
    });
    cy.get(sumiao).should(($node) => {
      expect($node.siblings('.nodes').find('.node:contains("Tie Hua")')).to.exist;
    });
  });

  it('pangpang onto heihei', () => {
    dropNodeToAnother(pangpang, heihei);
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').find('.node').length).to.equal(2);
      expect($node.siblings('.nodes').find('.node:contains("Pang Pang")')).to.exist;
    });
  });

  it('dandan onto heihei', () => {
    dropNodeToAnother(dandan, heihei);
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').find('.node').length).to.equal(2);
      expect($node.siblings('.nodes').find('.node:contains("Dan Dan")')).to.exist;
    });
  });

  it('pangpang onto dandan', () => {
    dropNodeToAnother(pangpang, dandan);
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').find('.node')).to.exist;
      expect($node.siblings('.nodes').find('.node:contains("Dan Dan")')).to.exist;
    });
    cy.get(dandan).should(($node) => {
      expect($node.siblings('.nodes').find('.node')).to.exist;
      expect($node.siblings('.nodes').find('.node:contains("Pang Pang")')).to.exist;
    });
  });

  it('heihei onto pangpang', () => {
    dropNodeToAnother(heihei, pangpang);
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').find('.node').length).to.equal(2);
      expect($node.siblings('.nodes').find('.node:contains("Pang Pang")')).to.exist;
      expect($node.siblings('.nodes').find('.node:contains("Dan Dan")')).to.exist;
    });
  });

  it('hongmiao onto lixin', () => {
    dropNodeToAnother(hongmiao, lixin);
    cy.get(laolao).should(($node) => {
      expect($node.siblings('.nodes').children('.hierarchy:contains("Hong Miao")')).to.exist;
    });
    cy.get(lixin).should(($node) => {
      expect($node.siblings('.nodes').find('.node:contains("Hong Miao")')).not.to.exist;
    });
  });

});