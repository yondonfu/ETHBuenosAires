const prompt = require("prompt-sync")()
const CommitRevealVote = artifacts.require("CommitRevealVote")

const VoterStatus = {
    NotRegistered: 0,
    NotCommitted: 1,
    Committed: 2,
    Revealed: 3
}

module.exports = async () => {
    console.log("Welcome to the commit reveal vote application!")

    const c = await CommitRevealVote.deployed()

    console.log(`Contract deployed at ${c.address}`)

    console.log("\n")

    const choice1 = await c.choice1.call()
    const choice2 = await c.choice2.call()

    if (await c.isCommitPhase.call()) {
        console.log("We are currently in the commit phase of the vote")
        console.log("All voters must submit commitments of their votes")

        console.log("\n")

        console.log("The available choices for this vote are:")
        console.log(`0 - ${choice1}`)
        console.log(`1 - ${choice2}`)

        console.log("\n")

        const opt = prompt("Please enter the option you would like to commit to: ")

        if (opt !== "0" && opt !== "1") {
            console.log(`Invalid voting option. Must select 0 or 1, but selected ${opt}`)
            return
        }

        const pass = prompt("Please enter a passphrase to be used to create your commitment (make sure to write this down): ")

        const commit = web3.sha3(opt + pass)

        console.log(`Submitting vote commitment: ${commit}`)

        await c.commitVote(commit)
    } else {
        const votesForChoice1 = await c.votesForChoice1.call()
        const votesForChoice2 = await c.votesForChoice2.call()

        console.log("We are currently in the reveal phase of the vote")
        console.log("All voters must reveal the votes corresponding to their previous commitments")

        console.log("\n")

        console.log("The available choices for this vote are:")
        console.log(`0 - ${choice1}: ${votesForChoice1} votes`)
        console.log(`1 - ${choice2}: ${votesForChoice2} votes`)

        console.log("\n")

        const totalVoters = await c.totalVoters.call()

        if (votesForChoice1.toNumber() + votesForChoice2.toNumber() == totalVoters.toNumber()) {
            const winner = await c.declareWinner()

            console.log(`Winning option: ${winner}`)
        } else {
            const opt = prompt("Please enter the option you would like to reveal: ")

            if (opt !== "0" && opt !== "1") {
                console.log(`Invalid voting option. Must select 0 or 1, but selected ${opt}`)
                return
            }

            const pass = prompt("Please enter the passphrase you used to create your commitment: ")

            const commit = web3.sha3(opt + pass)

            console.log(`Revealing vote with option ${opt} and commitment ${commit}`)

            await c.revealVote(opt + pass, commit)
        }
    }
}