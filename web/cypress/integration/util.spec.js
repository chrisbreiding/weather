import util from '../../src/lib/util'

describe('util', () => {
  context('.nearlyEqual', () => {
    it('works for positive numbers - true', () => {
      expect(util.nearlyEqual(1, 8)).to.be.true
      expect(util.nearlyEqual(8, 1)).to.be.true
    })

    it('works for positive numbers - false', () => {
      expect(util.nearlyEqual(1, 12)).to.be.false
      expect(util.nearlyEqual(12, 1)).to.be.false
    })

    it('works for negative numbers - true', () => {
      expect(util.nearlyEqual(-1, -8)).to.be.true
      expect(util.nearlyEqual(-8, -1)).to.be.true
    })

    it('works for negative numbers - false', () => {
      expect(util.nearlyEqual(-1, -12)).to.be.false
      expect(util.nearlyEqual(-12, -1)).to.be.false
    })

    it('works for mixed numbers - true', () => {
      expect(util.nearlyEqual(3, -3)).to.be.true
      expect(util.nearlyEqual(-3, 3)).to.be.true
    })

    it('works for mixed numbers - false', () => {
      expect(util.nearlyEqual(8, -8)).to.be.false
      expect(util.nearlyEqual(-8, 8)).to.be.false
    })
  })
})
