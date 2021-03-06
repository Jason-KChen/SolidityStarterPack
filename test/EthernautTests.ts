import { expect } from "chai";
import { ethers } from "hardhat";

describe("Fallback", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Fallback");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("FallbackSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address, {
      value: ethers.utils.parseEther("0.002"),
    });
    await deployedSolution.deployed();

    expect(await deployedChallenge.owner()).to.equal(deployedSolution.address);
  });
});

describe("Fallout", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Fallout");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("FalloutSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address);
    await deployedSolution.deployed();

    expect(await deployedChallenge.owner()).to.equal(deployedSolution.address);
  });
});

describe("CoinFlip", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("CoinFlip");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("CoinFlipSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address);
    await deployedSolution.deployed();

    const TOTAL_ITERATION = 100;
    let currentIter = 0;
    while ((await deployedChallenge.consecutiveWins()).lt(10)) {
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);

      const flipTxn = await deployedSolution.flip();
      await flipTxn.wait();

      currentIter += 1;
      if (currentIter > TOTAL_ITERATION) {
        throw Error("Taking too long");
      }
    }

    expect(await deployedChallenge.consecutiveWins()).to.equal(10);
    console.log(`We did ${currentIter} flips`);
  });
});

describe("Telephone", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Telephone");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("TelephoneSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address);
    await deployedSolution.deployed();

    expect(await deployedChallenge.owner()).to.equal(
      (await ethers.getSigners())[0].address
    );
  });
});

describe("Token", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Token");
    const deployedChallenge = await challenge.deploy(
      ethers.constants.AddressZero
    );
    await deployedChallenge.deployed();

    const currSigner = (await ethers.getSigners())[0].address;
    const currTokenCount = await deployedChallenge.balanceOf(currSigner);

    const transferTxn = await deployedChallenge.transfer(
      ethers.constants.AddressZero,
      currTokenCount.add("1")
    );
    await transferTxn.wait();

    expect(await deployedChallenge.balanceOf(currSigner)).to.be.gt(
      currTokenCount
    );
  });
});

describe("Delegation", function () {
  it("Solution", async function () {
    const delegate = await ethers.getContractFactory("Delegate");
    const challenge = await ethers.getContractFactory("Delegation");
    const deployedChallenge = await challenge.deploy(
      ethers.constants.AddressZero
    );
    await deployedChallenge.deployed();

    const entryPoint = await delegate.attach(deployedChallenge.address);
    const setOwnerTxn = await entryPoint.pwn();
    await setOwnerTxn.wait();

    expect(await deployedChallenge.owner()).to.be.eq(
      (await ethers.getSigners())[0].address
    );
  });
});

describe("Force", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Force");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("ForceSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address, {
      value: ethers.utils.parseEther("0.000001"),
    });
    await deployedSolution.deployed();

    expect(
      (await ethers.provider.getBalance(deployedChallenge.address)).gt(
        ethers.constants.Zero
      )
    ).to.be.eq(true);
  });
});

describe("Vault", function () {
  it("Solution", async function () {
    const PASSWORD = ethers.utils.formatBytes32String("poggers");
    const challenge = await ethers.getContractFactory("Vault");
    const deployedChallenge = await challenge.deploy(PASSWORD);
    await deployedChallenge.deployed();

    const password = await ethers.provider.getStorageAt(
      deployedChallenge.address,
      ethers.BigNumber.from("1")
    );

    const unlockTxn = await deployedChallenge.unlock(password);
    await unlockTxn.wait();

    expect(await deployedChallenge.locked()).to.be.eq(false);
  });
});

describe("King", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("King");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("KingSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address, {
      value: ethers.utils.parseEther("0.000001"),
    });
    await deployedSolution.deployed();

    const signer = (await ethers.getSigners())[0];
    const verifyTxn = signer.sendTransaction({
      from: signer.address,
      to: deployedChallenge.address,
      value: ethers.utils.parseEther("1"),
    });
    await expect(verifyTxn).to.be.revertedWith("Not giving up");

    expect(await deployedChallenge._king()).to.be.eq(deployedSolution.address);
  });
});

describe("Reentrance", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Reentrance");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const burnDonation = await deployedChallenge.donate(
      ethers.constants.AddressZero,
      {
        value: ethers.utils.parseEther("1"),
      }
    );
    await burnDonation.wait();

    const solution = await ethers.getContractFactory("ReentranceSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address);
    await deployedSolution.deployed();

    const hackTxn = await deployedSolution.hack({
      value: ethers.utils.parseEther("1"),
    });
    await hackTxn.wait();

    expect(
      (await ethers.provider.getBalance(deployedChallenge.address))
        .add(await ethers.provider.getBalance(deployedSolution.address))
        .eq(ethers.constants.Zero)
    ).to.be.eq(true);
  });
});

