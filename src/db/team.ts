import {query} from './client'
import {SpaceUser} from '../types/team'

export async function getSpaceUser(spaceId: string, userId: number): Promise<SpaceUser> {
  try {
    const {rows} = await query(
      `SELECT teams.id, teams.name, teams_users.user_id FROM teams left JOIN teams_users ON teams.id = teams_users.team_id and teams_users.user_id = $2
         WHERE teams.integration_id = $1`,
      [spaceId, userId],
    )
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function addSpaceUser(spaceId: number, userId: number) {
  try {
    const {rows} = await query(`INSERT INTO teams_users (team_id, user_id) VALUES ($1, $2) RETURNING *`, [
      spaceId,
      userId,
    ])
    return rows[0]
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
