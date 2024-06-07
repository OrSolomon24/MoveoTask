const getRoleForUser = async (codeBlockId, ip, mentorStudentCollection) => {
    let role = 'mentor';
    const existingRecord = await mentorStudentCollection.findOne({ blockId: codeBlockId });

    if (existingRecord) {
        role = 'student';
    }

    const existingStudent = await mentorStudentCollection.findOne({
        blockId: codeBlockId,
        ip: ip,
        role: 'student'
    });

    return { role, existingStudent };
};

const insertMentorStudentRecord = async (codeBlockId, ip, role, mentorStudentCollection) => {
    await mentorStudentCollection.insertOne({
        blockId: codeBlockId,
        ip: ip,
        role: role
    });
};

module.exports = {
    getRoleForUser,
    insertMentorStudentRecord
};
