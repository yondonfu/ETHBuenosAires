const CommitRevealVote = artifacts.require("CommitRevealVote")
const expectThrow = require("./helpers/expectThrow")

const VoterStatus = {
    NotRegistered: 0,
    NotCommitted: 1,
    Committed: 2,
    Revealed: 3
}

contract("CommitRevealVote", accounts => {
    describe("constructor", () => {
        it("initializes state variables", async () => {
            const voters = accounts.slice(0, 4)
            const choice1 = "foo"
            const choice2 = "bar"
            const commitPhase = 60 * 60 * 5 

            const c = await CommitRevealVote.new(voters, choice1, choice2, commitPhase)

            for (let i = 0; i < voters.length; i++) {
                const voter = voters[i]
                const status = (await c.voters.call(voter))[1].toNumber()
                assert.equal(status, VoterStatus.NotCommitted, "wrong voter status")
            }

            assert.equal(await c.choice1.call(), choice1, "wrong choice 1")
            assert.equal(await c.choice2.call(), choice2, "wrong choice 2")
        })
    })

    let c

    beforeEach(async () => {
        const voters = accounts.slice(0, 4)
        const choice1 = "foo"
        const choice2 = "bar"
        const commitPhase = 60 * 60 * 5 

        c = await CommitRevealVote.new(voters, choice1, choice2, commitPhase)
    })

    describe("commitVote", () => {
        it("should fail if sender is not registered", async () => {
            await expectThrow(c.commitVote(web3.sha3("hello"), {from: accounts[5]}))
        })

        it("should set commit and status", async () => {
            const vote = "0" + web3.sha3("foo")
            const commit = web3.sha3(vote)
            await c.commitVote(commit, {from: accounts[0]})

            const voter = await c.voters.call(accounts[0])
            assert.equal(voter[0], commit, "wrong commit")
            assert.equal(voter[1], VoterStatus.Committed, "wrong voter status")
        })

        it("should fail if voter already committed", async () => {
            const vote = "0" + web3.sha3("foo")
            const commit = web3.sha3(vote)
            await c.commitVote(commit, {from: accounts[0]})

            await expectThrow(c.commitVote(commit, {from: accounts[0]}))
        })
    })
})