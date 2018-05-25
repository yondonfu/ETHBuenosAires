const CommitRevealVote = artifacts.require("CommitRevealVote")

const voters = [
    "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1",
    "0xffcf8fdee72ac11b5c542428b35eef5769c409f0"
]

const choice1 = "foo"
const choice2 = "bar"

const commitPhase = 500 

module.exports = function(deployer) {
    deployer.deploy(CommitRevealVote, voters, choice1, choice2, commitPhase)
}