const BaseRepository = require('./BaseRepository');

class ActivityRepository extends BaseRepository {
  async getFeedingsByBabyId(babyId) {
    return await this.query(
      'SELECT * FROM feeding_activities WHERE baby_id = ? ORDER BY start_time DESC',
      [babyId]
    );
  }

  async createFeeding(feeding) {
    const sql = `INSERT INTO feeding_activities
      (baby_id, feeding_type, start_time, end_time, amount_ml, food_type, side, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    return await this.insert(sql, [
      feeding.babyId,
      feeding.feedingType,
      feeding.startTime,
      feeding.endTime || null,
      feeding.amountMl || null,
      feeding.foodType || null,
      feeding.side || null,
      feeding.notes || null
    ]);
  }

  async getById(feedingId) {
    return await this.getOne('SELECT * FROM feeding_activities WHERE id = ?', [feedingId]);
  }

  // You can add similar methods for sleep, diaper and health activities.
}

module.exports = ActivityRepository;