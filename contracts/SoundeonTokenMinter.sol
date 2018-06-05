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
        bool success = false;

        for (uint i = 0; i < _receivers.length; i++) {
            require(_receivers[i] != address(0));

            if (!processedTransactions[_payment_ids[i]]) {
                uint onePercent = _amounts[i] / 65;

                success = token.mint(_receivers[i], _amounts[i]);
                success = success && token.mint(reserveFundAddress, onePercent * 2);
                success = success && token.mint(artistManifestoFundAddress, onePercent * 6);
                success = success && token.mint(bountyPoolAddress, onePercent * 3);
                success = success && token.mint(teamPoolAddress, onePercent * 14);
                success = success && token.mint(earlyBackersPoolAddress, onePercent * 4);
                success = success && token.mint(advisorsAndAmbassadorsAddress, onePercent * 6);

                require(success);

                processedTransactions[_payment_ids[i]] = true;
            }
        }
    }
}
