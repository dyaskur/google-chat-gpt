import {isCurrentTimeInRange} from '../../src/utils/helpers'

it('should return true when current time is within the specified range', () => {
  // Mock the Date object
  const mockDate = new Date(2023, 0, 1, 14, 30) // 14:30
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

  // Test with range 9:00-17:00
  const result = isCurrentTimeInRange('09:00', '17:00')

  // Assert
  expect(result).toBe(true)

  // Restore the original Date
  jest.restoreAllMocks()
})

it('should return false when time range spans has same value', () => {
  // Mock the Date object
  const mockDate = new Date(2023, 0, 1, 12, 0) // 12:00
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

  // Test with range 00:00-00:00 (full 24 hours)
  const result = isCurrentTimeInRange('00:00', '00:00')

  // Assert
  expect(result).toBe(false)

  // Restore the original Date
  jest.restoreAllMocks()
})

it('should return true when current time is within a range that crosses midnight', () => {
  // Mock the Date object
  const mockDate = new Date(2023, 0, 1, 2, 30) // 02:30
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

  // Test with range 22:00-06:00
  const result = isCurrentTimeInRange('22:00', '06:00')

  // Assert
  expect(result).toBe(true)

  // Restore the original Date
  jest.restoreAllMocks()
})
