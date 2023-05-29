const { getNamedAccounts, ethers } = require("hardhat")

const AMOUNT = ethers.utils.parseEther("0.2")

async function getWeth() {
    const { deployer } = await getNamedAccounts();
    // 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9
    const iWeth = await ethers.getContractAt("IWeth","0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", deployer)

    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)

}

module.exports = { getWeth, AMOUNT } 