describe("Elevator", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Elevator");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("ElevatorSolution");
    const deployedSolution = await solution.deploy();
    await deployedSolution.deployed();

    const hackTxn = await deployedSolution.hack(deployedChallenge.address);
    await hackTxn.wait();

    expect(await deployedChallenge.top()).to.be.eq(true);
  });
});

describe("Privacy", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Privacy");
    const deployedChallenge = await challenge.deploy([
      ethers.utils.formatBytes32String("1"),
      ethers.utils.formatBytes32String("2"),
      ethers.utils.formatBytes32String("3"),
    ]);
    await deployedChallenge.deployed();

    // for (let i = 0; i <= 6; i++) {
    //   console.log(
    //     await ethers.provider.getStorageAt(deployedChallenge.address, i)
    //   );
    // }
    // console.log(ethers.utils.formatBytes32String("1"));
    // console.log(
    //   await deployedChallenge.look1([
    //     ethers.utils.formatBytes32String("1"),
    //     ethers.utils.formatBytes32String("1"),
    //     ethers.utils.formatBytes32String("1"),
    //   ])
    // );

    const unlockTxn = await deployedChallenge.unlock(
      (
        await ethers.provider.getStorageAt(deployedChallenge.address, 5)
      ).substring(0, 2 + 32)
    );
    await unlockTxn.wait();
  });
});

describe("GatekeeperTwo", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("GatekeeperTwo");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("GatekeeperTwoSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address);
    await deployedSolution.deployed();
  });
});

describe("NaughtCoin", function () {
  it("Solution", async function () {
    const signer = (await ethers.getSigners())[0];
    const challenge = await ethers.getContractFactory("NaughtCoin");
    const deployedChallenge = await challenge.deploy(signer.address);
    await deployedChallenge.deployed();

    const approveTxn = await deployedChallenge.approve(
      signer.address,
      await deployedChallenge.balanceOf(signer.address)
    );
    await approveTxn.wait();

    const transferFromTxn = await deployedChallenge.transferFrom(
      signer.address,
      deployedChallenge.address,
      await await deployedChallenge.balanceOf(signer.address)
    );
    await transferFromTxn.wait();

    const finalBalance = await deployedChallenge.balanceOf(signer.address);
    expect(finalBalance.isZero()).to.equal(true);
  });
});

describe("Preservation", function () {
  it("Solution", async function () {
    const [owner, player] = await ethers.getSigners();
    const library = await ethers.getContractFactory("LibraryContract");
    const deployedlibrary = await library.deploy();
    await deployedlibrary.deployed();

    const challenge = await ethers.getContractFactory("Preservation", owner);
    const deployedChallenge = await challenge.deploy(
      deployedlibrary.address,
      deployedlibrary.address
    );
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("PreservationSolution");
    const deployedSolution = await solution.deploy();
    await deployedSolution.deployed();

    const solveTxn = await deployedSolution
      .connect(player)
      .solve(deployedChallenge.address);
    await solveTxn.wait();
    expect(await deployedChallenge.owner()).to.equal(player.address);
  });
});

describe("AlienCodex", function () {
  it("Solution", async function () {
    const [owner, player] = await ethers.getSigners();
    const challenge = await ethers.getContractFactory("AlienCodex");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();
    expect(await deployedChallenge.owner()).to.equal(owner.address);

    const solution = await ethers.getContractFactory("AlienCodexSolution");
    const deployedSolution = await solution
      .connect(player)
      .deploy(deployedChallenge.address);
    await deployedSolution.deployed();

    expect(await deployedChallenge.owner()).to.equal(player.address);
  });
});

describe("Denial", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Denial");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("DenialSolution");
    const deployedSolution = await solution.deploy(deployedChallenge.address);
    await deployedSolution.deployed();

    const withdrawTxn = await deployedChallenge.withdraw({
      gasLimit: ethers.BigNumber.from("1000000"),
    });
    await withdrawTxn.wait();
  });
});

describe("Shop", function () {
  it("Solution", async function () {
    const challenge = await ethers.getContractFactory("Shop");
    const deployedChallenge = await challenge.deploy();
    await deployedChallenge.deployed();

    const solution = await ethers.getContractFactory("ShopSolution");
    const deployedSolution = await solution.deploy();
    await deployedSolution.deployed();

    const solveTxn = await deployedSolution.solve(deployedChallenge.address);
    await solveTxn.wait();

    expect(await deployedChallenge.isSold()).to.equal(true);
  });
});
