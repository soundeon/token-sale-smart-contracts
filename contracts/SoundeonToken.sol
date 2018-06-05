pragma solidity ^0.4.0;

import "./base/CappedToken.sol";
import "./base/DetailedERC20.sol";
import "./base/StandardBurnableToken.sol";
import "./base/PausableToken.sol";


contract SoundeonToken is StandardBurnableToken, CappedToken, DetailedERC20, PausableToken  {
    constructor() CappedToken(10**27) DetailedERC20("Soundeon Token", "Soundeon", 18) public {
    }
}
