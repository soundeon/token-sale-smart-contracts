pragma solidity ^0.4.23;

import "./SoundeonToken.sol";

contract SoundeonTokenDistributor is Ownable {
    SoundeonToken public token;

    mapping(uint32 => bool) public processedTransactions;

    constructor(SoundeonToken _token) public {
        token = _token == address(0x0) ? new SoundeonToken() : _token;
    }

    function isTransactionSuccessful(uint32 id) external view returns (bool) {
        return processedTransactions[id];
    }

    modifier validateInput(uint32[] _payment_ids, address[] _receivers, uint256[] _amounts) {
        require(_receivers.length == _amounts.length);
        require(_receivers.length == _payment_ids.length);

        _;
    }

    function transferTokenOwnership() external onlyOwner {
        token.transferOwnership(owner);
    }
}
