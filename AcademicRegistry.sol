pragma solidity ^0.4.16;

contract AcademicRegistry {
    address admin;
    enum Permissions {
        CanEnrollCandidate,
        CanUpdateProgram,
        CanUpdateUnits,
        CanUpdateStaff,
        CanClearCandidate,
        CanRegisterCandidateUnits,
        CanMarkUnits,
        CanUpdateFees
    } Permissions userPermissions;
    struct Unit {
        uint code;
        string name;
    }
    struct Program {
        uint code;
        string name;
        uint requiredMiniumUnits;
        uint totalCost;
        uint requiredMinimumDuration;
        Unit[] units;
    }
    struct CandidateUnit {
        bool passed;
        uint unit_code;
        bool marked;
    }
    struct Candidate {
        uint admissionNumber;
        string name;
        uint admissionDate;
        uint totalFeesPaid;
        uint passedUnits;
        uint totalUnits;
        bool clearedByAdmin;
        mapping(uint=>CandidateUnit) unitsTaken;
        mapping(uint=>Program) program;
        string certificate;
        uint idNumber;
    }
    struct Staff {
        address member;
        string name;
        uint memberSince;
        mapping(bytes32=>bytes32) permissions;
    }
    
    mapping(uint => Candidate) public candidates;
    mapping(address => Staff) public staffs;
    mapping(uint => Program) public programs;
    mapping(uint => Unit) public units;
    mapping(uint => CandidateUnit) public candidateUnits;
    mapping(uint => uint) public idNumbers;
    uint[] public candidatesList;
    address[] public staffAddresses;
    uint[] public programList;
    uint[] public unitsList;
    
    // Store record counts to facilitate autogenerated codes
    uint candidateCount;
    uint unitsCount;
    uint programCount;
    uint staffCount;
    
    function AcademicRegistry() public {
        // Set the default admin and add as first staff
        admin = msg.sender;
        addSuperAdmin(admin, "Super admin", 0, Permissions.CanUpdateStaff);
    }
    // Roles and permission modifiers
    modifier isAdmin() {
        // Ensure only the contract owner or super admin executes a function
        if (admin != msg.sender) {
            revert();
        }
        _;
    }
    
    modifier hasPermission(Permissions permission) {
        // Ensure user has permission to perform a function
        bytes32 staffPermission = staffs[msg.sender].permissions[keccak256(permission)];
        if (staffPermission != keccak256(permission)) {
            revert();
        }
        _;
    }
    
    // Track changes
    event TrackStaffChanges(string _msg, string _name, address _subject);
    event TrackCandidateChanges(string _msg, string _name, uint _subject);
    event TrackProgramChanges(string _msg, string _subject);
    
    function addSuperAdmin(
        address memberAddress, 
        string name, 
        uint memberSince, 
        Permissions permission
    ) public isAdmin returns(bool)
    {
        // Add a new staff member and give roles
        Staff storage adminMember = staffs[memberAddress];
        adminMember.member = memberAddress;
        adminMember.name = name;
        adminMember.memberSince = memberSince;
        adminMember.permissions[keccak256(permission)] = keccak256(permission);
        staffCount++;
        
        staffAddresses.push(memberAddress);
        TrackStaffChanges("Staff added", name, memberAddress);
        return true;
    }
    
    function addStaff(
        address memberAddress, 
        string name, 
        uint memberSince, 
        Permissions permission
    ) public hasPermission(Permissions.CanUpdateStaff) returns(bool)
    {
        // Add a new staff member and give roles
        Staff storage adminMember = staffs[memberAddress];
        adminMember.member = memberAddress;
        adminMember.name = name;
        adminMember.memberSince = memberSince;
        adminMember.permissions[keccak256(permission)] = keccak256(permission);
        staffCount++;
        
        staffAddresses.push(memberAddress);
        TrackStaffChanges("Staff added", name, memberAddress);
        return true;
    }
    
    // Allow admin to update staff permissions
    function updatePermissions(address memberAddress, Permissions permission) hasPermission(Permissions.CanUpdateStaff) public returns(bool) {
        Staff storage adminMember = staffs[memberAddress];
        adminMember.permissions[keccak256(permission)] = keccak256(permission);
        TrackStaffChanges("Staff permission updated", adminMember.name, memberAddress);
        return true;
    }
    
    function addProgram(
        string name,
        uint requiredMiniumUnits,
        uint requiredMinimumDuration,
        uint totalCost
    ) public hasPermission(Permissions.CanUpdateProgram) returns (bool)
    {
        uint code = programCount+1;
        Program storage program = programs[code];
        program.code = code;
        program.name = name;
        program.requiredMiniumUnits = requiredMiniumUnits;
        program.requiredMinimumDuration = requiredMinimumDuration;
        program.totalCost = totalCost;
        
        programList.push(code);
        programCount++;
        TrackProgramChanges("New program added", name);
        return true;
    }

    function addUnits(string name) public hasPermission(Permissions.CanUpdateUnits) returns(bool) {
        uint code = unitsCount+1;
        Unit storage unit = units[code];
        unit.code = code;
        unit.name = name;
        
        unitsList.push(code);
        unitsCount++;
        TrackProgramChanges("New unit added", name);
        return true;
    }

    function appendUnitToProgram(uint unitCode, uint programCode) public  hasPermission(Permissions.CanUpdateProgram) returns(bool) {
        require(programs[programCode].code == programCode);
        require(units[unitCode].code == unitCode);
        
        // Add unit to program units list
        Program storage program = programs[programCode];
        program.units.push(units[unitCode]);
        
        TrackProgramChanges("New unit added to program", units[unitCode].name);
        return true;
    }

    function clearCandidate(uint admissionNumber, bool cleared) public hasPermission(Permissions.CanClearCandidate) returns(bool) {
        require(candidates[admissionNumber].admissionNumber == admissionNumber);
        require(candidate.program[0].totalCost <= candidate.totalFeesPaid);
        require(candidate.passedUnits >= candidate.program[0].requiredMiniumUnits);

        Candidate storage candidate = candidates[admissionNumber];
        candidate.clearedByAdmin = cleared;

        if (candidate.clearedByAdmin) {
            issueCertificate(admissionNumber);
        }
        
        TrackCandidateChanges("Candidate cleared", candidate.name, admissionNumber);
        return true;
    }
    
    function enrollCandidate(
        string name,
        uint admissionDate,
        uint totalFeesPaid,
        uint programCode,
        uint idNumber
    ) public hasPermission(Permissions.CanEnrollCandidate) returns(bool)
    {
        // Ensure program is available before assignment
        require(programs[programCode].code == programCode);
        // Ensure no duplicate idNumber
        require(idNumbers[idNumber] != idNumber);
        
        uint admissionNumber = candidateCount+1;
        
        Candidate storage candidate = candidates[admissionNumber];
        candidate.admissionNumber = admissionNumber;
        candidate.name = name;
        candidate.admissionDate = admissionDate;
        candidate.totalFeesPaid = totalFeesPaid;
        candidate.clearedByAdmin = false;
        candidate.program[0] = programs[programCode];
        candidate.idNumber = idNumber;
        
        candidatesList.push(admissionNumber);
        idNumbers[idNumber] = idNumber;
        candidateCount++;
        TrackCandidateChanges("Candidate enrolled", candidate.name, admissionNumber);
        return true;
    }

    function registerCandidateUnits(
        uint admissionNumber,
        uint unitCode
    ) public hasPermission(Permissions.CanRegisterCandidateUnits) returns (bool)
    {
        require(units[unitCode].code == unitCode);
        require(candidates[admissionNumber].admissionNumber == admissionNumber);
        
        Candidate storage candidate = candidates[admissionNumber];
        require(candidate.program[0].totalCost <= candidate.totalFeesPaid);
        // Ensure the unit is not registered twice
        if (candidate.unitsTaken[unitCode].unit_code == unitCode) {
            revert();
        }
    
        CandidateUnit storage candidateUnit = candidateUnits[unitCode];
        candidateUnit.passed = false;
        candidateUnit.unit_code = unitCode;
        
        candidate.unitsTaken[unitCode] = candidateUnit;
        candidate.totalUnits++;
        
        TrackCandidateChanges("Candidate register unit ", units[unitCode].name,  admissionNumber);
        return true;
    }

    function markUnits(
        uint admissionNumber,
        uint unitCode,
        bool passed
    )  public hasPermission(Permissions.CanMarkUnits) returns (bool)
    {
        // Temporary use marked flag to avoid double marking so we can implement the passedUnits increment
        // TODO: Find a better of updating this case
        require(units[unitCode].code == unitCode);
        require(candidates[admissionNumber].admissionNumber == admissionNumber);
        
        Candidate storage candidate = candidates[admissionNumber];
        candidate.unitsTaken[unitCode].passed = passed;
        if (passed) {
            candidate.passedUnits++;
        } else if (!passed && candidates[admissionNumber].unitsTaken[unitCode].marked) {
            candidate.passedUnits--;
        }
        
        // Mark unit as marked
        candidate.unitsTaken[unitCode].marked = true;

        if (
            (candidate.program[0].totalCost <= candidate.totalFeesPaid)&&
            (candidate.clearedByAdmin)&&
            (candidates[admissionNumber].admissionNumber == admissionNumber)&&
            (candidate.passedUnits >= candidate.program[0].requiredMiniumUnits)
        ) {
            issueCertificate(admissionNumber);
        }
        
        TrackCandidateChanges("Units marked", candidate.name, admissionNumber);
        return true;
    }
    
    function issueCertificate(uint admissionNumber) public returns (bool) {
        // Automatically executed when all conditions have been met
        Candidate storage candidate = candidates[admissionNumber];
    
        // Validate if student meets requirement
        require(candidate.program[0].totalCost <= candidate.totalFeesPaid);
        require(candidate.clearedByAdmin);
        require(candidates[admissionNumber].admissionNumber == admissionNumber);
        require(candidate.passedUnits >= candidate.program[0].requiredMiniumUnits);
        
        candidate.certificate = "Processing..";
        TrackCandidateChanges("Certificate issued to candidate", candidate.name, admissionNumber);
        return true;
    }
    
    function updateCertDocumentHash(uint admissionNumber, string certificateHash) public returns (string) {
        Candidate storage candidate = candidates[admissionNumber];
        candidate.certificate = certificateHash;
        return certificateHash;
    }
    
    function updateFeesPaid(
        uint admissionNumber,
        uint amount
    ) public hasPermission(Permissions.CanUpdateFees) returns(bool)
    {
        Candidate storage candidate = candidates[admissionNumber];
        if (candidate.program[0].totalCost > (candidate.totalFeesPaid + amount)) {
            // Ensure candidate does not pay more than what is required
            revert();
        }
        candidate.totalFeesPaid += amount;

        if (
            (candidate.program[0].totalCost <= candidate.totalFeesPaid)&&
            (candidate.clearedByAdmin)&&
            (candidates[admissionNumber].admissionNumber == admissionNumber)&&
            (candidate.passedUnits >= candidate.program[0].requiredMiniumUnits)
        ) {
            issueCertificate(admissionNumber);
        }
        
        TrackCandidateChanges("Fees updated for candidate", candidate.name, admissionNumber);
        return true;
    }
    
    // Public constant methods
    function getFeesBalance(uint admissionNumber) public constant returns(uint) {
        Candidate storage candidate = candidates[admissionNumber];
        return (candidate.program[0].totalCost - candidate.totalFeesPaid);
    }
    
    function getProgramUnitsCount(uint programCode) public constant returns(uint) {
        return programs[programCode].units.length;
    }
    
    function getProgramUnits(uint programCode, uint unitIndex) public constant returns(uint, string) {
        Unit storage unit = programs[programCode].units[unitIndex];
        return (unit.code, unit.name);
    }
    
    function getCandidateUnits(uint admissionNumber, uint unitCode) public constant returns(bool, bool, uint, string) {
        CandidateUnit storage candidateUnit = candidates[admissionNumber].unitsTaken[unitCode];
        Unit storage unit = units[candidateUnit.unit_code];
        return (candidateUnit.passed, candidateUnit.marked, candidateUnit.unit_code, unit.name);
    }

    function numberOfCandidateUnits(uint admissionNumber) public constant returns(uint) {
        // Get number of candidate units taken
        return candidates[admissionNumber].totalUnits;
    }
    
    function numberOfCandidates() public constant returns(uint) {
        // Get number of enrolled candidates
        return candidateCount;
    }
    
    function numberOfPrograms() public constant returns(uint) {
        // Get number of supported programs
        return programCount;
    }
    
    function numberOfStaff() public constant returns(uint) {
        // Get number of registed staff
        return staffCount;
    }
    
    function numberOfUnits() public constant returns(uint) {
        // Get number of supported program units
        return unitsCount;
    }

    function getCandidateProgram(uint admissionNumber) public constant returns (
        uint, string, uint, uint, uint
    ) {
        Program storage program = candidates[admissionNumber].program[0];
        return (program.code, program.name, program.requiredMiniumUnits, program.totalCost, program.requiredMinimumDuration);
    }
    
    function destroyContract() public isAdmin returns(bool) {
        selfdestruct(admin);
    }

    function () public payable {
     
    }
}