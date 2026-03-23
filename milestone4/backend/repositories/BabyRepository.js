const BaseRepository = require('./BaseRepository');

class BabyRepository extends BaseRepository {
  async getBabyById(babyId) {
    return await this.getOne('SELECT * FROM babies WHERE id = ?', [babyId]);
  }

  async getBabiesByUserId(userId) {
    return await this.query('SELECT * FROM babies WHERE user_id = ?', [userId]);
  }

  async createBaby(userId, babyData) {
    const sql = `INSERT INTO babies
      (user_id, name, date_of_birth, gender, weight_at_birth, blood_type, allergies, medical_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    return await this.insert(sql, [
      userId,
      babyData.name,
      babyData.dateOfBirth,
      babyData.gender || 'other',
      babyData.weightAtBirth || null,
      babyData.bloodType || null,
      babyData.allergies || null,
      babyData.medicalNotes || null
    ]);
  }

  async deleteBaby(babyId) {
    return await this.delete('DELETE FROM babies WHERE id = ?', [babyId]);
  }
}

module.exports = BabyRepository;