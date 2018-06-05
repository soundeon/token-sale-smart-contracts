import EVMRevert from './helpers/EVMRevert';
import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const billion = new BigNumber(10).pow(9);
const tokenDecimals = new BigNumber(10).pow(18);
const SoundeonToken = artifacts.require('SoundeonToken');

contract('SoundeonToken', async (accounts) => {
    let sut;

    beforeEach(async () => {
        sut = await SoundeonToken.new();
    });

    it('should have predefined name, symbol, maximup cap and decimails', async () => {
        (await sut.cap()).should.bignumber.equal(billion.mul(tokenDecimals));
        (await sut.name()).should.be.equal("Soundeon Token");
        (await sut.symbol()).should.be.equal("Soundeon");
        (await sut.decimals()).should.bignumber.equal(18);
    });
});
