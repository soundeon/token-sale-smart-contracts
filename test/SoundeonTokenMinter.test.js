const { BigNumber } = web3;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const SoundeonToken = artifacts.require('SoundeonToken');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SoundeonTokenMinter = artifacts.require('SoundeonTokenMinter');
const tokenMultiplier = new BigNumber(10).pow(18);

function calculateMintedAmount (amount) {
    return amount
        .plus(amount.dividedToIntegerBy(65).times(2))
        .plus(amount.dividedToIntegerBy(65).times(6))
        .plus(amount.dividedToIntegerBy(65).times(3))
        .plus(amount.dividedToIntegerBy(65).mul(14))
        .plus(amount.dividedToIntegerBy(65).mul(4))
        .plus(amount.dividedToIntegerBy(65).mul(6));
}

contract('SoundeonTokenMinter', (accounts) => {
    let token;

    let sut;
    const testData = {
        receivers: accounts.slice(1, 4),
        amounts: [new BigNumber(1111), new BigNumber(2222), new BigNumber(3333)],
        ids: [1, 2, 3]
    };
    const owner = accounts[0];

    beforeEach(async () => {
        sut = await SoundeonTokenMinter.new(ZERO_ADDRESS);
        token = SoundeonToken.at(await sut.token());
    });

    describe('when called not by an owner', () => {
        it('should fail to mint', async () => {
            await sut.bulkMint(testData.ids, testData.receivers, testData.amounts, {from: accounts[1]}).should.be.rejected;

            for (let index = 0; index < testData.receivers.length; index++) {
                (await token.balanceOf(testData.receivers[index])).should.bignumber.equal(0);
            }
        });

        it('should fail to return ownership', async () => {
            await sut.transferOwnership({from: accounts[1]}).should.be.rejected;
        });
    });

    describe('when created', async () => {
        it('should set pool addresses properly', async () => {
            (await sut.reserveFundAddress()).should.be.equal('0x5c7f38190c1e14adb8c421886b196e7072b6356e');
            (await sut.artistManifestoFundAddress()).should.be.equal('0xc94bbb49e139eaba8dc4ea8b0ae5066f9dfeecef');
            (await sut.bountyPoolAddress()).should.be.equal('0x252a30d338e9dfd30042cefa8bbd6c3caf040443');
            (await sut.earlyBackersPoolAddress()).should.be.equal('0x07478916c9effbc95b7d6c8f99e52b0fcc35a091');
            (await sut.teamPoolAddress()).should.be.equal('0x3b467c1bd8712aa1182eced58a75b755d0314a65');
            (await sut.advisorsAndAmbassadorsAddress()).should.be.equal('0x0e16d22706ab5b1ec374d31bb3e27d04cc07f9d8');
        });
    });

    describe('when owning a token', async () => {
        describe('mint', async () => {
            it('should mint corresponding amount of tokens', async () => {
                const amounts = testData.amounts.map(value => value.mul(tokenMultiplier));
                await sut.bulkMint(testData.ids, testData.receivers, amounts).should.be.fulfilled;

                for (let index = 0; index < testData.receivers.length; index++) {
                    (await token.balanceOf(testData.receivers[index])).should.bignumber.equal(amounts[index]);
                }
            });

            it('should mint tokens for each pool proportionally', async () => {
                let totalMintExpected = new BigNumber(0);

                await sut.bulkMint(testData.ids, testData.receivers, testData.amounts).should.be.fulfilled;

                for (let index = 0; index < testData.receivers.length; index++) {
                    totalMintExpected = totalMintExpected.plus(calculateMintedAmount(testData.amounts[index]));

                    (await token.balanceOf(testData.receivers[index])).should.bignumber.equal(testData.amounts[index]);
                }

                (await token.totalSupply()).should.bignumber.equal(totalMintExpected);
            });

            it('should fail to mint when called by not an owner', async () => {
                let totalMintExpected = 0;

                await sut.bulkMint(testData.ids, testData.receivers, testData.amounts, {from: accounts[1]}).should.be.rejected;

                for (let index = 0; index < testData.receivers.length; index++) {
                    totalMintExpected += testData.amounts[index];

                    (await token.balanceOf(testData.receivers[index])).should.bignumber.equal(0);
                }

                (await token.totalSupply()).should.bignumber.equal(0);
            });

            it('should check if all arrays contains the same number of items', async () => {
                let totalMintExpected = 0;

                await sut.bulkMint(testData.ids.slice(1)
                    , testData.receivers
                    , testData.amounts
                ).should.be.rejected;

                await sut.bulkMint(testData.ids
                    , testData.receivers.slice(1)
                    , testData.amounts
                ).should.be.rejected;

                await sut.bulkMint(testData.ids
                    , testData.receivers
                    , testData.amounts.slice(1)
                ).should.be.rejected;

                for (let index = 0; index < testData.receivers.length; index++) {
                    totalMintExpected += testData.amounts[index];

                    (await token.balanceOf(testData.receivers[index])).should.bignumber.equal(0);
                }
            });

            it('should check if receivers are zero addresses', async () => {
                await sut.bulkMint([4]
                    , [ZERO_ADDRESS]
                    , [444]
                ).should.be.rejected;
            });

            it('should fail, do not mint, nor record transaction as successful when called to mint more than cap', async () => {
                const txId = 4;
                const cap = (await token.cap()).toNumber();

                await sut.bulkMint(testData.ids, testData.receivers, testData.amounts).should.be.fulfilled;
                await sut.bulkMint([txId], [accounts[4]], [cap]).should.be.rejected;

                (await sut.isTransactionSuccessful(txId)).should.be.equal(false);
            });

            it('should be able to mint cap number of tokens in one transaction', async () => {
                const cap = new BigNumber(10).pow(25).times(65).toNumber();

                await sut.bulkMint([4], [accounts[4]], [cap]).should.be.fulfilled;

                (await token.balanceOf('0x5c7f38190c1e14adb8c421886b196e7072b6356e')).should.bignumber.equal(tokenMultiplier.times(new BigNumber("20000000")));
                (await token.balanceOf('0xc94bbb49e139eaba8dc4ea8b0ae5066f9dfeecef')).should.bignumber.equal(tokenMultiplier.times(new BigNumber("60000000")));
                (await token.balanceOf('0x252a30d338e9dfd30042cefa8bbd6c3caf040443')).should.bignumber.equal(tokenMultiplier.times(new BigNumber("30000000")));
                (await token.balanceOf('0x07478916c9effbc95b7d6c8f99e52b0fcc35a091')).should.bignumber.equal(tokenMultiplier.times(new BigNumber("40000000")));
                (await token.balanceOf('0x3b467c1bd8712aa1182eced58a75b755d0314a65')).should.bignumber.equal(tokenMultiplier.times(new BigNumber("140000000")));
                (await token.balanceOf('0x0e16d22706ab5b1ec374d31bb3e27d04cc07f9d8')).should.bignumber.equal(tokenMultiplier.times(new BigNumber("60000000")));
            });

            it('should record processed transactions', async () => {
                await sut.bulkMint(testData.ids, testData.receivers, testData.amounts).should.be.fulfilled;

                for (let index = 0; index < testData.receivers.length; index++) {
                    (await sut.isTransactionSuccessful(testData.ids[index])).should.be.equal(true);
                }
            });

            describe('should not process transaction with known id', async () => {
                it('when it supplied in different batches', async () => {
                    await sut.bulkMint([4], [accounts[4]], [1000]).should.be.fulfilled;
                    await sut.bulkMint([4], [accounts[4]], [1000]).should.be.fulfilled;
    
                    (await token.balanceOf(accounts[4])).should.bignumber.equal(1000);
                });

                it('when it supplied in the batch', async () => {
                    await sut.bulkMint([4, 4], [accounts[2], accounts[4]], [1000, 2222]).should.be.fulfilled;
    
                    (await token.balanceOf(accounts[2])).should.bignumber.equal(1000);
                });
            });
        });
    });
});