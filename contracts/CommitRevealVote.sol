pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CommitRevealVote {
    using SafeMath for uint256;

    enum VoterStatus {
        NotRegistered,
        NotCommited,
        Committed,
        Revealed
    }

    struct Voter {
        bytes32 commit;
        VoterStatus status;
    }

    // Number of registered voters
    uint256 public totalVoters;
    // Registered voters
    mapping (address => Voter) public voters;
    // Choice 1 for the vote
    string public choice1;
    // Choice 2 for the vote
    string public choice2;
    // Number of votes for choice 1
    uint256 public votesForChoice1;
    // Number of votes for choice 2
    uint256 public votesForChoice2;
    // Timestamp for end of commit phase
    uint256 public commitPhaseEnd;

    modifier onlyVoter() {
        require(voters[msg.sender].status != VoterStatus.NotRegistered);
        _;
    }

    modifier beforeCommitPhase() {
        require(now < commitPhaseEnd);
        _;
    }

    modifier afterCommitPhase() {
        require(now >= commitPhaseEnd);
        _;
    }

    constructor(address[] _voters, string _choice1, string _choice2, uint256 _commitPhase) public {
        for (uint256 i = 0; i < _voters.length; i++) {
            voters[_voters[i]].status = VoterStatus.NotCommited;
        }

        totalVoters = _voters.length;
        choice1 = _choice1;
        choice2 = _choice2;
        commitPhaseEnd = now.add(_commitPhase);
    }

    function commitVote(bytes32 _commit) external onlyVoter beforeCommitPhase {
        require(
            voters[msg.sender].status == VoterStatus.NotCommited,
            "Voter is not in a NotCommited state"
        );

        voters[msg.sender].commit = _commit;
        voters[msg.sender].status = VoterStatus.Committed;
    }

    function revealVote(string _vote, bytes32 _commit) external onlyVoter afterCommitPhase {
        require(
            voters[msg.sender].status == VoterStatus.Committed,
            "Voter is not in a Commited state"
        );

        require(
            voters[msg.sender].commit == _commit,
            "Submitted commit does not match voter's previous commit"
        );

        bytes memory bytesVote = bytes(_vote);

        require(
            keccak256(bytesVote) == voters[msg.sender].commit,
            "Revealed vote does not match voter's previous commit"
        );

        if (bytesVote[0] == '0') {
            votesForChoice1 = votesForChoice1.add(1);
        } else if (bytesVote[0] == '1') {
            votesForChoice2 = votesForChoice2.add(1);
        } else {
            revert("Revealed vote did not encode a valid choice");
        }

        voters[msg.sender].status = VoterStatus.Revealed;
    }

    function declareWinner() public view returns (string) {
        if (votesForChoice1.add(votesForChoice2) < totalVoters) {
            return "Incomplete";
        } else if (votesForChoice1 > votesForChoice2) {
            return choice1;
        } else if (votesForChoice1 < votesForChoice2) {
            return choice2;
        } else if (votesForChoice1 == votesForChoice2) {
            return "Tie";
        }
    }

    function isCommitPhase() public view returns (bool)  {
        if (now < commitPhaseEnd) {
            return true;
        } else {
            return false;
        }
    }
}