const { UserRole } = require('../constants/constants');

const getRoleForUser = async (codeBlockId, ip, mentorStudentCollection) => {
    console.log(`getRoleForUser called with codeBlockId: ${codeBlockId}, ip: ${ip}`);
    try {
        let role = UserRole.MENTOR;
        const existingRecord = await mentorStudentCollection.findOne({ blockId: codeBlockId });
        console.log('Existing record:', existingRecord);

        if (existingRecord) {
            role = UserRole.STUDENT;
        }

        const existingStudent = await mentorStudentCollection.findOne({
            blockId: codeBlockId,
            ip: ip,
            role: UserRole.STUDENT
        });
        console.log('Existing student:', existingStudent);

        return { role, existingStudent };
    } catch (error) {
        console.error('Error in getRoleForUser:', error);
        throw new Error('Failed to get role for user');
    }
};

const insertMentorStudentRecord = async (codeBlockId, ip, role, mentorStudentCollection) => {
    console.log(`insertMentorStudentRecord called with codeBlockId: ${codeBlockId}, ip: ${ip}, role: ${role}`);
    try {
        await mentorStudentCollection.insertOne({
            blockId: codeBlockId,
            ip: ip,
            role: role
        });
        console.log('Mentor-student record inserted successfully');
    } catch (error) {
        console.error('Error in insertMentorStudentRecord:', error);
        throw new Error('Failed to insert mentor-student record');
    }
};

module.exports = {
    getRoleForUser,
    insertMentorStudentRecord
};
