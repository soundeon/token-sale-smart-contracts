pragma solidity ^0.4.23;

import "./SoundeonTokenDistributor.sol";


contract SoundeonTokenMinter is SoundeonTokenDistributor {
    address public reserveFundAddress = 0x5C7F38190c1E14aDB8c421886B196e7072B6356E;
    address public artistManifestoFundAddress = 0xC94BBB49E139EAbA8Dc4EA8b0ae5066f9DFEEcEf;
    address public bountyPoolAddress = 0x252a30D338E9dfd30042CEfA8bbd6C3CaF040443;
    address public earlyBackersPoolAddress = 0x07478916c9effbc95b7D6C8F99E52B0fcC35a091;
    address public teamPoolAddress = 0x3B467C1bD8712aA1182eced58a75b755d0314a65;
    address public advisorsAndAmbassadorsAddress = 0x0e16D22706aB5b1Ec374d31bb3e27d04Cc07f9D8;

    constructor(SoundeonToken _token) SoundeonTokenDistributor(_token) public { }

    function bulkMint(uint32[] _payment_ids, address[] _receivers, uint256[] _amounts)
        external onlyOwner validateInput(_payment_ids, _receivers, _amounts) {
        uint totalAmount = 0;

        for (uint i = 0; i < _receivers.length; i++) {
            require(_receivers[i] != address(0));

            if (!processedTransactions[_payment_ids[i]]) {
                processedTransactions[_payment_ids[i]] = true;

                token.mint(_receivers[i], _amounts[i]);

                totalAmount += _amounts[i] / 65;
            }
        }

        require(token.mint(reserveFundAddress, totalAmount * 2));
        require(token.mint(artistManifestoFundAddress, totalAmount * 6));
        require(token.mint(bountyPoolAddress, totalAmount * 3));
        require(token.mint(teamPoolAddress, totalAmount * 14));
        require(token.mint(earlyBackersPoolAddress, totalAmount * 4));
        require(token.mint(advisorsAndAmbassadorsAddress, totalAmount * 6));
    }
}
