const RPC = require("../util/rpc")

module.exports = async () => {
    const rpc = new RPC(web3)

    await rpc.wait(100)
}
