const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
  // the protocol treats everything as an ERC20 token
  await getWeth;
  const { deployer } = await getNamedAccounts();
  //  ABI, Address

  // Lending Pool Address Provider : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
  // Lending Pool : ^
  const landingPool = await getLendingPool(deployer);
  console.log(`landingPool address ${landingPool.address}`);

  // Deposit
  const wethTokenAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
  // approve
  await approveErc20(wethTokenAddress, landingPool.address, AMOUNT, deployer);
  console.log("Depositing....");
  await landingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Deposited!");
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    landingPool,
    deployer
  );
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  console.log(`You can borrow ${amountDaiToBorrow} from DAI`);
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );
  // Borrew time

  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await borrowDai(daiTokenAddress, landingPool, amountDaiToBorrowWei, deployer);
  await getBorrowUserData(landingPool,deployer)
}

async function borrowDai(
  daiAddress,
  landingPool,
  amountDaiToBorrowWei,
  account
) {
  const borrowtx = await landingPool.borrow(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    0,
    account
  );
  await borrowtx.wait(1);
  console.log("You've borrowed");
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH ${price.toString()}`);
  return price;
}

async function getBorrowUserData(landingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await landingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH Deposited`);
  console.log(`You have ${totalDebtETH} worth of ETH Borrowed`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH `);

  return { totalDebtETH, availableBorrowsETH };
}

async function getLendingPool(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20 = await ethers.getContractAt("IERC20", erc20Address, account);
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Apporve");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
