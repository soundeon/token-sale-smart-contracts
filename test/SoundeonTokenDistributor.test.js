import EVMRevert from './helpers/EVMRevert';
import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const SoundeonToken = artifacts.require('SoundeonToken');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SoundeonTokenDistributor = artifacts.require('SoundeonTokenDistributor');

contract('SoundeonTokenDistributor', async (accounts) => {
    let token;
    let sut;

    beforeEach(async () => {
        sut = await SoundeonTokenDistributor.new(ZERO_ADDRESS);
        token = SoundeonToken.at(await sut.token());
    });

    describe('transfer token ownership', async () => {
        it('should return ownership', async () => {
            await sut.transferTokenOwnership().should.be.fulfilled;
            (await token.owner()).should.be.equal(accounts[0]);
        });

        it('should fail to return ownership when called by not an owner', async () => {
            await sut.transferTokenOwnership({from: accounts[1]}).should.be.rejected;
            (await token.owner()).should.be.not.equal(accounts[0]);
        });
    });
});
