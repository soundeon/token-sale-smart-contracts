pragma solidity ^0.4.23;

import "./SoundeonTokenDistributor.sol";


contract SoundeonTokenSender is SoundeonTokenDistributor {
    constructor(SoundeonToken _token) SoundeonTokenDistributor(_token) public { }

    function bulkTransfer(uint32[] _payment_ids, address[] _receivers, uint256[] _amounts)
        external onlyOwner validateInput(_payment_ids, _receivers, _amounts) {

        for (uint i = 0; i < _receivers.length; i++) {
            if (!processedTransactions[_payment_ids[i]]) {
                require(token.transfer(_receivers[i], _amounts[i]));

                processedTransactions[_payment_ids[i]] = true;
            }
        }
    }

    function bulkTransferFrom(uint32[] _payment_ids, address _from, address[] _receivers, uint256[] _amounts)
        external onlyOwner validateInput(_payment_ids, _receivers, _amounts) {

        for (uint i = 0; i < _receivers.length; i++) {
            if (!processedTransactions[_payment_ids[i]]) {
                require(token.transferFrom(_from, _receivers[i], _amounts[i]));

                processedTransactions[_payment_ids[i]] = true;
            }
        }
    }

    function transferTokensToOwner() external onlyOwner {
        token.transfer(owner, token.balanceOf(address(this)));
    }
}
